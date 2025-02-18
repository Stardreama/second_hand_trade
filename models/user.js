const mysql = require("mysql2");
const { db, jwt } = require("../config/config");

const User = {
  create: (student_id, username, password, student_card, callback) => {
    const query =
      "INSERT INTO users (student_id, username, password, student_card) VALUES (?, ?, ?, ?)";
    db.query(query, [student_id, username, password, student_card], callback);
  },
};

module.exports = User;
