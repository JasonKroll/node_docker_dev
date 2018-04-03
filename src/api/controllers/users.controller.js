const httpStatus = require('http-status');
const { pick } = require('lodash');
const User = require('../models/user.model');

// Make sure these are wrapped with the asyncRoutes middleware in the router

exports.get = async (req, res, next) => {
  const id = req.params.userId;
  const user = await User.findById(id);
  res.json(user.toJSON())
};

exports.create = async (req, res, next) => {
    const body = pick(req.body, User.safeParams);
    const user = new User(body);
    const savedUser = await user.save();
    res.status(httpStatus.CREATED);
    res.json(savedUser.toJSON());
};

exports.index = async (req, res, next) => {
    const users = await User.find({});
    res.json(users);
};

exports.delete = async (req, res, next) => {
    const id = req.params.userId;
    const deleted = await User.findOneAndRemove({_id: id});
    res.status(httpStatus.OK);
    res.json();
};
