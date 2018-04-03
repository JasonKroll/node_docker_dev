const base64url = require('base64url');
const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const { some, omitBy, isNil } = require('lodash');
const JWT_EXPIRATION = require('./../../../config/vars').jwtExpirationMinutes;
const messages = require('./../../utils/messages');
const seedUsers = require('./../fixtures/dbUsers');
const oAuthUsers = require('./../fixtures/oAuthUsers');
const User = require('./../../models/user.model');
const KeyService = require('./../../services/KeyService');

describe('Sessions API', () => {
  let googleUser;
  let auth;
  // let stub;
  let lukeSkywalkerToken;
  let dbUsers;
  // let deviceId;
  const password = '123456';
  const deviceId = '123456'

  beforeEach(async () => {
    auth = require('./../../middleware/auth');
    googleUser = await oAuthUsers.getValid('google');

    this.stub = sinon.stub(auth, 'oAuth').callsFake((req, res, next) => {
      console.log('STUBBING');
      req.body.oAuthUser = googleUser;
      next();
    });

    this.app = require('./../../../index');
  
    dbUsers = await seedUsers();
    
    const dbLuke = await User.findOne({email: dbUsers.lukeSkywalker.email})
    lukeSkywalkerToken = await KeyService.set(dbLuke, deviceId);
    dbUsers.lukeSkywalker.password = password;
    dbUsers.hanSolo.password = password;

  });
  afterEach(async () => {
    // sinon.assert.calledOnce(this.stub);
    // restore original method
    auth.oAuth.restore();
  });

  describe('POST /v1/sessions', () => {
    it('should return a token for valid login', () => {
      return request(this.app)
        .post('/v1/sessions')
        .send({email: dbUsers.lukeSkywalker.email, password: dbUsers.lukeSkywalker.password, deviceId: deviceId})
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.have.property('accessToken');
        })
    })

    it('should not return a token for a invalid email', () => {
      return request(this.app)
        .post('/v1/sessions')
        .send({email: 'jarjar.binks@nabooswamp.org', password: 'bombast', deviceId: '123456'})
        .expect(httpStatus.NOT_FOUND)
        .then((res) => {
          expect(res.body.error).to.be.equal(messages.userDoesNotExist)
        })
    })
  })

  describe('DELETE /v1/sessions', () => {
    it('should delete sessionKey for valid token', () => {
      return request(this.app)
        .delete('/v1/sessions')
        .set('Authorization', `Bearer ${lukeSkywalkerToken}`)
        .expect(httpStatus.NO_CONTENT)
        .then((res) => {
          expect(res.body).to.be.empty;
          return request(this.app)
            .get('/v1/sessions')
            .set('Authorization', `Bearer ${lukeSkywalkerToken}`)
            .expect(httpStatus.FORBIDDEN)
            .then((res) => {
              expect(res.body.error.message).to.be.equal(messages.invalidAccessToken);
            })
          })
    })
  })

  describe('POST /v1/sessions/oauth/google', () => {

    it('should create a user with valid oAuth2 login', () => {
      return request(this.app)
        .post('/v1/sessions/oauth/google')
        .set('x-device-id', '123456GoogleUser')
        .expect(httpStatus.OK)
        .then((res) => {
          var token = res.body.accessToken;
          var components = token.split('.');
          var header = JSON.parse(base64url.decode(components[0]));
          var payload = JSON.parse(base64url.decode(components[1]));
          var signature = components[2];
          console.log(JSON.stringify(payload, 0, 2))
          // sinon.assert.calledOnce(this.stub);
          // expect(this.stub).to.have.been.called;
          expect(payload.username).to.be.equal(googleUser.email);
        })
    })

  });

});

  