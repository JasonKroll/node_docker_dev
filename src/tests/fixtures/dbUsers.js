const bcrypt = require('bcryptjs');
const User = require('./../../models/user.model');
const password = '123456';

const seedUsers = async () => {
  const passwordHashed = await bcrypt.hash(password, 1)

  const users =    {
    lukeSkywalker: {
      email: 'luke@rebellion.com',
      password: passwordHashed,
      name: 'Luke Skywalker',
      role: 'admin',
    },
    hanSolo: {
      email: 'han@rebellion.com',
      password: passwordHashed,
      name: 'Han Solo',
    }
  }
  await User.remove({});
  await User.insertMany([users.lukeSkywalker, users.hanSolo]);
  return users
};

module.exports = seedUsers;
