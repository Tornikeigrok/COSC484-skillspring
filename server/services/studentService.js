const { User, Student, sequelize } = require('../models');
const { BadRequestError, ConflictError, UnauthorizedError } = require('../utils/httpExceptions');
const u = require('../us_universities.json');
const { validateEmail, validatePassword } = require('../utils/authUtils');
const bcrypt = require('bcrypt');
const { validateOptionalText, validateRequiredText, validateOptionalUrl } = require('../utils/profileUtils');
const redis = require('../utils/redisClient');
const crypto = require('crypto');
const { queueVerificationEmail } = require('../queues/emailQueue');
const { VERIFICATION_STATUS, verificationCodeFormat } = require('../constants/authConstants');

/* Validate the code sent to the email */
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

    await Student.update(
        {
            university: pending.university,
            graduation_year: pending.gradYear,
            verification_status: VERIFICATION_STATUS.VERIFIED,
            bio: sequelize.fn('COALESCE', pending.bio, sequelize.col('bio')),
        },
        { where: { user_id: userId }}
    );

    await redis.del(key);
    return { data: { verified: true } };
}

// Skills replace the whole list: send the full array each time, [] clears it
function validateSkills(skills) {
    if (!Array.isArray(skills) || skills.length > 30) {
        throw new BadRequestError('Skills must be a list of up to 30 items');
    }
    const clean = skills.map((s) => validateRequiredText(s, 'Skill', 50));
    return [...new Set(clean)];
}

async function sendEmailVerif(userId, cleanEmail, uniName, year, bio) {
    const code = crypto.randomInt(100000, 1000000).toString();
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    await redis.set(`verify:${userId}`, JSON.stringify({
        hashedCode,
        email: cleanEmail,
        university: uniName,
        gradYear: year,
        bio: bio ?? null,
        attempts: 0,
    }), { EX: 900 });

    await queueVerificationEmail({ data: { email: cleanEmail }, code });

    return { data: { verification_email_sent: true }};
}

module.exports = {
    studentProfile: async (userId) => {
        const user = await User.findByPk(userId, {
            attributes: ['email', 'first_name', 'last_name', 'role', 'created_at'],
            include: {
                model: Student,
                attributes: ['university', 'graduation_year', 'verification_status', 'bio', 'github_url', 'skills'],
            },
        });

        if (!user) {
            throw new BadRequestError(`Couldn't fetch your data.`);
        }

        return { data: user };
    },
    updateProfile: async (userId, bio, githubUrl, skills) => {
        const changes = {};
        if (bio !== undefined) changes.bio = validateOptionalText(bio, 'Bio', 2000);
        if (githubUrl !== undefined) changes.github_url = validateOptionalUrl(githubUrl, 'GitHub URL');
        if (skills !== undefined) changes.skills = validateSkills(skills);

        if (Object.keys(changes).length === 0) {
            throw new BadRequestError('No changes provided');
        }

        await Student.update(changes, { where: { user_id: userId }});

        return module.exports.studentProfile(userId);
    },
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
    getUniveristyMatches: async (uni) => {
        const q = (uni ?? '').trim().toLowerCase();
        if (q.length < 3) return { data: [] }
        return { data: u.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 20) }
    },
    studentVerification: async (userId, university, gradYear, uniEmail, bio) => {
        const alreadyVerified = await Student.findOne({
            attributes: ['verification_status'],
            where: { user_id: userId }
        });
        if (alreadyVerified?.verification_status === VERIFICATION_STATUS.VERIFIED) {
            throw new ConflictError('User is already verified');
        }

        if (typeof university !== 'string' || typeof uniEmail !== 'string') {
            throw new BadRequestError('Missing fields');
        }
        
        const trimmedName = university.trim();
        const cleanEmail = validateEmail(uniEmail);
        const domainPart = cleanEmail.split('@')[1];
        const validUni = u.find((v) => v.name.toLowerCase() === trimmedName.toLowerCase());
        if (!validUni) {
            throw new BadRequestError('Invalid University');
        }
        
        if (!domainPart || !validUni.domains.some((v) => domainPart === v || domainPart.endsWith('.' + v))) {
            throw new BadRequestError('Invalid University email');
        }
        const currDate = new Date().getFullYear();
        const year = Number(gradYear);
        if (!Number.isInteger(year) || year < currDate || year > currDate + 4) {
            throw new BadRequestError('Invalid graduation year');
        }

        await sendEmailVerif(userId, cleanEmail, validUni.name, year, bio);

        return { data: `verification code sent to the provided email`}
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
        return await sendEmailVerif(userId, pending.email, pending.university, pending.gradYear, pending.bio);
    },
}

// Middleware that checks that each party is verified. But endpoints need to exist first so we can apply middleware to them
