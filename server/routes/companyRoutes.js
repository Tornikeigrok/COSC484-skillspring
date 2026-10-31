const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/userMiddleware');
const { createHandler } = require('../utils/handler');
const { ROLE } = require('../constants/authConstants');
const { verificationLimiter, verificationValidatorLimiter } = require('../middleware/rateLimiter');

// Everything under /api/company needs a valid login AND the company role.
router.use(authMiddleware, roleMiddleware(ROLE.COMPANY));

router.get('/profile', createHandler(
    (req) => ({ userId: req.user.userId }),
    companyController.getProfile,
));

router.patch('/update-profile', createHandler(
    (req) => {
        const body = req.body || {};
        return {
            userId: req.user.userId,
            first_name: body.first_name,
            last_name: body.last_name,
            name: body.name,
            description: body.description,
            website: body.website,
        };
    },
    companyController.updateProfile,
));

router.patch('/update-password', createHandler(
    (req) => ({
        userId: req.user.userId,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
    }),
    companyController.updatePassword,
));

router.get('/tasks', createHandler(
    (req) => ({ userId: req.user.userId }),
    companyController.getTasks,
));

router.post('/verification', verificationLimiter, createHandler(
    (req) => {
        const body = req.body || {};
        return {
            userId: req.user.userId,
            website: body.website,
            workEmail: body.workEmail,
            description: body.description,
        };
    },
    companyController.companyVerification,
));

router.post('/validate-code', verificationValidatorLimiter, createHandler(
    (req) => ({
        userId: req.user.userId,
        code: (req.body || {}).code,
    }),
    companyController.validateVerificationCode,
));

router.post('/resend-verification', verificationLimiter, createHandler(
    (req) => ({
        userId: req.user.userId,
    }),
    companyController.resendVerification,
));

module.exports = router;
