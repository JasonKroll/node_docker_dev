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
  jwtExpirationMinutes: process.env.JWT_EXPIRATION_MINUTES,
  mongo: {
    uri: mongo_uri
  },
  keyService: {
    port: process.env.KEY_SERVICE_PORT,
    host: process.env.KEY_SERVICE_HOST
  },
  logs: process.env.NODE_ENV === 'production' ? 'combined' : 'dev',
  auth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectURL: process.env.GOOGLE_REDIRECT_URL
    }
  }
};
