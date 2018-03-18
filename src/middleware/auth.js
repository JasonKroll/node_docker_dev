const httpStatus = require('http-status');
const messages = require('./../utils/messages');

var base64url = require('base64url');
var JWT = require('./../utils/jwt');
var KeyService = require('./../services/KeyService');

function isAuthenticated(req, res, next) {
  // Guard clauses
  var authorization = req.headers.authorization;

  if (!authorization || !(authorization.search('Bearer ') === 0)) {
    const newErr = new Error('Missing Authorization Header');
    newErr.status = httpStatus.UNAUTHORIZED;
    return next(newErr);
  }
  var token = authorization.split(' ')[1];
  if (!token) {
    const newErr = new Error('Missing Bearer Token');
    newErr.status = httpStatus.UNAUTHORIZED;
    return next(newErr);
  }

  try {
    // Unpack JWT
    var components = token.split('.');
    var header = JSON.parse(base64url.decode(components[0]));
    var payload = JSON.parse(base64url.decode(components[1]));
    var signature = components[2];

    // Verify JWT
    KeyService.get(payload.jti)
      .then(function(userKey) {
        var authenticated = JWT.verify(token, userKey);
        if (authenticated) {
          return next();
        }
        const newErr = new Error(messages.invalidAccessToken);
        newErr.status = httpStatus.FORBIDDEN;
        return next(newErr);
      });    
  } catch (error) {
    const newErr = new Error(messages.invalidAccessToken);
    newErr.status = httpStatus.FORBIDDEN;
    return next(newErr);
  }
}

module.exports = {
  isAuthenticated: isAuthenticated
};
