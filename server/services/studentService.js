const { User, Student, sequelize } = require('../models');
const { BadRequestError } = require('../utils/httpExceptions');
const u = require('../us_universities.json');
const { validateEmail } = require('../utils/authUtils');
const redis = require('../utils/redisClient');
const crypto = require('crypto');


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

        /* 
           Generate the code to send to the email, and before that save data in redis so when
           they come back, we remember all the data and to validate the code
         */
        const code = crypto.randomInt(100000, 100000).toString();
        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

        await redis.set(`verify:${userId}`, JSON.stringify({
            hashedCode,
            email: cleanEmail,
            university: validUni.name,
            gradYear: year,
            bio: bio ?? null,
            attempts: 0,
        }), { EX: 900 });


        // queue the email with the code here
    }
}

async function validateVerificationCode(userId, code) {
    const key = `verify:${userId}`;
    const raw = await redis.get(key);

    // This returns null in only one case: the key does not exist, thus it's expired
    if (!raw) {
        throw new BadRequestError('Code expired, request a new one');
    }

    // sha256 is deterministic, same code hashed twice produces the exact same hash
    const pending = JSON.parse(raw);
    const providedCode = crypto.createHash('sha256').update(code).digest('hex');
    if (pending.hashedCode !== providedCode) {
        pending.attempts++;
        if (pending.attempts >= 5) {
            await redis.del(key);
        } else {
            await redis.set(key, JSON.stringify(pending), { KEEPTTL: true });
        }
        throw new BadRequestError('Invalid code');
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
