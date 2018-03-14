const jsrsasign = require('jsrsasign');
const sessionKey = require('./sessionKey');
const JWT_ENCODING_ALGORITHM = 'HS256';
const JWT_SECRET_SEPARATOR = '_';
const config = require('./../config/vars');

function JWT() {
  this.secretKey = config.jwtSecret;
}

// Generate a new JWT
JWT.prototype.generate = function(user, deviceId, userKey, issuedAt,
                                  expiresAt) {
  if (!user._id || !user.email) {
    throw new Error('user.id and user.username are required parameters');
  }

  var header = {
    alg: JWT_ENCODING_ALGORITHM, typ: 'JWT'
  };
  var payload = {
    username: user.email,
    deviceId: deviceId,
    jti: sessionKey(user._id, deviceId, issuedAt),
    iat: issuedAt,
    exp: expiresAt
  };
  var secret = this.secret(userKey);
  var token = jsrsasign.jws.JWS.sign(JWT_ENCODING_ALGORITHM,
                         JSON.stringify(header),
                         JSON.stringify(payload),
                         secret);
  return token;
};

JWT.prototype.verify = function(token, userKey) {
  var secret = this.secret(userKey);
  var isValid = jsrsasign.jws.JWS.verifyJWT(token,
                                            secret,
                                            {
                                              alg: [JWT_ENCODING_ALGORITHM],
                                              verifyAt: new Date().getTime()});
  return isValid;
};

// Token Secret generation
JWT.prototype.secret = function(userKey) {
  return this.secretKey + JWT_SECRET_SEPARATOR + userKey;
};

module.exports = new JWT();