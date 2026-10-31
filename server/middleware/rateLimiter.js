const { rateLimit } = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const client = require('../utils/redisClient');

const openRedisStore = (name) => new RedisStore({
    sendCommand: (...args) => client.sendCommand(args),
    prefix: `rl:${name}:`,
});

const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    passOnStoreError: false,
    store: openRedisStore('password-reset'),
    message: { message: 'Too many password reset attempts, try again later' },
});

const registerRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    passOnStoreError: false,
    store: openRedisStore('register-reset'),
    message: { message: 'Too many sign up attempts, try again later' },
});

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    passOnStoreError: false,
    store: openRedisStore('login-reset'),
    message: { message: 'Too many login attempts, try again later' },
});

const verificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    passOnStoreError: false,
    store: openRedisStore('student-verification'),
    keyGenerator: (req) => String(req.user.userId), // per user
    message: { message: 'Too many verification requests, try again later' },
});

const verificationValidatorLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 4,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    passOnStoreError: false,
    store: openRedisStore('student-verification-validate'),
    keyGenerator: (req) => String(req.user.userId), // per user
    message: { message: 'Too many verification requests, try again later' },
});

module.exports = { 
    passwordResetLimiter,
    registerRateLimiter,
    loginRateLimiter,
    verificationLimiter,
    verificationValidatorLimiter
};
