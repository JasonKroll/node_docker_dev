const express = require('express');
const router = express.Router();
const controller = require('./../../controllers/sessions.controller');
const asyncRoute = require('./../../middleware/asyncRoute');

router
  .route('/:sessionKey')
  .get(asyncRoute(controller.get))
  .delete(asyncRoute(controller.delete))
router
  .route('/')
  .post(asyncRoute(controller.login))
module.exports = router;
