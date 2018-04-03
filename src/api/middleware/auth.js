const { pick } = require('lodash');
const httpStatus = require('http-status');
const messages = require('./../utils/messages');

const base64url = require('base64url');
const JWT = require('./../utils/jwt');
const KeyService = require('./../services/KeyService');
const authProvider = require('./../services/authProviders');

function isAuthenticated(req, res, next) {
  // Guard clauses
  const authorization = req.headers.authorization;
 
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

// const oAuth = (provider) => async (req, res, next) => {
//   try {
//     const body = pick(req.body, ['code']);
//     const deviceId = req.get('x-device-id');
//     const token = await authProvider[provider].auth(body.code);
//     const oAuthUser = await authProvider[provider].userProfile(token.access_token);
//     req.body.oAuthUser = oAuthUser;
//     req.body.deviceId = deviceId;
//     next()
//   } catch (error) {
//     next(error)
//   }
// }

const oAuth = async (req, res, next) => {
  try {
    console.log('BBBBBBBBBB');
    const provider = req.url.split('/').reverse()[0];
    const body = pick(req.body, ['code']);
    const deviceId = req.get('x-device-id');
    const token = await authProvider[provider].auth(body.code);
    const oAuthUser = await authProvider[provider].userProfile(token.access_token);
    req.body.oAuthUser = oAuthUser;
    req.body.deviceId = deviceId;
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  isAuthenticated: isAuthenticated,
  oAuth: oAuth
};
