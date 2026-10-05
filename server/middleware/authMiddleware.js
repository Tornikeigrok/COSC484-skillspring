const { verifyToken } = require('../services/tokenService');
const { UnauthorizedError } = require('../utils/httpExceptions');

function authMiddleware(req, res, next) {
    const token = req.headers.cookie;
    if (!token) {
        throw new UnauthorizedError('Unauthorize,d missing token [authMiddleware]');
    }
    try {
        req.user = verifyToken(token);
        next();
    } catch (e) {
        res.status(401).json({ success: false, message: 'Unauthorized error' });
    }
}

module.exports = authMiddleware;
