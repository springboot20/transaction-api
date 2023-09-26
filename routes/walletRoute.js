const express = require('express');
const router = express.Router();
const authenticateUser = require('../utils/authentication');
const { authorizePermission } = require('../utils/jwt');
const controllers = require('../controllers/index');

router
  .route('/')
  .get([authenticateUser, authorizePermission('admin', 'sub-admin')], controllers.walletController.getAllUserWallet);

router.route('/wallet-transaction').post(authenticateUser, controllers.walletController);
router.route('/:id').get(authenticateUser, controllers.walletController.getUserWallet);

module.exports = router;
