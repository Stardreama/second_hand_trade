const Product = require("../models/product"); // 引入 Product 模型
const { db } = require("../config/config");
// 发布商品
const createProduct = (req, res) => {
  // console.log("Request Body:", req.body);
  // console.log("Request File:", req.files);

  const { title, description, price, product_status, product_class } = req.body;
  const seller_id = req.seller_id; // 从 token 中获取的 seller_id
  const files = req.files; // 数组，最多包含5张图片
  const coverImage = files[0].path;

  if (
    !price ||
    !description ||
    !seller_id ||
    !title ||
    !product_status ||
    !product_class
  ) {
    return res.status(400).json({ message: "缺少必要的商品信息" });
  }
  if (!files || files.length < 1) {
    return res.status(400).json({ message: "缺少必要的商品图片" });
  }

  // 插入产品记录（只保存封面图片）
  Product.create(
    seller_id,
    price,
    description,
    coverImage,
    title,
    product_status,
    product_class,
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "数据库错误", error: err.message });
      }

      const productId = result.insertId; // 获取插入的 product_id
      console.log("产品插入成功，product_id:", productId); // 打印插入的产品 ID

      // 使用 Promise.all 确保所有图片都成功插入
      const insertPromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          Product.addImage(productId, file.path, (err, result) => {
            if (err) {
              console.error("图片插入失败", err);
              return reject(err);
            }
            resolve(result);
          });
        });
      });

      // 等待所有图片插入完成
      Promise.all(insertPromises)
        .then(() => {
          res.status(201).json({
            message: "商品发布成功",
            product_id: productId, // 返回 product_id
          });
        })
        .catch((err) => {
          res.status(500).json({ message: "图片上传失败", error: err.message });
        });
    }
  );
};

const addImage = (req, res) => {
  const { product_id } = req.body;
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "未上传图片" });
  }

  // 调用模型方法插入图片记录
  Product.addImage(product_id, file.path, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "图片上传失败", error: err.message });
    }
    res.status(200).json({ message: "图片上传成功" });
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
      product_id: product.product_id,
      price: product.price,
      description: product.description,
      image: product.image, // 假设商品图片是一个URL
      product_title: product.product_title,
    }));
    res.status(200).json(products);
  });
};
// 获取所有商品
const getAllProducts = async (req, res) => {
  try {
    const query = "SELECT * FROM products ORDER BY created_at DESC";
    db.query(query, (err, results) => {
      if (err) {
        console.error("查询商品出错:", err);
        return res.status(500).json({ message: "服务器错误" });
      }
      res.json(results);
    });
  } catch (error) {
    console.error("服务器错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};
module.exports = { createProduct, searchProduct, addImage, getAllProducts };
