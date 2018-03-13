const express = require('express');
const router = express.Router();
const controller = require('./../../controllers/users.controller');
const asyncRoute = require('./../../middleware/asyncRoute');

router
  .route('/')
  .get(asyncRoute(controller.index))
  .post(asyncRoute(controller.create))
router
  .route('/:userId')
  .get(asyncRoute(controller.get))
  .delete(asyncRoute(controller.delete))

module.exports = router;
