const { sequelize, Task, Company, Student, Submission } = require('../models');
const { ForbiddenError, NotFoundError, BadRequestError } = require('../utils/httpExceptions');
const { ROLE } = require('../constants/authConstants');
const { TASK_STATUS, TASK_UPLOAD_DIR, UNSCANNED_CODE } = require('../constants/taskConstants');
const { SUBMISSION_ZIP_STATUS } = require('../constants/submissionConstants');
const { checkTaskType, checkDifficulty, parseTaskId, checkFileExists, checkNotes, saveZip } = require('../utils/taskUtils');
const { checkFile } = require('../workers/taskWorker');
const { reviewTask } = require('./taskReviewService');
const { assertNdaAccess } = require('./proposalService');
const { UnrecoverableError } = require('bullmq');
const path = require('path');
const fs = require('fs/promises');

const TASK_ATTRIBUTES = ['id', 'title', 'description', 'difficulty', 'estimated_hours', 'deadline', 'status', 'task_type', 'created_at'];

const COMPANY_INCLUDE = {
    model: Company,
    attributes: ['name', 'website', 'verification_status'],
};

function checkStatus(status) {
    if (!Object.values(TASK_STATUS).includes(status)) {
        throw new BadRequestError('Unknown task status');
    }
}

// A missing or empty filter means "no filter", anything else must be one valid value
function optionalFilter(value, field, check) {
    if (value === undefined || value === '') return undefined;
    if (typeof value !== 'string') {
        throw new BadRequestError(`${field} must be a single value`);
    }
    check(value);
    return value;
}

async function companyIdOf(userId) {
    const company = Number.isInteger(userId)
        ? await Company.findOne({ attributes: ['id'], where: { user_id: userId } })
        : null;
    if (!company) {
        throw new NotFoundError('Company profile not found');
    }
    return company.id;
}

module.exports = {
    // Students only see open tasks, companies only see their own tasks (any status)
    getTasks: async (userId, role, filters) => {
        const taskType = optionalFilter(filters.task_type, 'Task type', checkTaskType);
        const difficulty = optionalFilter(filters.difficulty, 'Difficulty', checkDifficulty);
        const status = optionalFilter(filters.status, 'Status', checkStatus);

        const where = {};
        if (taskType) where.task_type = taskType;
        if (difficulty) where.difficulty = difficulty;

        if (role === ROLE.STUDENT) {
            if (status && status !== TASK_STATUS.OPEN) {
                return { data: [] };
            }
            where.status = TASK_STATUS.OPEN;
        } else if (role === ROLE.COMPANY) {
            where.company_id = await companyIdOf(userId);
            if (status) where.status = status;
        } else {
            throw new ForbiddenError('Forbidden');
        }

        const tasks = await Task.findAll({
            where,
            attributes: TASK_ATTRIBUTES,
            include: COMPANY_INCLUDE,
            order: [['created_at', 'DESC'], ['id', 'DESC']],
        });

        return { data: tasks };
    },

    getTask: async (userId, role, rawTaskId) => {
        const taskId = parseTaskId(rawTaskId);

        const task = await Task.findByPk(taskId, {
            attributes: [...TASK_ATTRIBUTES, 'company_id'],
            include: COMPANY_INCLUDE,
        });
        if (!task) {
            throw new NotFoundError('Task not found');
        }

        // company_id is only needed for the ownership check, it is not sent to the client
        const { company_id, ...visibleTask } = task.toJSON();

        if (role === ROLE.STUDENT) {
            // Students can only see open tasks (assigned students will be allowed once assignments exist)
            if (task.status !== TASK_STATUS.OPEN) {
                throw new ForbiddenError('You do not have access to this task');
            }
        } else if (role === ROLE.COMPANY) {
            if (company_id !== await companyIdOf(userId)) {
                throw new ForbiddenError('You do not have access to this task');
            }
        } else {
            throw new ForbiddenError('Forbidden');
        }

        return { data: visibleTask };
    },

    // Same checks as a company upload, but run inline so the student gets the verdict right away
    submitTask: async (userId, rawTaskId, file, notes) => {
        const taskId = parseTaskId(rawTaskId);
        checkFileExists(file);
        const cleanNotes = checkNotes(notes);

        // Only the student with an accepted proposal and signed NDA can submit
        const proposal = await assertNdaAccess(userId, taskId, [
            { model: Student, attributes: ['id', 'github_url'] },
            { model: Task, attributes: ['id', 'status'] },
        ]);

        // Once a submission passes, the task waits on the company
        if (proposal.Task.status !== TASK_STATUS.IN_PROGRESS) {
            throw new BadRequestError('Task is not accepting submissions');
        }

        const storedFilename = await saveZip(file);

        let scan;
        try {
            scan = checkFile(storedFilename);
        } catch (err) {
            await fs.rm(path.join(TASK_UPLOAD_DIR, storedFilename), { force: true });
            // Size and count limits are the student's fault, anything else is ours
            if (err instanceof UnrecoverableError) throw new BadRequestError(err.message);
            throw err;
        }
        const { hardFlags, softFlags, textFiles, hasUnscanned } = scan;

        let zipStatus;
        let reasons;
        if (hardFlags.length > 0) {
            zipStatus = SUBMISSION_ZIP_STATUS.REJECTED;
            reasons = hardFlags;
        } else {
            const review = await reviewTask(softFlags, textFiles, ROLE.STUDENT)
                .catch(() => ({ verdict: 'escalate', reasons: ['Automated review could not complete'] }));

            switch (review.verdict) {
                case 'approve':
                    zipStatus = hasUnscanned ? SUBMISSION_ZIP_STATUS.PENDING : SUBMISSION_ZIP_STATUS.ACCEPTED;
                    reasons = hasUnscanned ? UNSCANNED_CODE : [];
                    break;
                case 'reject':
                    zipStatus = SUBMISSION_ZIP_STATUS.REJECTED;
                    reasons = review.reasons;
                    break;
                case 'escalate':
                    zipStatus = SUBMISSION_ZIP_STATUS.PENDING;
                    reasons = review.reasons;
                    break;
            }
        }

        let submission;
        try {
            submission = await sequelize.transaction(async (t) => {
                // Only a clean zip moves the task forward, rejected or pending lets the student resubmit.
                // Conditional update so two concurrent accepted submissions can't both win.
                if (zipStatus === SUBMISSION_ZIP_STATUS.ACCEPTED) {
                    const [moved] = await Task.update(
                        { status: TASK_STATUS.SUBMITTED },
                        { where: { id: proposal.Task.id, status: TASK_STATUS.IN_PROGRESS }, transaction: t },
                    );
                    if (moved === 0) {
                        throw new BadRequestError('Task is not accepting submissions');
                    }
                }

                return await Submission.create({
                    proposal_id: proposal.id,
                    student_id: proposal.Student.id,
                    submission_zip_path: storedFilename,
                    github_url: proposal.Student.github_url,
                    notes: cleanNotes,
                    zip_status: zipStatus,
                }, { transaction: t });
            });
        } catch (err) {
            await fs.rm(path.join(TASK_UPLOAD_DIR, storedFilename), { force: true });
            throw err;
        }

        return { data: { id: submission.id, zip_status: zipStatus, reasons } };
    },
};
