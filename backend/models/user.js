const { db } = require("../config/config");

const User = {
  // 创建用户
  create: (student_id, username, password, student_card, callback) => {
    const query =
      "INSERT INTO users (student_id, username, password, student_card) VALUES (?, ?, ?, ?)";
    db.query(query, [student_id, username, password, student_card], callback);
  },

  // 根据 student_id 查询用户
  findByStudentId: (student_id, callback) => {
    const query = "SELECT * FROM users WHERE student_id = ?";
    db.query(query, [student_id], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result); // 返回查询结果
    });
  },
};

module.exports = User;
