const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");

app.use(bodyParser.json()); // 解析JSON格式的请求体

// 注册路由
app.use("/api", authRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
