const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/userMiddleware');
const { createHandler } = require('../utils/handler');
const { ROLE } = require("../constants/authConstants");
const { verificationLimiter, verificationValidatorLimiter } = require('../middleware/rateLimiter');

router.use(authMiddleware, roleMiddleware(ROLE.STUDENT));

router.get('/profile', createHandler(
    (req) => ({ userId: req.user.userId }),
    studentController.userProfile,
));

router.patch('/update-profile', createHandler(
    (req) => ({
        userId: req.user.userId,
        bio: req.body.bio,
        githubUrl: req.body.githubUrl,
    }),
    studentController.updateProfile,
));

router.patch('/update-password', createHandler(
    (req) => ({
        userId: req.user.userId,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
    }),
    studentController.updatePassword,
));

router.get('/verification-universities', createHandler(
    (req) => ({ uni: req.query.uni }),
    studentController.getUniveristyMatches,
));

router.post('/student-verification', verificationLimiter, createHandler(
    (req) => ({
        userId: req.user.userId,
        university: req.body.university,
        gradYear: req.body.gradYear,
        uniEmail: req.body.uniEmail,
        bio: req.body.bio,
    }),
    studentController.studentVerification,
));

router.post('/validate-code', verificationValidatorLimiter, createHandler(
    (req) => ({
        userId: req.user.userId,
        code: req.body.code,
    }),
    studentController.validateVerificationCode,
));

router.post('/resend-verification', verificationLimiter, createHandler(
    (req) => ({
        userId: req.user.userId,
    }),
    studentController.resendVerification,
));


module.exports = router;
