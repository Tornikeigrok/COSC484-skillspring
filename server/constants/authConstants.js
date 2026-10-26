
const strongPasswordRegex = /^.{8,}$/;

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const verificationCodeFormat = /^\d{6}$/;

const ROLE = {
    COMPANY: 'company',
    STUDENT: 'student',
}

const VERIFICATION_STATUS = {
    UNVERIFIED: 'unverified',
    VERIFIED: 'verified',
}

const AUTH_PROVIDERS = {
    LOCAL: 'local',
    GITHUB: 'github',
}

const COOKIE_AGE = 60 * 60 * 1000;

module.exports = {
    strongPasswordRegex,
    emailRegex,
    verificationCodeFormat,
    ROLE,
    VERIFICATION_STATUS,
    COOKIE_AGE,
    AUTH_PROVIDERS
}
