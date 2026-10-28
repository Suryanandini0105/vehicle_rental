const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'driveease_secret_fallback', {
    expiresIn: '7d',
  });
};

module.exports = { generateToken };
