const { verifyToken } = require('../services/tokenService');
const { UnauthorizedError } = require('../utils/httpExceptions');

function authMiddleware(req, res, next) {
    const token = req.cookie && req.cookies.token;
    if (!token) {
        throw new UnauthorizedError('Unauthorized missing token [authMiddleware]');
    }
    try {
        req.user = verifyToken(token);
        next();
    } catch (e) {
        res.status(401).json({ success: false, message: 'Unauthorized error' });
    }
}

module.exports = authMiddleware;
