const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const { createHandler } = require('../utils/handler');
const roleMiddleware = require('../middleware/userMiddleware');
const { ROLE } = require('../constants/authConstants');
const { submitTaskLimiter } = require('../middleware/rateLimiter');
const multer = require('multer');

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

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
});

// Role check and limiter run before multer so rejected requests never read the upload
router.post('/:id/submit', roleMiddleware(ROLE.STUDENT), submitTaskLimiter, upload.single('file'), createHandler(
    (req) => ({
        userId: req.user.userId,
        taskId: req.params.id,
        file: req.file,
        notes: req.body?.notes,
    }),
    taskController.submitTask,
));

module.exports = router;
