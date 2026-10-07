const { verifyToken } = require('../services/tokenService');
const { UnauthorizedError } = require('../utils/httpExceptions');

function authMiddleware(req, res, next) {
    //Added req.cookie && req.cookies.token since apparently
    //the old code rejected all login requests by reading the 
    //raw Cookie header instead of just the token.
    const token = req.cookie && req.cookies.token;
    if (!token) {
        //Not sure if this is supposed to be a spelling error or on purpose
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
