const companyService = require('../services/companyService');

module.exports = {
    getProfile: async (input) => {
        return await companyService.companyProfile(input.userId);
    },
    updateProfile: async (input) => {
        return await companyService.updateCompanyProfile(input.userId, input);
    },
    getTasks: async (input) => {
        return await companyService.companyTasks(input.userId);
    },
    companyVerification: async (input) => {
        return await companyService.companyVerification(input.userId, input.website, input.workEmail, input.description);
    },
    validateVerificationCode: async (input) => {
        return await companyService.validateVerifCode(input.userId, input.code);
    },
    resendVerification: async (input) => {
        return await companyService.resendVerification(input.userId);
    },
}
