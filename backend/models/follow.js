const { db } = require("../config/config");

// 检查是否已关注
const checkFollowStatus = async (follower_id, followee_id) => {
  return new Promise((resolve, reject) => {
    const query =
      "SELECT * FROM follows WHERE follower_id = ? AND followee_id = ?";
    db.query(query, [follower_id, followee_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.length > 0);
      }
    });
  });
};

// 添加关注
const addFollow = async (follower_id, followee_id) => {
  return new Promise((resolve, reject) => {
    const query =
      "INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)";
    db.query(query, [follower_id, followee_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// 取消关注
const removeFollow = async (follower_id, followee_id) => {
  return new Promise((resolve, reject) => {
    const query =
      "DELETE FROM follows WHERE follower_id = ? AND followee_id = ?";
    db.query(query, [follower_id, followee_id], (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

// 获取关注数
const getFollowCount = async (student_id) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?";
    db.query(query, [student_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0].count);
      }
    });
  });
};

// 获取粉丝数
const getFansCount = async (student_id) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT COUNT(*) AS count FROM follows WHERE followee_id = ?";
    db.query(query, [student_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results[0].count);
      }
    });
  });
};

// 获取关注列表
const getFolloweesList = async (student_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT u.student_id, u.avatar, u.username 
      FROM follows f 
      JOIN users u ON f.followee_id = u.student_id 
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `;
    db.query(query, [student_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// 获取粉丝列表
const getFansList = async (student_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT u.student_id, u.avatar, u.username
      FROM follows f
      JOIN users u ON f.follower_id = u.student_id
      WHERE f.followee_id = ?
      ORDER BY f.created_at DESC
    `;
    db.query(query, [student_id], (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  checkFollowStatus,
  addFollow,
  removeFollow,
  getFollowCount,
  getFansCount,
  getFolloweesList,
  getFansList,
};
