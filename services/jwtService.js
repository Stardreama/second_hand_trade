const jwt = require("jsonwebtoken");
const config = require("../config/config");

const generateToken = (user) => {
  return jwt.sign({ student_id: user.student_id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};
const RefreshToken = (user) => {
  return jwt.sign({ student_id: user.student_id }, config.jwt.secret, {
    expiresIn: config.jwt.refreshTokenExpiresIn,
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};

module.exports = { generateToken, RefreshToken, verifyToken };
