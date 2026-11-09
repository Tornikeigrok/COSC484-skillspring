const Exp = require('express');
const router = Exp.Router();
const { createHandler } = require('../utils/handler');
const proposalController = require('../controllers/proposalController');
const requireVerified = require('../middleware/verifiedMiddleware');
const { ROLE } = require('../constants/authConstants');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/userMiddleware');


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

module.exports = router;
