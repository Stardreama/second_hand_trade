const { db } = require("../config/config");

const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};
const User = {
  // 添加创建带头像用户的方法
  createWithAvatar: (
    student_id,
    username,
    password,
    student_card,
    avatar,
    callback
  ) => {
    const query =
      "INSERT INTO users (student_id, username, password, student_card, avatar) VALUES (?, ?, ?, ?, ?)";
    db.query(
      query,
      [student_id, username, password, student_card, avatar],
      callback
    );
  },

  // 添加获取用户信息的方法
  getUserProfile: (student_id, callback) => {
    const query =
      "SELECT student_id, username, avatar FROM users WHERE student_id = ?";
    db.query(query, [student_id], callback);
  },

  // 根据 student_id 查询用户
  findByStudentId: (student_id, callback) => {
    const query = "SELECT * FROM users WHERE student_id = ?";
    db.query(query, [student_id], (err, result) => {
      if (err) return callback(err, null);
      callback(null, result); // 返回查询结果
    });
  },
  updateAvatar: (student_id, avatarPath, callback) => {
    const query = "UPDATE users SET avatar = ? WHERE student_id = ?";
    db.query(query, [avatarPath, student_id], callback);
  },
  // 更新昵称
  updateNickname: (student_id, nickname, callback) => {
    const query = "UPDATE users SET username = ? WHERE student_id = ?";
    db.query(query, [nickname, student_id], callback);
  },
  // 获取用户的 QRCode
  getQRCode: async (userId) => {
    const result = await query(
      "SELECT QRCode FROM users WHERE student_id = ?",
      [userId]
    );
    return result.length > 0 ? result[0].QRCode : null;
  },

  // 更新用户的 QRCode
  updateQRCode: async (userId, QRCode) => {
    const result = await query(
      "UPDATE users SET QRCode = ? WHERE student_id = ?",
      [QRCode, userId]
    );
    return result.affectedRows > 0;
  },
};

module.exports = User;
