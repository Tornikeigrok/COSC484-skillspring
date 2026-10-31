const { BadRequestError } = require('./httpExceptions');

// Optional text field: undefined is handled by the caller, '' / null clears the value.
function validateOptionalText(value, field, max) {
    if (value === null) return null;
    if (typeof value !== 'string') {
        throw new BadRequestError(`${field} must be text`);
    }
    const text = value.trim();
    if (text.length > max) {
        throw new BadRequestError(`${field} must be ${max} characters or fewer`);
    }
    return text === '' ? null : text;
}

// Required text field: must be a non-empty string once trimmed.
function validateRequiredText(value, field, max) {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new BadRequestError(`${field} is required`);
    }
    const text = value.trim();
    if (text.length > max) {
        throw new BadRequestError(`${field} must be ${max} characters or fewer`);
    }
    return text;
}

// Only http(s) links are accepted, so values like "javascript:..." can never be stored.
function validateOptionalUrl(value, field) {
    const url = validateOptionalText(value, field, 300);
    if (url === null) return null;
    let parsed;
    try {
        parsed = new URL(url);
    } catch (e) {
        throw new BadRequestError(`${field} must be a valid URL starting with http:// or https://`);
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new BadRequestError(`${field} must be a valid URL starting with http:// or https://`);
    }
    if (parsed.username || parsed.password) {
        throw new BadRequestError(`${field} must not contain a username or password`);
    }
    return url;
}

module.exports = { validateOptionalText, validateRequiredText, validateOptionalUrl };
