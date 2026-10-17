const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { createHandler } = require('../utils/handler');
const { registerRateLimiter, loginRateLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/authMiddleware');

const registerInput = (req) => ({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
});

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
    (req) => ({
        email: req.body.email,
        currentPassword: req.body.currentPassword,
        newPassword: req.body.newPassword,
    }),
    authController.passwordReset,
));

router.get('/authenticate-user', authMiddleware, createHandler(
    (req) => ({
        userId: req.user.userId
    }),
    authController.validateUser,
));

module.exports = router;
