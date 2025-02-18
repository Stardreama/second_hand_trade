const jwtService = require("../services/jwtService");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const register = (req, res) => {
  const { student_id, username, password, student_card } = req.body;

  User.create(student_id, username, password, student_card, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "数据库错误" });
    }

    res.status(200).json({ message: "注册成功" });
  });
};

module.exports = { register };
