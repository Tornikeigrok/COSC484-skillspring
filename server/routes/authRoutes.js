const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { createHandler } = require('../utils/handler');
const { registerRateLimiter, loginRateLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/authMiddleware');

// "|| {}" so a request with no body gets a clean 400 instead of crashing with a 500
const registerInput = (req) => {
    const body = req.body || {};
    return {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
    };
};

const loginInput = (req) => ({
    email: (req.body || {}).email,
    password: (req.body || {}).password,
});

router.post('/student-register', registerRateLimiter, createHandler(
    registerInput, authController.registerStudent
));
router.post('/company-register', registerRateLimiter, createHandler(
    registerInput, authController.registerCompany
));

router.post('/student-login', loginRateLimiter, createHandler(
    loginInput, authController.loginStudent
));
router.post('/company-login', loginRateLimiter, createHandler(
    loginInput, authController.loginCompany
));
router.post('/logout', authMiddleware, createHandler(
    () => ({}), authController.logout
));

router.post('/reset-password', passwordResetLimiter, createHandler(
    (req) => {
        const body = req.body || {};
        return {
            email: body.email,
            currentPassword: body.currentPassword,
            newPassword: body.newPassword,
        };
    },
    authController.passwordReset,
));

router.get('/authenticate-user', authMiddleware, createHandler(
    (req) => ({
        userId: req.user.userId
    }),
    authController.validateUser,
));

module.exports = router;
