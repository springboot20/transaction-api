const express = require('express');
const controllers = require('../controllers/index');
const router = express.Router();
const authenticateUser = require('../utils/authentication');
const { authorizePermission } = require('../utils/jwt');

router.route('/stats').get(authenticateUser, controllers.userController.userStatistics);

router.route('/:id').get(authenticateUser, controllers.userController.getUser);
router.route('/:id').put(authenticateUser, controllers.userController.updateUser);
router
  .route('/')
  .get(authenticateUser, authorizePermission('admin', 'sub-admin'), controllers.userController.getAllUsers);

module.exports = router;
