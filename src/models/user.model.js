const mongoose = require('mongoose');
const config = require('./../config/vars');
const bcrypt = require('bcryptjs');

const roles = ['user', 'admin'];
const safeParams = ['name', 'email', 'password', 'services', 'role', 'picture'];
const returnFields = ['_id', 'name', 'email', 'role', 'services', 'picture', 'createdAt', 'updatedAt'];

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
      maxlength: 128,
      select: false
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
    },
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
});

userSchema.statics = {
  roles,
  safeParams
}

module.exports = mongoose.model('User', userSchema);
