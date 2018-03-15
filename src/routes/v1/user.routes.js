const express = require('express');
const router = express.Router();
const controller = require('./../../controllers/users.controller');
const asyncRoute = require('./../../middleware/asyncRoute');
const auth = require('./../../middleware/auth');

router
  .route('/')
  .get(auth.isAuthenticated, asyncRoute(controller.index))
  .post(asyncRoute(controller.create))
router
  .route('/:userId')
  .get(asyncRoute(controller.get))
  .delete(asyncRoute(controller.delete))

module.exports = router;
