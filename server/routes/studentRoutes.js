const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/userMiddleware');
const { createHandler } = require('../utils/handler');
const { ROLE } = require("../constants/authConstants");

router.use(authMiddleware, roleMiddleware(ROLE.STUDENT));

router.get('/profile', createHandler(
    (req) => ({ userId: req.user.userId }),
    studentController.userProfile,
));

router.get('/verification-universities', createHandler(
    (req) => ({ uni: req.query.uni }),
    studentController.getUniveristyMatches,
));

module.exports = router;
