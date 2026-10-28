const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const authController = require('../controllers/authController');
const { createHandler } = require('../utils/handler');
const { registerRateLimiter, loginRateLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const authMiddleware = require('../middleware/authMiddleware');
const { User, Student, sequelize } = require('../models');
const { ROLE, VERIFICATION_STATUS, AUTH_PROVIDERS } = require('../constants/authConstants');
const { UnauthorizedError, BadRequestError } = require('../utils/httpExceptions');
const { generateToken } = require('../services/tokenService');
const { TOKEN_COOKIE_OPTIONS } = require('../utils/authUtils');

const registerInput = (req) => ({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
});

const loginInput = (req) => ({
    email: req.body.email,
    password: req.body.password,
});

router.post('/student-register', registerRateLimiter, createHandler(
    registerInput, authController.registerStudent
));
router.post('/company-register', registerRateLimiter, createHandler(
    (req) => ({ ...registerInput(req), companyName: req.body.companyName }),
    authController.registerCompany
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

router.get('/github', async (req, res, next) => {
    const state = crypto.randomBytes(16).toString('hex');

    res.cookie('github-oauth-state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 5 * 60 * 1000,
    });

    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        redirect_uri: process.env.GITHUB_CALLBACK_URL,
        scope: 'read:user user:email',
        state,
    });

    res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

router.get('/github/callback', async (req, res, next) => {
    //Get the state from cookie
    const stateFromCookie = req.cookies['github-oauth-state'];

    res.clearCookie('github-oauth-state');

    // Also get it from URL
    const stateFromParams = req.query.state;

    if (!stateFromCookie || stateFromCookie !== stateFromParams) {
        throw new UnauthorizedError('Invalid state');
    }

    // Get the user's access token by sending the code
    const tokenRes = await fetch(`https://github.com/login/oauth/access_token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code: req.query.code,
            redirect_uri: process.env.GITHUB_CALLBACK_URL,
        }),
    });
    const data = await tokenRes.json();
    if (data.error) {
        throw new UnauthorizedError(data.error_description);
    }

    const acc_token = data.access_token;
    const userRes = await fetch(`https://api.github.com/user`, {
        headers: { Authorization: `Bearer ${acc_token}`, Accept: 'application/json' },
    });

    const ghUser = await userRes.json(); // User's information
    
    // explicit call to github to get the email
    const getUserEmail = await fetch(`https://api.github.com/user/emails`, {
        headers: { Authorization: `Bearer ${acc_token}`, Accept: 'application/vnd.github+json' }
    });

    const emails = await getUserEmail.json();

    if (!Array.isArray(emails)) {
        throw new BadRequestError('Returnd not an array of emails');
    }

    const primaryEmail = emails.find(email => email.primary && email.verified);

    if (!primaryEmail) {
        throw new UnauthorizedError('No verified email on GitHub account');
    }

    const email = primaryEmail.email; // Primary email

    let user = await User.findOne({ where: { email }});
    if (user && user.role !== ROLE.STUDENT) {
        throw new UnauthorizedError('Github login is only for students');
    }

    // If the user does not already exist, create a new record
    if (!user) {
        // name can be null on GitHub, fall back to the username
        const [firstName, ...rest] = (ghUser.name || ghUser.login).trim().split(/\s+/);

        user = await sequelize.transaction(async (t) => {
            const newUser = await User.create(
                {
                    email,
                    first_name: firstName,
                    last_name: rest.join(' '),
                    role: ROLE.STUDENT,
                    auth_provider: AUTH_PROVIDERS.GITHUB,
                },
                { transaction: t }
            );

            await Student.create({
                user_id: newUser.id,
                github_url: ghUser.html_url,
                verification_status: VERIFICATION_STATUS.UNVERIFIED
            }, { transaction: t });

            return newUser;
        });
    }

    res.cookie('token', generateToken(user), TOKEN_COOKIE_OPTIONS);

    return res.redirect(`${process.env.FRONTEND_URL}/student`);
});


module.exports = router;
