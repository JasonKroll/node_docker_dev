var base64url = require('base64url');
var JWT = require('./../utils/jwt');
var KeyService = require('./../services/KeyService');

// Attached JTI as sessionKey to req body
function attach(req, res, next) {
  // Guard clauses
  var authorization = req.headers.authorization;
  // Unpack JWT
  var token = authorization.split(' ')[1];
  var components = token.split('.');
  var header = JSON.parse(base64url.decode(components[0]));
  var payload = JSON.parse(base64url.decode(components[1]));
  var signature = components[2];

  req.body.sessionKey = payload.jti;
  next()
}

module.exports = {
  attach: attach
};
