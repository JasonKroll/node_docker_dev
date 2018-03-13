const path = require('path');

// import .env variables
require('dotenv-safe').load({
  path: path.join(__dirname, '../../.env'),
  sample: path.join(__dirname, '../../.env.example'),
});
const mongo_name = `${process.env.MONGO_NAME}-${process.env.NODE_ENV}`
const mongo_uri = `mongodb://${process.env.MONGO_SERVICE}:${process.env.MONGO_PORT}/${mongo_name}`

module.exports = {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpirationInterval: process.env.JWT_EXPIRATION_MINUTES,
  mongo: {
    uri: mongo_uri
  },
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
};
