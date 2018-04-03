const getValid = async (service) => {
  const users = {
    google: {
      service: 'google',
      picture: 'https://example.com/photo.jpg',
      id: '1234567890abcdefghi',
      name: 'Google User',
      email: 'guser@gmail.com'
    },
    facebook: {
      // TODO: Add facebook user data
    }
  }
  return users[service];
};

module.exports = { getValid };
