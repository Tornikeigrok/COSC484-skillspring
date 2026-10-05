function createHandler(extractInput, controller) {
    return async (req, res, next) => {
        try {
            const input = extractInput(req);
            const result = await controller(input);

            if (result === undefined || result === null) {
                return res.status(204).end();
            }

            const { statusCode = 200, data, cookies = [] } = result;

            for (const cookie of cookies) {
                res.cookie(cookie.name, cookie.value, cookie.options || {});
            }

            return res.status(statusCode).json(data);
        } catch (err) {
            next(err);
        }
    };
}

module.exports = { createHandler };
