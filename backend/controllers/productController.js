const Product = require("../models/product");

// 发布商品
const createProduct = (req, res) => {
  const { price, description, seller_id } = req.body;
  // 从 multer 中获取上传文件的信息
  const image = req.file ? req.file.path : null;

  // 检查请求是否包含必要的信息
  if (!price || !description || !image || !seller_id) {
    return res.status(400).json({ message: "缺少必要的商品信息" });
  }

  // 在数据库中创建商品
  Product.create(price, description, image, seller_id, (err, result) => {
    if (err) {
      return res.status(500).json({ message: "数据库错误", error: err.message });
    }

    // 返回商品ID和成功消息
    res.status(201).json({
      message: "商品发布成功",
      product_id: result.insertId,
    });
  });
};

// 搜索商品
const searchProduct = (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ message: "缺少搜索关键词" });
  }

  // 根据关键词查询商品
  Product.search(keyword, (err, results) => {
    if (err) {
      return res.status(500).json({ message: "数据库错误" });
    }

    // 返回匹配的商品列表
    const products = results.map((product) => ({
      product_id: product.id,
      price: product.price,
      description: product.description,
      image: product.image, // 假设商品图片是一个URL
    }));

    res.status(200).json(products);
  });
};

module.exports = { createProduct, searchProduct };
