const {google} = require('googleapis');
const axios = require('axios');
const OAuth2 = google.auth.OAuth2;
const config = require('./../../../config/vars');

const clientId = config.auth.google.clientId;
const clientSecret = config.auth.google.clientSecret;
const redirectURL = config.auth.google.redirectURL;

class Google {
  constructor () {
    console.log('clientId', clientId)
    console.log('clientSecret', clientSecret)
    console.log('redirectURL', redirectURL)
    this.oauth2Client = new OAuth2(
      clientId,
      clientSecret,
      redirectURL
    );

    this.scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ];
   
  }

  async userProfile (access_token) {
    const url = 'https://www.googleapis.com/oauth2/v3/userinfo';
    const params = { access_token };
    try {
      const response = await axios.get(url, { params });
      const {
        sub, name, email, picture,
      } = response.data;
      return {
        service: 'google',
        picture,
        id: sub,
        name,
        email,
      };      
    } catch (error) {
      return error
    }
  };

  async auth (code) {
    console.log('code', code)
    return new Promise((resolve, reject) => {
      this.oauth2Client.getToken(code, function (err, tokens) {
        // Now tokens contains an access_token and an optional refresh_token. Save them.
        if (!err) {
          return resolve(tokens)
        }
        reject(err)
      });
    })
  };
}

module.exports = new Google();
