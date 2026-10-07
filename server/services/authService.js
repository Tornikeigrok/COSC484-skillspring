const { sequelize, User, Student } = require('../models');
const { validateName, validateEmail, validatePassword } = require('../utils/authUtils');
const { ConflictError } = require('../utils/httpExceptions');
const { generateToken } = require('./tokenService');
const bcrypt = require('bcrypt');
const { ROLE } = require('../constants/authConstants');

//Start of New Code

// Used when no account matches the email, so a wrong email takes about as long
// to reject as a wrong password (this stops attackers from guessing which emails exist).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);
 
// Shared by student and business login: same users table, the role decides which door you use.
async function login(email, password, expectedRole) {
    const cleanEmail = validateEmail(email);
 
    if (typeof password !== 'string' || password === '') {
        throw new BadRequestError('Password is required');
    }
 
    const user = await User.findOne({ where: { email: cleanEmail } });
 
    const passwordMatches = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
 
    // One vague message for every failure, so the response never reveals which part was wrong.
    if (!user || !passwordMatches || user.role !== expectedRole) {
        throw new UnauthorizedError('Invalid email or password');
    }
 
    const token = generateToken(user);
 
    return { first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role, token };
}

//End of New Code

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

    //Added login functions
    loginStudent: (email, password) => login(email, password, ROLE.STUDENT),
    loginBusiness: (email, password) => login(email, password, ROLE.BUSINESS),
    /* loginStudent: async () => {
        
    }, */
}
