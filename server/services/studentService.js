const { User, Student } = require('../models');
const { BadRequestError } = require('../utils/httpExceptions');


module.exports = {
    studentProfile: async (userId) => {
        const user = await User.findByPk(userId, {
            attributes: ['email', 'first_name', 'last_name', 'role', 'created_at'],
            include: {
                model: Student,
                attributes: ['university', 'graduation_year', 'verification_status', 'bio', 'github_url'],
            },
        });

        if (!user) {
            throw new BadRequestError(`Couldn't fetch your data.`);
        }

        return { data: user };
    },
}