const express = require('express');
const router = express.Router();
const controller = require('./../../controllers/sessions.controller');
const asyncRoute = require('./../../middleware/asyncRoute');
const auth = require('./../../middleware/auth');
const sessionKey = require('./../../middleware/sessionKey');

router
  .route('/:sessionKey')
  .get(asyncRoute(controller.get))
router
  .route('/')
  .post(asyncRoute(controller.login))
  .delete(auth.isAuthenticated, sessionKey.attach, asyncRoute(controller.delete))
  
module.exports = router;
