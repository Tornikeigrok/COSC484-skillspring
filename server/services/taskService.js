const { Task, Company, TaskAsset } = require('../models');
const { ForbiddenError, NotFoundError, BadRequestError } = require('../utils/httpExceptions');
const { ROLE } = require('../constants/authConstants');
const { TASK_STATUS } = require('../constants/taskConstants');
const { checkTaskType, checkDifficulty } = require('../utils/taskUtils');

const MAX_TASK_ID = 2147483647; // largest value the integer id column can hold

const TASK_ATTRIBUTES = ['id', 'title', 'description', 'difficulty', 'estimated_hours', 'status', 'task_type', 'created_at'];

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

function parseTaskId(value) {
    if (typeof value !== 'string' || !/^\d+$/.test(value) || Number(value) < 1 || Number(value) > MAX_TASK_ID) {
        throw new BadRequestError('Invalid task id');
    }
    return Number(value);
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
};
