
class httpExceptions extends Error {
    constructor(status, message, error) {
        super(status, message, error);
        this.status = status;
        this.message = message;
        this.error = error || this.httpError(error);
    }

    httpError(err) {
        const codes = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'UNPROCESSABLE_ENTITY',
            429: 'TOO_MANY_REQUESTS',
            500: 'INTERNAL_ERROR',
            503: 'SERVICE_UNAVAILABLE',
        }
        return codes[err] || 500;
    }
}

class BadRequestError extends httpExceptions {
    constructor(message = "Bad Request", errorCode = 'BAD_REQUEST') {
        super(400, message, errorCode);
    }
}

class UnauthorizedError extends httpExceptions {
    constructor(message = "Unauthorized", errorCode = 'UNAUTHORIZED') {
        super(401, message, errorCode);
    }
}

class ForbiddenError extends httpExceptions {
    constructor(message = 'Forbidden', errorCode = "FORBIDDEN") {
        super(403, message, errorCode);
    }
}

class NotFoundError extends httpExceptions {
  constructor(message = 'Resource not found') {
    super(404, message, 'NOT_FOUND');
  }
}

class ConflictError extends httpExceptions {
  constructor(message = 'Resource already exists') {
    super(409, message, 'CONFLICT');
  }
}

class ValidationError extends httpExceptions {
  constructor(message = 'Validation failed', details = []) {
    super(400, message, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class TooManyRequestsError extends httpExceptions {
  constructor(message = 'Too many requests') {
    super(429, message, 'TOO_MANY_REQUESTS');
  }
}

class InternalServerError extends httpExceptions {
  constructor(message = 'Internal server error') {
    super(500, message, 'INTERNAL_ERROR');
  }
}

class ServiceUnavailableError extends httpExceptions {
  constructor(message = 'Service unavailable', errorCode = 'SERVICE_UNAVAILABLE') {
    super(503, message, errorCode);
  }
}


module.exports = {
  httpExceptions,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  TooManyRequestsError,
  InternalServerError,
  ServiceUnavailableError,
}
