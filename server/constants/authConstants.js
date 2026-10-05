
const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const ROLE = {
    COMPANY: 'company',
    STUDENT: 'student',
}

const VERIFICATION_STATUS = {
    UNVERIFIED: 'unverified',
    VERIFIED: 'verified',
}

module.exports = {
    strongPasswordRegex,
    emailRegex,
    ROLE,
    VERIFICATION_STATUS,
}
