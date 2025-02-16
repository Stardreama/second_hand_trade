import express from "express";
import createError from "http-errors";
import logger from "morgan";
import cors from "cors";
import db from "./db.js"; // 引入数据库配置

// 示例路由
import usersRouter from "./routes/users.js";

const app = express();

// 中间件
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// 示例路由
app.use("/api/users", usersRouter);

// 404 错误处理
app.use((req, res, next) => {
  next(createError(404));
});

// 错误处理中间件
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: err.status || 500,
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// 测试数据库连接
async function testDatabaseConnection() {
  try {
    await db.query("SELECT 1 + 1 AS solution");
    console.log("Database connection established.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
    process.exit(1); // 如果连接失败，终止进程
  }
}

// 启动服务器
const PORT = process.env.PORT || 5000;
testDatabaseConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});