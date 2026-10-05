const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { createHandler } = require('../utils/handler');

router.post('/student-register', createHandler(
    (req) => ({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password,
    }),
    authController.registerStudent,
));

module.exports = router;
