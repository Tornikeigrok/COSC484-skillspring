const { Proposal, sequelize, User, Student, Task, Company, TaskAsset } = require('../models');
const { ConflictError, BadRequestError, NotFoundError, ForbiddenError } = require('../utils/httpExceptions');
const { parseTaskId } = require('../utils/taskUtils');
const { PROPOSAL_STATUS } = require('../constants/proposalConstants');
const path = require('path');
const { TASK_UPLOAD_DIR, TASK_STATUS } = require('../constants/taskConstants');

// Student must have an accepted proposal on this task and have signed the NDA
async function assertNdaAccess(userId, taskId, include) {
    const student = await Student.findOne({ where: { user_id: userId }, attributes: ['id'] });
    if (!student) {
        throw new NotFoundError('Student profile not found');
    }

    const proposal = await Proposal.findOne({
        where: { task_id: taskId, student_id: student.id, status: PROPOSAL_STATUS.ACCEPTED },
        attributes: ['id', 'status', 'nda_signed', 'proposed_hours'],
        include,
    });

    if (!proposal) {
        throw new NotFoundError('No accepted proposal found for this task');
    }
    if (!proposal.nda_signed) {
        throw new ForbiddenError('Sign the NDA to view this task');
    }
    return proposal;
}

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
           attributes: ['id', 'status', 'proposed_hours', 'created_at', 'nda_signed'],
           include: {
               model: Task,
               attributes: ['id', 'title', 'task_type', 'difficulty', 'deadline'],
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
                    attributes: ['first_name', 'last_name', 'email'],
                },
            }
        })
        
        console.log(proposals);

        return { data: proposals };
    },
    /**
     * @param {*} userId - obtain f,l name and studentId, and whatever else using userId
     * @param {*} taskId - to know for which task we are updating nda_signed
     */
    signSnda: async (userId, taskId, firstName, lastName) => {
        if (typeof firstName !== 'string' || !firstName.trim() ||
           typeof lastName !== 'string' || !lastName.trim()) {
           throw new BadRequestError('Invalid name or name not provided');
        }

        const user = await User.findByPk(userId, { include: { model: Student, attributes: ['id'] } });
        if (!user || !user.Student) {
            throw new NotFoundError('Student profile not found');
        }
        const studentId = user.Student.id;
        const f = user.first_name.trim().toLowerCase();
        const l = user.last_name.trim().toLowerCase();

        if (f !== firstName.trim().toLowerCase() || l !== lastName.trim().toLowerCase()) {
            throw new BadRequestError("Full name doesn't match what's on the record");
        }

        const [affectedCount] = await Proposal.update(
            { nda_signed: true },
            { where: { task_id: taskId, student_id: studentId, status: PROPOSAL_STATUS.ACCEPTED } }
        );
        
        if (affectedCount === 0) {
            throw new NotFoundError('No accepted proposal found for this task');
        }

        return { data: { success: true, message: 'nda succesfully signed' }};
    },
    // Task details for the student's work page, only after their proposal is accepted and NDA signed
    assignedTaskDetails: async (userId, rawTaskId) => {
        const taskId = parseTaskId(rawTaskId);

        const proposal = await assertNdaAccess(userId, taskId, {
            model: Task,
            attributes: ['id', 'title', 'description', 'difficulty', 'estimated_hours', 'deadline', 'task_type', 'status'],
            include: [
                { model: Company, attributes: ['name', 'website'] },
                { model: TaskAsset, attributes: ['original_filename', 'file_type', 'uploaded_at'] },
            ],
        });

        return { data: { task: proposal.Task, proposal: { id: proposal.id, status: proposal.status, proposed_hours: proposal.proposed_hours } } };
    },
    // Path on disk to the task zip, the route streams it with res.download
    taskZipPath: async (userId, rawTaskId) => {
        const taskId = parseTaskId(rawTaskId);
        await assertNdaAccess(userId, taskId);

        const asset = await TaskAsset.findOne({ where: { task_id: taskId } });
        if (!asset) throw new NotFoundError('No file for this task');

        return {
            filePath: path.join(TASK_UPLOAD_DIR, asset.stored_filename),
            downloadName: asset.original_filename,
        };
    },

    displayStudentWork: async (userId) => {
        const user = await Student.findOne({ where: { user_id: userId }, attributes: ['id'] });
        if (!user) {
            throw new BadRequestError('no student found for given id');
        }

        const proposals = await Proposal.findAll({
           where: { student_id: user.id, status: PROPOSAL_STATUS.ACCEPTED, nda_signed: true },
           attributes: ['id', 'status', 'proposed_hours', 'created_at', 'nda_signed'],
           include: {
               model: Task,
               attributes: ['id', 'title', 'task_type', 'difficulty', 'deadline'],
               include: { model: Company, attributes: ['name'] },
           },
           order: [['created_at', 'DESC']],
       });

        if (!proposals) {
            throw new BadRequestError('no proposals found for given student');
        }
        
        return { data: proposals };
    },
}
