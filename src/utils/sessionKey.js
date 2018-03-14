const sessionKey = (userId, deviceId, issuedAt) => {
  return `${userId}-${deviceId}-${issuedAt}`
};

module.exports = sessionKey;
