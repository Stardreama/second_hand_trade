const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

app.use(bodyParser.json()); // 解析JSON格式的请求体

// 添加 CORS 中间件
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

// 注册路由
app.use("/api", authRoutes);
// 商品相关路由
app.use("/api/products", productRoutes);

// 加载路由
app.use("/api/orders", orderRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
