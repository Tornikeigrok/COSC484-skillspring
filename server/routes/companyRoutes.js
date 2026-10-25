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
    (req) => ({
        userId: req.user.userId,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        name: req.body.name,
        description: req.body.description,
        website: req.body.website,
    }),
    companyController.updateProfile,
));

module.exports = router;
