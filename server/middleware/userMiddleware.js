const { ForbiddenError } = require('../utils/httpExceptions');

const roleMiddleware = (role) => (req, res, next) => {
    if (req.user.role !== role) {
        throw new ForbiddenError('Forbidden');
    }
    next();
}

module.exports = roleMiddleware;
