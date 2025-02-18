const jwtService = require("../services/jwtService");
const User = require("../models/user");
const bcrypt = require("bcrypt");

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
  });
  // 创建新用户
  User.create(student_id, username, password, student_card, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "数据库错误" });
    }

    res.status(200).json({ message: "注册成功" });
  });
};

module.exports = { register };
