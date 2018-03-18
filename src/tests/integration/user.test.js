const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const { some, omitBy, isNil } = require('lodash');
const app = require('./../../index');
const User = require('./../../models/user.model');
const JWT_EXPIRATION = require('./../../config/vars').jwtExpirationMinutes;
const messages = require('./../../utils/messages');
const KeyService = require('./../../services/KeyService');


describe('Users API', () => {
  let adminAccessToken;
  let userAccessToken;
  let dbUsers;
  let user;
  let admin;

  const password = '123456';

  beforeEach(async () => {
    const passwordHashed = await bcrypt.hash(password, 1)
    dbUsers = {
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
      },
    };

    user = {
      email: 'storm.trooper@evilempire.com',
      password,
      name: 'Storm Trooper',
    };

    admin = {
      email: 'darth.vader@evilempire.com',
      password,
      name: 'Darth Vader',
      role: 'admin',
    };

    await User.remove({});
    await User.insertMany([dbUsers.lukeSkywalker, dbUsers.hanSolo]);
    const deviceId = '123456'
    const dbLuke = await User.findOne({email: dbUsers.lukeSkywalker.email})
    lukeSkywalkerToken = await KeyService.set(dbLuke, deviceId);
    dbUsers.lukeSkywalker.password = password;
    dbUsers.hanSolo.password = password;
  });


  describe('POST /v1/users', () => {
    it('should get 200 for health_check', () => {
      return request(app)
        .get('/v1/health_check')
        .then((res) => {
          expect(httpStatus.OK)
        });
    })

    it('should create a new user when request is ok', () => {
      return request(app)
        .post('/v1/users')
        .send(admin)
        .expect(httpStatus.CREATED)
        .then((res) => {
          delete admin.password;
          expect(res.body).to.include(admin);
        })
    })

    it('should create a new user and set default role to "user"', () => {
      return request(app)
        .post('/v1/users')
        .send(user)
        .expect(httpStatus.CREATED)
        .then((res) => {
          expect(res.body.role).to.be.equal('user');
        });
    });

    it('should report error when email already exists', () => {
      user.email = dbUsers.lukeSkywalker.email;

      return request(app)
        .post('/v1/users')
        .send(user)
        .expect(httpStatus.CONFLICT)
        .then((res) => {
          const { message } = res.body.error;
          expect(message).to.be.equal(messages.userExists);
        });
    });

    it('should report error when email is not provided', () => {
      delete user.email;

      return request(app)
        .post('/v1/users')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .send(user)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { message } = res.body.error;
          expect(message).to.be.equal(messages.invalidData('email', null));
        });
    });

    it('should report error when password length is less than 6', () => {
      user.password = '12345';

      return request(app)
        .post('/v1/users')
        .send(user)
        .expect(httpStatus.BAD_REQUEST)
        .then((res) => {
          const { message } = res.body.error;
          expect(message).to.be.equal(messages.invalidData('password', null));
        });
    });

    it('should return list of users for authorized user', () => {
      return request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer ${lukeSkywalkerToken}`)
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body.length).to.be.equal(2);
        });
    });

    it('should not return list of users for unauthorized user', () => {
      return request(app)
        .get('/v1/users')
        .set('Authorization', `Bearer invalid token`)
        .expect(httpStatus.FORBIDDEN)
        .then((res) => {
          const { message } = res.body.error;
          expect(message).to.be.equal(messages.invalidAccessToken);
        });
    });

  });
});