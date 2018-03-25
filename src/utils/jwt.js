const jsrsasign = require('jsrsasign');
const sessionKey = require('./sessionKey');
const JWT_ENCODING_ALGORITHM = 'HS256';
const JWT_SECRET_SEPARATOR = '_';
const config = require('./../config/vars');

class JWT {
  constructor () {
    this.secretKey = config.jwtSecret;
  }

  // Generate a new JWT
  generate (user, deviceId, userKey, issuedAt, expiresAt) {
    if (!user._id || !user.email) {
    throw new Error('user.id and user.email are required parameters');
    }

    const header = {
      alg: JWT_ENCODING_ALGORITHM, typ: 'JWT'
    };
    const payload = {
      username: user.email,
      deviceId: deviceId,
      jti: sessionKey(user._id, deviceId, issuedAt),
      iat: issuedAt,
      exp: expiresAt
    };
    const secret = this.secret(userKey);
    const token = jsrsasign.jws.JWS.sign(JWT_ENCODING_ALGORITHM, JSON.stringify(header), JSON.stringify(payload), secret);
    return token;
  };

  verify (token, userKey) {
    const secret = this.secret(userKey);
    const options = {alg: [JWT_ENCODING_ALGORITHM], verifyAt: new Date().getTime()};
    const isValid = jsrsasign.jws.JWS.verifyJWT(token, secret, options);
    return isValid;
  };

  // Token Secret generation
  secret (userKey) {
    return this.secretKey + JWT_SECRET_SEPARATOR + userKey;
  };
}

module.exports = new JWT();
