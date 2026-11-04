const { sequelize, User, Company, Task, TaskAsset, } = require('../models');
const { NotFoundError, BadRequestError, ForbiddenError, ConflictError, UnauthorizedError } = require('../utils/httpExceptions');
const { validateName, validateEmail, validatePassword } = require('../utils/authUtils');
const bcrypt = require('bcrypt');
const { validateRequiredText, validateOptionalText, validateOptionalUrl } = require('../utils/profileUtils');
const { websiteDomain, isSameOrSubdomain, isFreeEmailDomain, sameWebsite } = require('../utils/domainUtils');
const redis = require('../utils/redisClient');
const crypto = require('crypto');
const { queueVerificationEmail } = require('../queues/emailQueue');
const { VERIFICATION_STATUS, verificationCodeFormat } = require('../constants/authConstants');
const { checkTitle, checkDesc, checkEstHrs, checkTaskType, checkFile, checkDifficulty } =require('../utils/taskUtils');
const { TASK_STATUS, ASSET_TYPE, TASK_UPLOAD_DIR, AUTOMATION_FAILED, MAX_FILE_SIZE } = require('../constants/taskConstants');
const path = require('path');
const fs = require('fs/promises');
const { queueTaskCheck } = require('../queues/taskQueue');
const AdmZip = require('adm-zip');


async function fetchProfile(userId, options = {}) {
    const user = await User.findByPk(userId, {
        attributes: ['email', 'first_name', 'last_name', 'role', 'created_at'],
        include: {
            model: Company,
            attributes: ['name', 'website', 'description', 'verification_status'],
        },
        ...options,
    });

    if (!user || !user.Company) {
        throw new NotFoundError('Company profile not found');
    }
    return user;
}

/* Validate the code sent to the work email */
async function validateVerificationCode(userId, code) {
    if (typeof code !== 'string' || !verificationCodeFormat.test(code)) {
        throw new BadRequestError('Code must be 6 digits');
    }

    const key = `verify:${userId}`;
    const raw = await redis.get(key);

    if (!raw) {
        throw new BadRequestError('No active code, request a new one');
    }

    // sha256 is deterministic, same code hashed twice produces the exact same hash
    const pending = JSON.parse(raw);
    const providedCode = crypto.createHash('sha256').update(code).digest('hex');

    if (pending.hashedCode !== providedCode) {
        pending.attempts++;
        if (pending.attempts >= 3) {
            pending.hashedCode = null; // we gotta keep the data, only kill the code so that resend works
            await redis.set(key, JSON.stringify(pending), { KEEPTTL: true });
            throw new BadRequestError('Too many attempts, request a new code');
        }
        await redis.set(key, JSON.stringify(pending), { KEEPTTL: true });
        throw new BadRequestError(`Invalid code, ${3 - pending.attempts} attempt(s) left`);
    }

    const company = await Company.findOne({
        attributes: ['verification_status'],
        where: { user_id: userId },
    });
    if (!company) {
        throw new NotFoundError('Company profile not found');
    }
    if (company.verification_status === VERIFICATION_STATUS.VERIFIED) {
        await redis.del(key);
        throw new ConflictError('Company is already verified');
    }

    // The website is saved (and from now on locked) only once the email has been proven
    await Company.update(
        {
            website: pending.website,
            verification_status: VERIFICATION_STATUS.VERIFIED,
            description: sequelize.fn('COALESCE', pending.description, sequelize.col('description')),
        },
        { where: { user_id: userId } }
    );

    await redis.del(key);
    return { data: { verified: true } };
}

async function sendEmailVerif(userId, cleanEmail, website, description) {
    const code = crypto.randomInt(100000, 1000000).toString();
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    await redis.set(`verify:${userId}`, JSON.stringify({
        hashedCode,
        email: cleanEmail,
        website,
        description: description ?? null,
        attempts: 0,
    }), { EX: 900 });

    await queueVerificationEmail({ data: { email: 'tokoahari@gmail.com' }, code, type: 'company' });

    return { data: { verification_email_sent: true }};
}

