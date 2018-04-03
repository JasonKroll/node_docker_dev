// KeyService.js, a key storage backed by Redis
// KeyService stores and manages user-specific keys used to sign JWTs
const redis = require('redis');
const Promise = require('bluebird');
const uuidv4 = require('uuid/v4');
const config = require('./../../config/vars.js');
const JWT = require('./../utils/jwt');
const EXPIRATION_TIME = config.jwtExpirationMinutes * 60 * 1000;
const sessionKey = require('./../utils/sessionKey');

Promise.promisifyAll(redis.RedisClient.prototype);

class KeyService {
  constructor () {
    this.client = redis.createClient(config.keyService.port, config.keyService.host);
    this.client.on('connect', function() {
      console.log('Redis connected.');
    });
    console.log('Connecting to Redis...');
  }
  
  // Retrieve a JWT user key
  get (sessionKey) {
    return this.client.getAsync(sessionKey);
  };

  // Generate and store a new JWT user key
  set (user, deviceId) {
    const userKey = uuidv4();
    const issuedAt = new Date().getTime();
    const expiresAt = issuedAt + (EXPIRATION_TIME);

    const token = JWT.generate(user, deviceId, userKey, issuedAt, expiresAt);
    const key = sessionKey(user._id, deviceId, issuedAt);
    console.log('key', key)
    const setKey = this.client.setAsync(key, userKey);
    const setExpiration = setKey.then(() => {
      return this.client.expireAsync(key, EXPIRATION_TIME);
    });
    const getToken = setExpiration.then(() => {
      return token;
    });

    return getToken;
  };

  // Manually remove a JWT user key
  delete (sessionKey) {
    return this.client.delAsync(sessionKey);
  };

}

module.exports = new KeyService();
