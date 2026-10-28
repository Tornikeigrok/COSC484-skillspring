const studentService = require('../services/studentService');

module.exports = {
    userProfile: async (input) => {
        return await studentService.studentProfile(input.userId);
    },
    updateProfile: async (input) => {
        return await studentService.updateProfile(input.userId, input.bio, input.githubUrl);
    },
    updatePassword: async (input) => {
        return await studentService.updatePassword(input.userId, input.currentPassword, input.newPassword);
    },
    getUniveristyMatches: async (input) => {
        return await studentService.getUniveristyMatches(input.uni);
    },
    studentVerification: async (input) => {
        return await studentService.studentVerification(input.userId, input.university, input.gradYear, input.uniEmail, input.bio );
    },
    validateVerificationCode: async (input) => {
        return await studentService.validateVerifCode(input.userId, input.code);
    },
    resendVerification: async (input) => {
        return await studentService.resendVerification(input.userId);
    },
}