module.exports = {
    companyProfile: async (userId) => {
        return { data: await fetchProfile(userId) };
    },

    // Partial update: only the fields that were sent are changed.
    // verification_status is deliberately NOT editable here (it must never come from the client).
    updatePassword: async (userId, currentPassword, newPassword) => {
        const cleanNewPassword = validatePassword(newPassword);

        const user = await User.findByPk(userId);
        const matches = user?.password_hash && typeof currentPassword === 'string'
            && await bcrypt.compare(currentPassword, user.password_hash);
        if (!matches) {
            throw new UnauthorizedError('Current password is incorrect');
        }

        if (await bcrypt.compare(cleanNewPassword, user.password_hash)) {
            throw new BadRequestError('New password must be different from your current password');
        }

        const hashNew = await bcrypt.hash(cleanNewPassword, 10);
        await user.update({ password_hash: hashNew, password_updated_at: new Date() });

        return { data: { password_updated: true } };
    },
    updateCompanyProfile: async (userId, input) => {
        const userChanges = {};
        const companyChanges = {};
        let lockedWebsiteResent = false;

        if (input.first_name !== undefined) userChanges.first_name = validateName(input.first_name, 'First name');
        if (input.last_name !== undefined) userChanges.last_name = validateName(input.last_name, 'Last name');
        if (input.name !== undefined) companyChanges.name = validateRequiredText(input.name, 'Company name', 160);
        if (input.description !== undefined) companyChanges.description = validateOptionalText(input.description, 'Description', 2000);

        if (input.website !== undefined) {
            const website = validateOptionalUrl(input.website, 'Website');
            const current = await Company.findOne({
                attributes: ['website', 'verification_status'],
                where: { user_id: userId },
            });
            if (!current) {
                throw new NotFoundError('Company profile not found');
            }

            if (current.verification_status !== VERIFICATION_STATUS.VERIFIED) {
                companyChanges.website = website;
            } else if (sameWebsite(website, current.website)) {
                // Locked once verified, but sending the same website back (e.g. the whole settings form) is fine.
                lockedWebsiteResent = true;
            } else {
                throw new ForbiddenError('Website cannot be changed after your company is verified');
            }
        }

        if (Object.keys(userChanges).length === 0 && Object.keys(companyChanges).length === 0) {
            if (lockedWebsiteResent) {
                // only the unchanged, locked website was sent: nothing to save
                return { data: await fetchProfile(userId) };
            }
            throw new BadRequestError('No changes provided');
        }

        await sequelize.transaction(async (t) => {
            if (Object.keys(userChanges).length > 0) {
                await User.update(userChanges, { where: { id: userId }, transaction: t });
            }
            if (Object.keys(companyChanges).length > 0) {
                const [rows] = await Company.update(companyChanges, { where: { user_id: userId }, transaction: t });
                if (rows === 0) throw new NotFoundError('Company profile not found');
            }
        });

        return { data: await fetchProfile(userId) };
    },

    // Tasks posted by this company, newest first.
    companyTasks: async (userId) => {
        const company = await Company.findOne({ where: { user_id: userId }, attributes: ['id'] });
        if (!company) {
            throw new NotFoundError('Company profile not found');
        }

        const tasks = await Task.findAll({
            where: { company_id: company.id },
            attributes: ['id', 'title', 'description', 'difficulty', 'estimated_hours', 'status', 'task_type', 'created_at', 'rejected_reason'],
            order: [['created_at', 'DESC'], ['id', 'DESC']],
        });

        return { data: tasks };
    },

    companyVerification: async (userId, website, workEmail, description) => {
        const company = await Company.findOne({
            attributes: ['website', 'verification_status'],
            where: { user_id: userId },
        });
        if (!company) {
            throw new NotFoundError('Company profile not found');
        }
        if (company.verification_status === VERIFICATION_STATUS.VERIFIED) {
            throw new ConflictError('Company is already verified');
        }

        if (typeof workEmail !== 'string') {
            throw new BadRequestError('Missing fields');
        }

        const cleanEmail = validateEmail(workEmail);

        // Website from the form, otherwise the one already saved on the profile
        const requestedWebsite = website === undefined ? null : validateOptionalUrl(website, 'Website');
        const cleanWebsite = requestedWebsite ?? company.website;
        if (!cleanWebsite) {
            throw new BadRequestError('Website is required');
        }

        const siteDomain = websiteDomain(cleanWebsite);
        if (!siteDomain) {
            throw new BadRequestError('Website must be a valid company domain');
        }

        const emailDomain = cleanEmail.split('@')[1];
        if (isFreeEmailDomain(emailDomain)) {
            throw new BadRequestError('Use your company work email, free email providers are not accepted');
        }
        if (!isSameOrSubdomain(emailDomain, siteDomain)) {
            throw new BadRequestError(`Work email must be on your company website's domain (${siteDomain})`);
        }

        const cleanDescription = description === undefined ? null : validateOptionalText(description, 'Description', 2000);

        await sendEmailVerif(userId, cleanEmail, cleanWebsite, cleanDescription);

        return { data: `verification code sent to the provided email` };
    },
    validateVerifCode: async (userId, code) => {
        return await validateVerificationCode(userId, code);
    },
    resendVerification: async (userId) => {
        const raw = await redis.get(`verify:${userId}`);
        if (!raw) {
            throw new BadRequestError('No pending verification, submit the form again');
        }

        // NX ensures we only create it once, if it already exists, don't
        // Returns null if they have re-send code less than 60 secs ago
        const cooldown = await redis.set(`resend-cooldown:${userId}`, '1', { NX: true, EX: 60 });

        if (!cooldown) {
            throw new BadRequestError('Please wait a minute before requesting a new code');
        }

        const pending = JSON.parse(raw);
        return await sendEmailVerif(userId, pending.email, pending.website, pending.description);
    },
    postTask: async (userId, taskTitle, taskDesc, taskType, difficulty, estimated_hours, file) => {
        checkFile(file);
        checkTaskType(taskType);
        checkDifficulty(difficulty);

        const title = checkTitle(taskTitle);
        const desc = checkDesc(taskDesc);
        const hrs = checkEstHrs(estimated_hours);

        const company = await Company.findOne({
            attributes: ['id'],
            where: { user_id: userId },
        });

        if (!company) {
           throw new NotFoundError('Company profile not found');
        }

        // if the file in zip is > 10 MB reject it
        let entries;
        try {
            entries = new AdmZip(file.buffer).getEntries();
        } catch (err) {
            throw new BadRequestError('File is not a valid zip');
        }

        for (const entry of entries) {
            if (entry.isDirectory) continue;
            if (entry.header.size > MAX_FILE_SIZE) {
               throw new BadRequestError(`${entry.entryName} is over 10 MB`);
            }
        }

        /**
         * Create random UUID for each zip so names don't collide
         * join it using path.join which gives us the full path to the file which we will insert into folder
         * mkdir will create a folder in which all zips will go
         * each zip then had to be written into the created folder.
         */
        const storedFilename = `${crypto.randomUUID()}.zip`;
        const fileForZip = path.join(TASK_UPLOAD_DIR, storedFilename);
        await fs.mkdir(TASK_UPLOAD_DIR, { recursive: true });
        await fs.writeFile(fileForZip, file.buffer);
        

        let taskCreated;
        try {
            taskCreated = await sequelize.transaction(async (t) => {
              const task = await Task.create(
                 {
                    company_id: company.id,
                    title,
                    description: desc,
                    difficulty,
                    estimated_hours: hrs,
                    status: TASK_STATUS.IN_REVIEW,
                    task_type: taskType,
                 }, { transaction: t });
            
              await TaskAsset.create(
                {
                    task_id: task.id,
                    original_filename: file.originalname,
                    stored_filename: storedFilename,
                    file_type: ASSET_TYPE.ZIP,
                }, { transaction: t });

            return task;
        });
        } catch(err) {
            await fs.rm(fileForZip, { force: true });
            throw err;
        }

        try {
            await queueTaskCheck({ taskId: taskCreated.id, storedFilename });
        } catch (err) {
            console.error(err);
            await Task.update(
                { status: TASK_STATUS.ESCALATED, rejected_reason: AUTOMATION_FAILED },
                { where: { id: taskCreated.id } }
            );
        }

        return { data: { fileStored: true, id: taskCreated.id }};
    },
    taskDetails: async (id) => {
        const testAsstes = await Task.findOne({
            attributes: ['status'],
            include: {
                model: TaskAsset,
                attributes: ['original_filename', 'task_id', 'file_type', 'uploaded_at'],
            },
            where: { id },
        })
       
        return { data: { task_assets: testAsstes }};
    },
};
