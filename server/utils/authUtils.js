const { BadRequestError } = require('./httpExceptions');
const { strongPasswordRegex, emailRegex } = require('../constants/authConstants');

function requireString(value, field) {
    if (typeof value !== 'string' || value.trim() === '') {
        throw new BadRequestError(`${field} is required`);
    }
    return value;
}

function validateUsername(value) {
    const username = requireString(value, 'Username').trim();
    if (username.length < 5 || username.length > 20) {
        throw new BadRequestError('Username must be 5-20 characters');
    }
    return username;
}

function validateName(value, field) {
    const name = requireString(value, field).trim();
    if (name.length > 50) {
        throw new BadRequestError(`${field} must be 50 characters or fewer`);
    }
    return name;
}

function validateEmail(value) {
    const email = requireString(value, 'Email').trim().toLowerCase();
    if (!emailRegex.test(email)) {
        throw new BadRequestError('Invalid email format');
    }
    return email;
}

function validatePassword(value) {
    const password = requireString(value, 'Password');
    if (!strongPasswordRegex.test(password)) {
        throw new BadRequestError('Password must be 8+ characters with upper, lower, number and special character');
    }
    return password;
}

module.exports = { validateUsername, validateName, validateEmail, validatePassword };
