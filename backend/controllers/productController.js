const Product = require("../models/product"); // 引入 Product 模型
const { db } = require("../config/config");
const jwtService = require("../services/jwtService");
// 发布商品
const createProduct = (req, res) => {
  // console.log("Request Body:", req.body);
  // console.log("Request File:", req.files);

  const {
    title,
    description,
    price,
    product_status,
    product_class,
    product_type,
  } = req.body;
  const seller_id = req.seller_id; // 从 token 中获取的 seller_id
  const files = req.files; // 数组，最多包含5张图片
  const coverImage = files[0].path;
  // 处理求购商品的默认值
  const finalProductStatus = product_type === "buy" ? "求购" : product_status;
  const finalPrice = product_type === "buy" ? 0 : price; // 求购商品可以设置预期价格或0
  if (product_type === "sell") {
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
  } else if (product_type === "buy") {
    if (!description || !seller_id || !title || !product_class) {
      return res.status(400).json({ message: "缺少必要的求购信息" });
    }
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
    product_type || "sell", // 默认为出售
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
// 创建无图片的求购信息
const createProductNoImage = (req, res) => {
  const {
    title,
    description,
    price,
    product_status,
    product_class,
    product_type,
  } = req.body;
  const seller_id = req.seller_id;

  // 验证是否为求购类型
  if (product_type !== "buy") {
    return res.status(400).json({ message: "非求购类型必须上传图片" });
  }

  // 验证必要字段
  if (!description || !seller_id || !title || !product_class) {
    return res.status(400).json({ message: "缺少必要的求购信息" });
  }

  // 使用默认图片路径或null
  const defaultImage = null; // 或者设置一个默认的"求购"图片

  // 插入求购记录
  Product.create(
    seller_id,
    price || 0,
    description,
    defaultImage,
    title,
    "求购", // 固定状态为"求购"
    product_class,
    "buy",
    (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "数据库错误", error: err.message });
      }

      const productId = result.insertId;
      console.log("求购信息插入成功，product_id:", productId);

      res.status(201).json({
        message: "求购信息发布成功",
        product_id: productId,
      });
    }
  );
};

// 获取我的出售商品
getMySaleProducts = async (req, res) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res.status(401).json({ code: 401, message: "未提供认证令牌" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwtService.verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ code: 401, message: "无效的令牌" });
    }
    const studentId = decoded.student_id;
    // 使用 await 等待 Promise 解决
    const products = await Product.findBySellerId(studentId);
    res.json({ code: 200, data: products, message: "获取成功" });
  } catch (error) {
    console.error("获取我的出售商品失败:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误，获取出售商品失败",
    });
  }
};
module.exports = {
  createProduct,
  searchProduct,
  addImage,
  getAllProducts,
  createProductNoImage,
  getMySaleProducts,
};
