const companyService = require('../services/companyService');

module.exports = {
    getProfile: async (input) => ({
        statusCode: 200,
        data: await companyService.companyProfile(input.userId),
    }),

    updateProfile: async (input) => {
        const { userId, ...changes } = input;
        return {
            statusCode: 200,
            data: await companyService.updateCompanyProfile(userId, changes),
        };
    },
};
