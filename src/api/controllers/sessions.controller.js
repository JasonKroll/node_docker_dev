const httpStatus = require('http-status');
const { pick, isNull } = require('lodash');
const User = require('./../models/user.model');
const KeyService = require('./../services/KeyService');
const messages = require('./../utils/messages');

// Make sure these are wrapped with the asyncRoutes middleware in the router

exports.get = async (req, res, next) => {
  const id = req.params.sessionKey;
  const token = `I'm a token for this key ${id}`;
  res.json({accesstoken: token});
};

exports.delete = async (req, res, next) => {
  // const id = req.params.sessionKey;

  const sessionKey = req.body.sessionKey;
  if (!sessionKey) {
    return res.status(400).send({error: 'sessionKey is a required parameter'});
  }

  KeyService.delete(sessionKey)
    .then(function(result) {
      if (!result) {
        return res.status(404).send();
      }
      res.status(204).send();
    })
    .catch(function(error) {
      console.log(error);
      next(error);
    });
};

exports.login = async (req, res, next) => {
  var params = pick(req.body, 'email', 'password');
  const deviceId = req.get('x-device-id');
  console.log('deviceId', deviceId);
  console.log(params);
  if (!params.email || !params.password || deviceId) {
    return res.status(400).send({error: 'email, password, and deviceId ' +
                                'are required parameters'});
  }
  
  var user = User.findOne({email: params.email});
  
  var passwordMatch = user.then(function(userResult) {
    if (isNull(userResult)) {
      return res.status(404).send({error: messages.userDoesNotExist});
    }
    return userResult.passwordMatches(params.password);
  });

  Promise.join(user, passwordMatch, function(userResult, passwordMatchResult) {
    if (!passwordMatchResult) {
      return res.status(403).send({
        error: 'Incorrect password'
      });
    }

    return KeyService.set(userResult, deviceId)
        .then(function(token) {
          res.status(200).send({
            accessToken: token
          });
        });
  })
    .catch(function(error) {
      next(error);
    });
};

exports.oAuthLogin = async (req, res, next) => {
  var params = pick(req.body, ['oAuthUser']);
  const deviceId = req.get('x-device-id');
  console.log('deviceId oAuthLogin', deviceId);
  if (!params.oAuthUser && !deviceId) {
    return res.status(400).send({error: messages.invalidAccessToken});
  }
  console.log(params.oAuthUser);
  const user = await User.oAuthLogin(params.oAuthUser)
  const token = await KeyService.set(user, deviceId)
  res.status(200).send({accessToken: token})
  // get auth code and service from url
  // send code to the correct service
  // if successful find or create User
  // create a session
  // return access token and user
  // https://www.googleapis.com/auth/userinfo.profile
}