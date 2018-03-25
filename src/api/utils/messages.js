class Messages {
  constructor () {
    this.userExists = 'User with this email address already exists.';
    this.invalidAccessToken = 'Invalid Access Token';
    this.userDoesNotExist = 'User does not exist';
    // this.invalidData = 'User with this email address already exists.';
  }

  invalidData (path, value) {
    return path === 'password'
    ?  `Property '${path}' is missing or invalid.`
    :  `Property '${path}' is missing or invalid (${value || 'undefined'})`
  }

}

module.exports = new Messages;

