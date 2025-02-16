const db = require("./config/db");

const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

db.connect((err) => {
  if (err) {
    console.error("MySQL 连接失败: " + err.stack); // 连接失败，输出错误信息
    return;
  }
  console.log("MySQL 连接成功，连接 ID: " + db.threadId); // 连接成功，输出连接 ID
});
// 启动服务器
app.listen(port, () => {
  console.log("服务器已启动，访问 http://localhost:${port}");
});
