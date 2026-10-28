const { sequelize, User, Student, Company } = require('../models');
const { validateName, validateEmail, validatePassword } = require('../utils/authUtils');
const { ConflictError, BadRequestError, UnauthorizedError } = require('../utils/httpExceptions');
const { validateRequiredText } = require('../utils/profileUtils');
const { generateToken } = require('./tokenService');
const bcrypt = require('bcrypt');
const { ROLE } = require('../constants/authConstants');

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

async function createAccount({ firstName, lastName, email, password, role, Profile, profileData = {} }) {
    const cleanFirstName = validateName(firstName, 'First name');
    const cleanLastName = validateName(lastName, 'Last name');
    const cleanEmail = validateEmail(email);
    const cleanPassword = validatePassword(password);

    const alreadyExists = await User.findOne({ where: { email: cleanEmail } });
    if (alreadyExists) {
        throw new ConflictError('Check your email to continue');
    }

    const hashPassword = await bcrypt.hash(cleanPassword, 10);

    let user;
    try {
        user = await sequelize.transaction(async (t) => {
            const newUser = await User.create({
                first_name: cleanFirstName,
                last_name: cleanLastName,
                email: cleanEmail,
                password_hash: hashPassword,
                role,
            }, { transaction: t });

            await Profile.create({
                user_id: newUser.id,
                ...profileData,
            }, { transaction: t });

            return newUser;
        });
    } catch (err) {
        if (err.name === 'SequelizeUniqueConstraintError') {
            throw new ConflictError('Check your email to continue');
        }
        throw err;
    }

    const token = generateToken(user);

    return { first_name: user.first_name, last_name: user.last_name, email: user.email, token };
}

async function login(email, password, expectedRole) {
    const cleanEmail = validateEmail(email);

    if (typeof password !== 'string' || password === '') {
        throw new BadRequestError('Password is required');
    }

    const user = await User.findOne({ where: { email: cleanEmail } });

    const passwordMatches = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);

    if (!user || !passwordMatches || user.role !== expectedRole) {
        throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken(user);

    return { first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role, token };
}

module.exports = {
    registerStudent: (firstName, lastName, email, password) =>
        createAccount({ firstName, lastName, email, password, role: ROLE.STUDENT, Profile: Student }),
    registerCompany: (firstName, lastName, email, password, companyName) =>
        createAccount({
            firstName, lastName, email, password, role: ROLE.COMPANY, Profile: Company,
            profileData: { name: validateRequiredText(companyName, 'Company name', 160) },
        }),
    loginStudent: (email, password) => login(email, password, ROLE.STUDENT),
    loginCompany: (email, password) => login(email, password, ROLE.COMPANY),
    passwordReset: async (email, currentPassword, newPassword) => {
        const cleanEmail = validateEmail(email);
        const cleanNewPassword = validatePassword(newPassword);

        const user = await User.findOne({ where: { email: cleanEmail } });
        const matches = user && currentPassword && await bcrypt.compare(currentPassword, user.password_hash);
        if (!matches) {
            throw new UnauthorizedError('Email or password is incorrect');
        }

        if (await bcrypt.compare(cleanNewPassword, user.password_hash)) {
            throw new BadRequestError('New password must be different from your current password');
        }

        const hashNew = await bcrypt.hash(cleanNewPassword, 10);
        await user.update({ password_hash: hashNew, password_updated_at: new Date() });
    },
    validateUser: async (userId) => {
        const user = await User.findByPk(userId);
        if (!user) {
            throw new UnauthorizedError('Unauthorized user');
        }

        return { data: { valid: true, role: user.role }};
    },
}
