const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/userMiddleware');
const { createHandler } = require('../utils/handler');
const { ROLE } = require('../constants/authConstants');

// Everything under /api/company needs a valid login AND the company role.
router.use(authMiddleware, roleMiddleware(ROLE.COMPANY));

router.get('/profile', createHandler(
    (req) => ({ userId: req.user.userId }),
    companyController.getProfile,
));

router.patch('/profile', createHandler(
    (req) => {
        const body = req.body || {};
        return {
            userId: req.user.userId,
            first_name: body.first_name,
            last_name: body.last_name,
            name: body.name,
            description: body.description,
            website: body.website,
        };
    },
    companyController.updateProfile,
));

module.exports = router;
