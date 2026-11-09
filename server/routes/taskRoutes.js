const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const { createHandler } = require('../utils/handler');

// Everything under /api/tasks needs a valid login (students and companies, each sees what they are allowed to).
router.use(authMiddleware);

router.get('/', createHandler(
    (req) => ({
        userId: req.user.userId,
        role: req.user.role,
        task_type: req.query.task_type,
        difficulty: req.query.difficulty,
        status: req.query.status,
    }),
    taskController.getTasks,
));

router.get('/:id', createHandler(
    (req) => ({
        userId: req.user.userId,
        role: req.user.role,
        taskId: req.params.id,
    }),
    taskController.getTask,
));

module.exports = router;
