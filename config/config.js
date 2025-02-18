const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "second_hand_trade",
});

db.connect((err) => {
  if (err) {
    console.error("数据库连接失败:", err);
    process.exit(1);
  }
  console.log("数据库连接成功");
});

// JWT 配置
const jwt = {
  secret: "secret_key", // 用于JWT的签名密钥
  expiresIn: "5h", // JWT有效期
};

module.exports = { db, jwt };
