const proposalService = require('../services/proposalService');


module.exports = {
    sendProposal: async (input) => {
        return await proposalService.sendProposal(
            input.userId, input.taskId, input.approach, input.est_hrs, input.questions
        );
    },
    myProposals: async (input) => {
        return await proposalService.myProposals(input.userId);
    },
    companyTaskProposals: async (input) => {
        return await proposalService.companyTaskProposals(input.taskId);
    },
    signNda: async (input) => {
        return await proposalService.signSnda(input.userId, input.taskId, input.firstName, input.lastName);
    },
    assignedTaskDetails: async (input) => {
        return await proposalService.assignedTaskDetails(input.userId, input.taskId);
    },
    displayStudentWork: async (input) => {
        return await proposalService.displayStudentWork(input.userId);
    },
};
