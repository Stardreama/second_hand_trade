const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

const bodyParser = require("body-parser");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

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
