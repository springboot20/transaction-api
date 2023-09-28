import express from 'express';
import * as controllers from '../controllers/index.js';
import authenticate from '../utils/authentication.js';
const router = express.Router();

router.route('/signup').post(controllers.authController.signup);
router.route('/signin').post(controllers.authController.signin);
router.route('/forgot-password').post(authenticate, controllers.authController.forgotPassword);
router.route('/reset-password/:id/:token').patch(authenticate, controllers.authController.resetPassword);

export default router;
