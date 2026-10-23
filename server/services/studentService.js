const { User, Student, sequelize } = require('../models');
const { BadRequestError } = require('../utils/httpExceptions');
const u = require('../us_universities.json');
const { validateEmail } = require('../utils/authUtils');
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
            await redis.del(key);
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
                attributes: ['university', 'graduation_year', 'verification_status', 'bio', 'github_url'],
            },
        });

        if (!user) {
            throw new BadRequestError(`Couldn't fetch your data.`);
        }

        return { data: user };
    },
    getUniveristyMatches: async (uni) => {
        const q = (uni ?? '').trim().toLowerCase();
        if (q.length < 3) return { data: [] }
        return { data: u.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 20) }
    },
    studentVerification: async (userId, university, gradYear, uniEmail, bio) => {
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
}
