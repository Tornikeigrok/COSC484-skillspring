const taskService = require('../services/taskService');

module.exports = {
    getTasks: async (input) => {
        const { userId, role, ...filters } = input;
        return await taskService.getTasks(userId, role, filters);
    },
    getTask: async (input) => {
        return await taskService.getTask(input.userId, input.role, input.taskId);
    },
}
