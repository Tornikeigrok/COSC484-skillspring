const studentService = require('../services/studentService');

module.exports = {
    userProfile: async (input) => {
        return await studentService.studentProfile(input.userId);
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
}
