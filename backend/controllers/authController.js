const jwtService = require("../services/jwtService");
const User = require("../models/user");
const bcrypt = require("bcrypt");

//注册
const register = (req, res) => {
  const { student_id, username, password, student_card } = req.body;

  console.log("注册请求数据：", req.body);

  // 首先检查 student_id 是否已存在
  User.findByStudentId(student_id, (err, result) => {
    if (err) {
      console.error("查询数据库错误：", err);
      return res.status(500).json({ message: "数据库错误" });
    }

    if (result && result.length > 0) {
      console.log("该学生ID已被注册：", student_id);
      return res.status(400).json({ message: "该学生ID已被注册" });
    }

    // 密码加密
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("密码加密失败：", err);
        return res.status(500).json({ message: "密码加密失败" });
      }

      // 创建新用户
      User.create(student_id, username, hashedPassword, student_card, (err, result) => {
        if (err) {
          console.error("创建用户失败：", err);
          return res.status(500).json({ message: "数据库错误" });
        }
        console.log("注册成功，用户ID:", result.insertId);
        res.status(200).json({ message: "注册成功" });
      });
    });
  });
};

//登录
const login = (req, res) => {
  const { student_id, password } = req.body;

  console.log("登录请求数据：", req.body);

  // 查询用户是否存在，假设返回的是一个数组
  User.findByStudentId(student_id, (err, result) => {
    if (err) {
      console.error("查询用户错误：", err);
      return res.status(500).json({ message: "数据库错误" });
    }
    if (!result || result.length === 0) {
      console.log("用户不存在：", student_id);
      return res.status(404).json({ message: "用户不存在" });
    }

    // 从返回的数组中取出第一个用户对象
    const user = result[0];

    if (!user.password) {
      console.error("用户数据异常，未找到密码字段：", user);
      return res.status(500).json({ message: "服务器错误，用户数据异常" });
    }

    // 验证密码
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error("密码比较错误：", err);
        return res.status(500).json({ message: "服务器错误" });
      }
      if (!match) {
        console.log("密码错误：", student_id);
        return res.status(401).json({ message: "密码错误" });
      }

      // 登录成功，生成JWT
      const token = jwtService.generateToken(user);
      console.log("登录成功，生成JWT：", token);

      // 返回JWT
      res.status(200).json({ token });
    });
  });
};

// 验证JWT
const authenticateJWT = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // 获取Authorization头部的Token

  if (!token) {
    console.log("没有提供JWT");
    return res.status(401).json({ message: "没有提供JWT" });
  }

  const userData = jwtService.verifyToken(token);
  if (!userData) {
    console.log("无效的JWT");
    return res.status(403).json({ message: "无效的JWT" });
  }

  // 将用户数据附加到请求对象上，供后续中间件使用
  req.user = userData;
  next();
};

module.exports = { register, login, authenticateJWT };
