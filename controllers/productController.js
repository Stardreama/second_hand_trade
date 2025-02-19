const Product = require("../models/product");

// 发布商品
const createProduct = (req, res) => {
  const { price, description, image } = req.body;

  // 检查请求是否包含必要的信息
  if (!price || !description || !image) {
    return res.status(400).json({ message: "缺少必要的商品信息" });
  }

  // 在数据库中创建商品
  Product.create(price, description, image, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "数据库错误" });
    }

    // 返回商品ID和成功消息
    res.status(201).json({
      message: "商品发布成功",
      product_id: result.insertId,
    });
  });
};

module.exports = { createProduct };
