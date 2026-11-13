const { Proposal, sequelize, User, Student, Task, Company } = require('../models');
const { ConflictError, BadRequestError } = require('../utils/httpExceptions');
const { PROPOSAL_STATUS } = require('../constants/proposalConstants')

module.exports = {
    sendProposal: async (userId, taskId, approach, est_hrs, questions) => {
        const student = await Student.findOne({ where: { user_id: userId }, attributes: ['id'] });

        const alreadySent = await Proposal.findOne({
           where: { task_id: taskId, student_id: student.id }
        });

        if (alreadySent) {
           throw new ConflictError('Proposal already sent for this task');
        }

        return await Proposal.create({
            task_id: taskId,
            student_id: student.id,
            approach,
            proposed_hours: est_hrs,
            status: PROPOSAL_STATUS.PENDING,
            questions: questions ?? null,
        });
    },
    myProposals: async (userId) => {
        const student = await Student.findOne({ where: { user_id: userId }, attributes: ['id'] });

        const proposals = await Proposal.findAll({
           where: { student_id: student.id },
           attributes: ['id', 'status', 'proposed_hours', 'created_at'],
           include: {
               model: Task,
               attributes: ['id', 'title', 'task_type', 'difficulty'],
               include: { model: Company, attributes: ['name'] },
           },
           order: [['created_at', 'DESC']],
       });

       return { data: proposals };
    },
    // Company's side of proposals. Send all awaiting proposals when company checks their Assignment tab
    companyTaskProposals: async (taskId) => {
        const proposals = await Proposal.findAll({
            where: { task_id: taskId },
            include: {
                model: Student,
                attributes: ['id'],
                include: {
                    model: User,
                    attributes: ['first_name', 'last_name'],
                },
            }
        })
        
        console.log(proposals);

        return { data: proposals };
    },
}
