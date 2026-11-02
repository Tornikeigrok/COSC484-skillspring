const { isVerified } = require('../services/verificationService');
const { ForbiddenError } = require('../utils/httpExceptions');
const { ROLE } = require('../constants/authConstants');

const NOT_VERIFIED_MESSAGE = {
    [ROLE.STUDENT]: 'Verify your student account to continue',
    [ROLE.COMPANY]: 'Verify your company to continue',
};

// Use after authMiddleware (it needs req.user). Returns 403 if the account is not verified.
// Add roleMiddleware before it when a route is for one role only.
async function requireVerified(req, res, next) {
    if (!(await isVerified(req.user.userId, req.user.role))) {
        throw new ForbiddenError(NOT_VERIFIED_MESSAGE[req.user.role] || 'Forbidden');
    }
    next();
}

module.exports = requireVerified;
