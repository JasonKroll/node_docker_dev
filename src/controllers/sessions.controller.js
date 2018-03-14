const httpStatus = require('http-status');
const { pick, isNull } = require('lodash');
const User = require('./../models/user.model');
const KeyService = require('./../services/KeyService');

// Make sure these are wrapped with the asyncRoutes middleware in the router

exports.get = async (req, res, next) => {
  const id = req.params.sessionKey;
  const token = `I'm a token for this key ${id}`;
  res.json({accesstoken: token});
};

exports.delete = async (req, res, next) => {
  const id = req.params.sessionKey;
  const token = `Token for this key ${id} deleted`;
  res.json({message: token});
};

exports.login = async (req, res, next) => {
  var params = pick(req.body, 'email', 'password', 'deviceId');
  console.log(params);
  if (!params.email || !params.password || !params.deviceId) {
    return res.status(400).send({error: 'email, password, and deviceId ' +
                                'are required parameters'});
  }
  
  var user = User.findOne({email: params.email});
  
  var passwordMatch = user.then(function(userResult) {
    console.log('password', params.password);
    if (isNull(userResult)) {
      return res.status(404).send({error: 'User does not exist'});
    }
    return userResult.passwordMatches(params.password);
  });

  Promise.join(user, passwordMatch, function(userResult, passwordMatchResult) {
    if (!passwordMatchResult) {
      return res.status(403).send({
        error: 'Incorrect password'
      });
    }

    return KeyService.set(userResult, params.deviceId)
        .then(function(token) {
          res.status(200).send({
            accessToken: token
          });
        });
  })
    .catch(function(error) {
      console.log(error);
      next(error);
    });  
}