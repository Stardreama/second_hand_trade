const jwtService = require("../services/jwtService");
const User = require("../models/user");
const bcrypt = require("bcrypt");

//注册
const register = (req, res) => {
  const { student_id, username, password, student_card } = req.body;

  // 首先检查 student_id 是否已存在
  User.findByStudentId(student_id, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "数据库错误" });
    }

    if (result.length > 0) {
      // 如果 student_id 已存在，返回错误信息
      return res.status(400).json({ message: "该学生ID已被注册" });
    }
    // 密码加密
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: "密码加密失败" });
      }
      // 创建新用户
      User.create(
        student_id,
        username,
        hashedPassword,
        student_card,
        (err, result) => {
          if (err) {
            return res.status(500).json({ message: "数据库错误" });
          }
          res.status(200).json({ message: "注册成功" });
        }
      );
    });
  });
};

//登录
const login = (req, res) => {
  const { student_id, password } = req.body;

  // 查询用户是否存在
  User.findByStudentId(student_id, (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    // 验证密码
    bcrypt.compare(password, user.password, (err, match) => {
      if (err || !match) {
        return res.status(401).json({ message: "密码错误" });
      }

      // 登录成功，生成JWT
      const token = jwtService.generateToken(user);

      // 返回JWT
      res.status(200).json({ token });
    });
  });
};

// 验证JWT
const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // 获取Authorization头部的Token

  if (!token) {
    return res.status(401).json({ message: "没有提供JWT" });
  }

  const userData = jwtService.verifyToken(token);
  if (!userData) {
    return res.status(403).json({ message: "无效的JWT" });
  }

  // 将用户数据附加到请求对象上，供后续中间件使用
  req.user = userData;
  next();
};
module.exports = { register, login, authenticateJWT };
