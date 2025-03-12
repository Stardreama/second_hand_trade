const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const cors = require('cors');

// 使用 CORS 中间件，允许所有源
app.use(cors({
  origin: 'http://localhost:5173',  // 允许的前端地址
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json()); // 解析JSON格式的请求体

// 注册路由
app.use("/api", authRoutes);
// 商品相关路由
app.use("/api/products", productRoutes);

// 加载路由
app.use("/api/orders", orderRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
