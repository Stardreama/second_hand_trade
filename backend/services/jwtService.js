const jwt = require("jsonwebtoken");
const config = require("../config/config");

const generateToken = (user) => {
  return jwt.sign({ student_id: user.student_id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    return null;
  }
};
const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader) {
    return res.status(401).json({ code: 401, message: "未提供认证令牌" });
  }
  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);
  try {
    req.user = decoded; // 解析出的用户信息（比如 student_id）
    next();
  } catch (error) {
    res.status(401).json({ error: "Token 验证失败" });
  }
};
module.exports = { generateToken, verifyToken, authMiddleware };
