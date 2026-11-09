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
};
