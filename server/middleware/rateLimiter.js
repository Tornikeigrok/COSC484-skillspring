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
});

const registerRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 5,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    passOnStoreError: false,
    store: openRedisStore('register-reset'),
});

const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    passOnStoreError: false,
    store: openRedisStore('login-reset'),
});

// Per user 
const verificationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 3,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    passOnStoreError: false,
    store: openRedisStore('student-verification'),
    keyGenerator: (req) => String(req.user.userId),
});

module.exports = { 
    passwordResetLimiter,
    registerRateLimiter,
    loginRateLimiter,
    verificationLimiter
};
