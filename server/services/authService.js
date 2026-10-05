const { sequelize, User, Student } = require('../models');
const { validateName, validateEmail, validatePassword } = require('../utils/authUtils');
const { ConflictError } = require('../utils/httpExceptions');
const { generateToken } = require('./tokenService');
const bcrypt = require('bcrypt');
const { ROLE } = require('../constants/authConstants');

module.exports = {
    registerStudent: async (firstName, lastName, email, password) => {
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
            user = await sequelize.transaction(async (v) => {
                const createUser = await User.create({
                    first_name: cleanFirstName,
                    last_name: cleanLastName,
                    email: cleanEmail,
                    password_hash: hashPassword,
                    role: ROLE.STUDENT,
                }, { transaction: v } );

                await Student.create({
                    user_id: createUser.id,
                }, { transaction: v } );

                return createUser;
            });
        } catch (err) {
            if (err.name === 'SequelizeUniqueConstraintError') {
                throw new ConflictError('Check your email to continue');
            }
            throw err;
        }

        const token = generateToken(user);

        return { first_name: user.first_name, last_name: user.last_name, email: user.email, token };
    },
    registerBusiness: async () => {
        // TODO
    },
    passwordReset: async (email) => {
        // TODO
    },
    loginStudent: async () => {
        
    },
}
