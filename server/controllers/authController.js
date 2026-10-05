const authService = require('../services/authService');

module.exports = {
    registerStudent: async (input) => {
        const { token, ...user } = await authService.registerStudent(input.firstName, input.lastName, input.email, input.password);
        return {
            statusCode: 201,
            data: user,
            cookies: [{
                name: 'token',
                value: token,
                options: { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60 * 60 * 1000 },
            }],
        };
    },
    registerBusiness: async () => {
        // TODO
    },
    passwordReset: async () => {
        // TODO
    },
    loginStudent: async () => {
        // TODO
    }
};
