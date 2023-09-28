import express from 'express';
import * as controllers from '../controllers/index.js';
import authenticate from '../utils/authentication.js';
import { authorizePermission } from '../utils/jwt.js';

const router = express.Router();
router.route('/stats').get(authenticate, controllers.userController.userStatistics);

router.route('/:id').get(authenticate, controllers.userController.getUser);
router.route('/:id').put(authenticate, controllers.userController.updateUser);
router.route('/').get(authenticate, authorizePermission('admin', 'sub-admin'), controllers.userController.getAllUsers);

export default router;
