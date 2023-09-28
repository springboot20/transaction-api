import express from 'express';
import authenticate from '../utils/authentication.js';
import { authorizePermission } from '../utils/jwt.js';
import * as controllers from '../controllers/index.js';

const router = express.Router();
router
  .route('/')
  .get([authenticate, authorizePermission('admin', 'sub-admin')], controllers.walletController.getAllUserWallet);

router.route('/wallet-transaction').post(authenticate, controllers.walletController);
router.route('/:id').get(authenticate, controllers.walletController.getUserWallet);

export default router;
