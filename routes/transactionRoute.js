import express from 'express';
import * as controllers from '../controllers/index.js';
import authenticate from '../utils/authentication.js';
import { authorizePermission } from '../utils/jwt.js';

const router = express.Router();
router.route('/transaction-stats').get(authenticate, controllers.transactionController.monthlyTransaction);

router.route('/').post(authenticate, controllers.transactionController.makeTransaction);

router
  .route('/')
  .get(
    [authenticate, authorizePermission('admin', 'sub-admin')],
    controllers.transactionController.fetchAllTransactions
  );

router.route('/:id').put(authenticate, controllers.transactionController.updateTransaction);

export default router;
