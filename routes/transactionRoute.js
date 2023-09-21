const express = require('express');
const controllers = require('../controllers/index');
const router = express.Router();
const authenticateUser = require('../utils/authentication');
const { authorizePermission } = require('../utils/jwt');

router.route('/transaction-stats').get(authenticateUser, controllers.transactionController.monthlyTransaction);

router
  .route('/')
    .post(authenticateUser, controllers.transactionController.makeTransaction)
  
 router
   .route('/')
   .get(
     [authenticateUser, authorizePermission('admin', 'sub-admin')],
     controllers.transactionController.fetchAllTransactions
   );

router.route('/:id').put(authenticateUser, controllers.transactionController.updateTransaction);

module.exports = router;
