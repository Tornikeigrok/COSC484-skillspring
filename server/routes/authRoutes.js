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

const loginInput = (req) => ({
    email: (req.body || {}).email,
    password: (req.body || {}).password,
});
 
router.post('/student-login', createHandler(loginInput, authController.loginStudent));
router.post('/business-login', createHandler(loginInput, authController.loginBusiness));
router.post('/logout', createHandler(() => ({}), authController.logout));

module.exports = router;
