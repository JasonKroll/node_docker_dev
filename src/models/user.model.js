const mongoose = require('mongoose');
const config = require('./../config/vars');
const bcrypt = require('bcryptjs');
const httpStatus = require('http-status');
const roles = ['user', 'admin'];
const safeParams = ['name', 'email', 'password', 'services', 'role', 'picture'];
const returnFields = ['_id', 'name', 'email', 'role', 'services', 'picture', 'createdAt', 'updatedAt'];
const messages = require('./../utils/messages');

const userSchema = new mongoose.Schema({
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 128
    },
    name: {
      type: String,
      maxlength: 128,
      index: true,
      trim: true,
    },
    services: {
      facebook: String,
      google: String,
    },
    role: {
      type: String,
      enum: roles,
      default: 'user',
    },
    picture: {
      type: String,
      trim: true,
    }
  }, {
    timestamps: true,
});

userSchema.pre('save', async function save(next) {
  try {
    if (!this.isModified('password')) return next();

    const rounds = config.env === 'test' ? 1 : 10;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

userSchema.method({
  transform() {
    const transformed = {};
    
    returnFields.forEach((field) => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  async passwordMatches(password) {
    return bcrypt.compare(password, this.password);
  }
});

var handleE11000 = function(error, res, next) {
  const errKeys = Object.keys(error);
  
  if (error.name === 'ValidationError') {
    const newErr = new Error('')
    const errKeys = Object.keys(error.errors)
    errKeys.map((e) => {
      newErr.message += `${messages.invalidData(e, error.errors[e].value)}, `
    })
    newErr.message = newErr.message.slice(0, newErr.message.lastIndexOf(', '))
    newErr.status = httpStatus.BAD_REQUEST;
    next(newErr);
  } else if (error.code === 11000) {
    const newErr = new Error(messages.userExists)
    newErr.status = httpStatus.CONFLICT;
    next(newErr);
  } else {
    next();
  }
};

userSchema.post('save', handleE11000);
userSchema.post('update', handleE11000);
userSchema.post('findOneAndUpdate', handleE11000);
userSchema.post('insertMany', handleE11000);


userSchema.statics = {
  roles,
  safeParams
}

module.exports = mongoose.model('User', userSchema);
