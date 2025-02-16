import { createPool } from "mysql2";
import dotenv from "dotenv";

// 加载环境变量
dotenv.config();

// 创建数据库连接池
const pool = createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "marketplace2",
  waitForConnections: true, // 等待连接
  connectionLimit: 10, // 最大连接数
  queueLimit: 0, // 无限制排队
});

// 导出 Promise 版本的连接池
export default pool.promise();