const { sequelize, User, Company } = require('../models');
const { NotFoundError, BadRequestError } = require('../utils/httpExceptions');
const { validateName } = require('../utils/authUtils');
const { validateRequiredText, validateOptionalText, validateOptionalUrl } = require('../utils/profileUtils');

async function fetchProfile(userId, options = {}) {
    const user = await User.findByPk(userId, {
        attributes: ['email', 'first_name', 'last_name', 'role', 'created_at'],
        include: {
            model: Company,
            attributes: ['name', 'website', 'description', 'verification_status'],
        },
        ...options,
    });

    if (!user || !user.Company) {
        throw new NotFoundError('Company profile not found');
    }
    return user;
}

module.exports = {
    companyProfile: async (userId) => {
        return { data: await fetchProfile(userId) };
    },

    // Partial update: only the fields that were sent are changed.
    // verification_status is deliberately NOT editable here (it must never come from the client).
    updateCompanyProfile: async (userId, input) => {
        const userChanges = {};
        const companyChanges = {};

        if (input.first_name !== undefined) userChanges.first_name = validateName(input.first_name, 'First name');
        if (input.last_name !== undefined) userChanges.last_name = validateName(input.last_name, 'Last name');
        if (input.name !== undefined) companyChanges.name = validateRequiredText(input.name, 'Company name', 160);
        if (input.description !== undefined) companyChanges.description = validateOptionalText(input.description, 'Description', 2000);
        if (input.website !== undefined) companyChanges.website = validateOptionalUrl(input.website, 'Website');

        if (Object.keys(userChanges).length === 0 && Object.keys(companyChanges).length === 0) {
            throw new BadRequestError('No changes provided');
        }

        await sequelize.transaction(async (t) => {
            if (Object.keys(userChanges).length > 0) {
                await User.update(userChanges, { where: { id: userId }, transaction: t });
            }
            if (Object.keys(companyChanges).length > 0) {
                const [rows] = await Company.update(companyChanges, { where: { user_id: userId }, transaction: t });
                if (rows === 0) throw new NotFoundError('Company profile not found');
            }
        });

        return { data: await fetchProfile(userId) };
    },
};
