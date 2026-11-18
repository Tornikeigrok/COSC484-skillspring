const Exp = require('express');
const router = Exp.Router();
const { createHandler } = require('../utils/handler');
const proposalController = require('../controllers/proposalController');
const requireVerified = require('../middleware/verifiedMiddleware');
const { ROLE } = require('../constants/authConstants');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/userMiddleware');
const proposalService = require('../services/proposalService');

router.use(authMiddleware);

router.post('/send-proposal', requireVerified, roleMiddleware(ROLE.STUDENT), createHandler(
    (req) => ({
        taskId: req.body.taskId,
        userId: req.user.userId,
        approach: req.body.approach,
        est_hrs: req.body.est_hrs,
        questions: req.body.questions,
    }),
    proposalController.sendProposal,
));

router.get('/my-proposals', createHandler(
    (req) => ({
        userId: req.user.userId,
    }),
    proposalController.myProposals,
));

router.get('/company-task-proposals/:taskId', createHandler(
    (req) => ({
        taskId: req.params.taskId,
    }),
    proposalController.companyTaskProposals,
));

router.patch('/sign-nda/:taskId', roleMiddleware(ROLE.STUDENT), createHandler(
    (req) => ({
        userId: req.user.userId,
        taskId: req.params.taskId,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
    }),
    proposalController.signNda,
));

router.get('/assigned-task/:taskId', roleMiddleware(ROLE.STUDENT), createHandler(
    (req) => ({
        userId: req.user.userId,
        taskId: req.params.taskId,
    }),
    proposalController.assignedTaskDetails,
));

router.get('/assigned-task/:taskId/download', roleMiddleware(ROLE.STUDENT), async (req, res, next) => {
    try {
        const { filePath, downloadName } = await proposalService.taskZipPath(req.user.userId, req.params.taskId);
        res.download(filePath, downloadName, (err) => { if (err && !res.headersSent) next(err); });
    } catch (err) {
        next(err);
    }
});

router.get('/my-work', createHandler(
    (req) => ({
        userId: req.user.userId,
    }),
    proposalController.displayStudentWork,
));


module.exports = router;
