require('dotenv').config();

console.log('环境变量 DB_HOST:', process.env.DB_HOST);
console.log('环境变量 DB_USER:', process.env.DB_USER);
console.log('环境变量 DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('环境变量 DB_DATABASE:', process.env.DB_DATABASE);

const mysql = require("mysql2");

// 使用连接池而不是单一连接
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// 测试连接
db.query('SELECT 1', (err) => {
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