const request = require('supertest');
const httpStatus = require('http-status');
const { expect } = require('chai');
const sinon = require('sinon');
const bcrypt = require('bcryptjs');
const { some, omitBy, isNil } = require('lodash');
const app = require('./../../../index');
const JWT_EXPIRATION = require('./../../../config/vars').jwtExpirationMinutes;
const messages = require('./../../utils/messages');
const seedUsers = require('./../fixtures/dbUsers');
const User = require('./../../models/user.model');
const KeyService = require('./../../services/KeyService');

describe('Sessions API', () => {
  let lukeSkywalkerToken;
  let dbUsers;
  // let deviceId;
  const password = '123456';
  const deviceId = '123456'

  beforeEach(async () => {

    dbUsers = await seedUsers();
    
    const dbLuke = await User.findOne({email: dbUsers.lukeSkywalker.email})
    lukeSkywalkerToken = await KeyService.set(dbLuke, deviceId);
    dbUsers.lukeSkywalker.password = password;
    dbUsers.hanSolo.password = password;

  });

  describe('POST /v1/sessions', () => {
    it('should return a token for valid login', () => {
      return request(app)
        .post('/v1/sessions')
        .send({email: dbUsers.lukeSkywalker.email, password: dbUsers.lukeSkywalker.password, deviceId: deviceId})
        .expect(httpStatus.OK)
        .then((res) => {
          expect(res.body).to.have.property('accessToken');
        })
    })

    it('should not return a token for a invalid email', () => {
      return request(app)
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
      return request(app)
        .delete('/v1/sessions')
        .set('Authorization', `Bearer ${lukeSkywalkerToken}`)
        .expect(httpStatus.NO_CONTENT)
        .then((res) => {
          expect(res.body).to.be.empty;
          return request(app)
            .get('/v1/sessions')
            .set('Authorization', `Bearer ${lukeSkywalkerToken}`)
            .expect(httpStatus.FORBIDDEN)
            .then((res) => {
              expect(res.body.error.message).to.be.equal(messages.invalidAccessToken);
            })
          })
    })
  })

});