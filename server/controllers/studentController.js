const studentService = require('../services/studentService');

module.exports = {
    userProfile: async (input) => {
        return await studentService.studentProfile(input.userId);
    },
    getUniveristyMatches: async (input) => {
        return await studentService.getUniveristyMatches(input.uni);
    },
}
