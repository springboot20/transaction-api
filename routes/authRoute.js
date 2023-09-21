const express = require('express');
const controllers = require('../controllers/index');
const router = express.Router();
const authenticateUser = require('../utils/authentication');

router.route('/signup').post(controllers.authController.signup);
router.route('/signin').post(controllers.authController.signin);
router.route('/forgot-password').post(authenticateUser, controllers.authController.forgotPassword);
router.route('/reset-password/:id/:token').patch(authenticateUser, controllers.authController.resetPassword);

module.exports = router;
