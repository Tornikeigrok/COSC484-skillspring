const authService = require('../services/authService');
const { COOKIE_AGE } = require('../constants/authConstants');
const { authorizedResponse, TOKEN_COOKIE_OPTIONS } = require('../utils/authUtils');
 


module.exports = {
    registerStudent: async (input) =>
        authorizedResponse(await authService.registerStudent(input.firstName, input.lastName, input.email, input.password)),

    registerCompany: async (input) =>
        authorizedResponse(await authService.registerCompany(input.firstName, input.lastName, input.email, input.password, input.companyName)),

    passwordReset: async (input) => {
        await authService.passwordReset(input.email, input.currentPassword, input.newPassword);
    },

    loginStudent: async (input) => authorizedResponse(await authService.loginStudent(input.email, input.password)),

    loginCompany: async (input) => authorizedResponse(await authService.loginCompany(input.email, input.password)),
    
    logout: async () => ({
        statusCode: 200,
        data: { message: 'Logged out' },
        cookies: [{ name: 'token', value: '', options: { ...TOKEN_COOKIE_OPTIONS, maxAge: 0 } }],
    }),
    validateUser: async (input) => {
        return await authService.validateUser(input.userId);
    },
};
