const companyService = require('../services/companyService');

module.exports = {
    getProfile: async (input) => {
        return await companyService.companyProfile(input.userId);
    },
    updateProfile: async (input) => {
        return await companyService.updateCompanyProfile(input.userId, input);
    },
}
