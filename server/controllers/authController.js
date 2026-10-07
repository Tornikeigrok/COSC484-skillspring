const authService = require('../services/authService');

//Start of new code

const TOKEN_COOKIE_OPTIONS = { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 60 * 60 * 1000 };
 
function loginResponse({ token, ...user }) {
    return {
        statusCode: 200,
        data: user,
        cookies: [{ name: 'token', value: token, options: TOKEN_COOKIE_OPTIONS }],
    };
}

//End of new code

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
//Start of new login and logout

    loginStudent: async (input) => loginResponse(await authService.loginStudent(input.email, input.password)),
    loginBusiness: async (input) => loginResponse(await authService.loginBusiness(input.email, input.password)),
    logout: async () => ({
        statusCode: 200,
        data: { message: 'Logged out' },
        cookies: [{ name: 'token', value: '', options: { ...TOKEN_COOKIE_OPTIONS, maxAge: 0 } }],
    }),
};
