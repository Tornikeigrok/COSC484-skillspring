const { Student, Company } = require('../models');
const { ROLE, VERIFICATION_STATUS } = require('../constants/authConstants');

// Each role keeps its verification status on its own profile table
const PROFILE_MODEL = {
    [ROLE.STUDENT]: Student,
    [ROLE.COMPANY]: Company,
};

// Read from the database on every call (not from the token), so verifying
// an account takes effect immediately without having to log in again.
async function isVerified(userId, role) {
    const Profile = PROFILE_MODEL[role];
    if (!Profile || !Number.isInteger(userId)) return false;

    const profile = await Profile.findOne({
        attributes: ['verification_status'],
        where: { user_id: userId },
    });

    return profile?.verification_status === VERIFICATION_STATUS.VERIFIED;
}

module.exports = { isVerified };
