const express = require('express');
const router = express.Router();
const controller = require('./../../controllers/sessions.controller');
const asyncRoute = require('./../../middleware/asyncRoute');
const auth = require('./../../middleware/auth');
const sessionKey = require('./../../middleware/sessionKey');

router
  .route('/')
  .get(auth.isAuthenticated, sessionKey.attach, asyncRoute(controller.get))
  .post(asyncRoute(controller.login))
  .delete(auth.isAuthenticated, sessionKey.attach, asyncRoute(controller.delete))
router
  .route('/oauth/google')
  .post(auth.oAuth, asyncRoute(controller.oAuthLogin))

module.exports = router;
