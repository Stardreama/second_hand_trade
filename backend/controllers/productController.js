const Product = require("../models/product"); // 引入 Product 模型
const { db } = require("../config/config");
const jwtService = require("../services/jwtService");
// 发布商品
const createProduct = (req, res) => {
  console.log("Request Body:", req.body);

  const {
    title,
    description,
    price,
    original_price,
    product_status,
    status,
    product_class,
    product_type,
  } = req.body;

  const seller_id = req.seller_id;
  const files = req.files || []; // 可能没有文件

  // 根据产品类型设置默认图片
  let coverImage;
  if (files.length > 0) {
    // 如果上传了图片，使用第一张作为封面
    coverImage = files[0].path;
  } else {
    // 没有上传图片，使用默认图片
    coverImage =
      product_type === "buy"
        ? "https://s21.ax1x.com/2025/03/19/pEwJHfJ.png" // 求购默认图片
        : "https://s21.ax1x.com/2025/03/19/pEwJ6YQ.png"; // 出售默认图片
  }

  // 处理求购商品的默认值
  const finalProductStatus = product_type === "buy" ? "求购" : product_status;

  // 基础字段验证
  if (!description || !seller_id || !title || !product_class) {
    return res.status(400).json({ message: "缺少必要的商品信息" });
  }

  if (product_type === "sell" && !price) {
    return res.status(400).json({ message: "出售商品需要设置价格" });
  }

  // 插入产品记录
  Product.create(
    seller_id,
    price || 0,
    original_price || 0,
    description,
    coverImage,
    title,
    finalProductStatus,
    product_class,
    status || "",
    product_type || "sell",
    (err, result) => {
      if (err) {
        return res.status(500).json({
          message: "数据库错误",
          error: err.message,
        });
      }

      const productId = result.insertId;
      console.log("产品插入成功，product_id:", productId);

      // 如果有额外的图片，上传它们
      // if (1) {
      // 从第2张图片开始上传（第1张已作为封面）
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

      // 等待所有额外图片插入完成
      Promise.all(insertPromises)
        .then(() => {
          res.status(201).json({
            message:
              product_type === "buy" ? "求购信息发布成功" : "商品发布成功",
            product_id: productId,
          });
        })
        .catch((err) => {
          // 即使额外图片上传失败，商品仍然创建成功
          res.status(201).json({
            message:
              product_type === "buy"
                ? "求购信息发布成功，但部分图片上传失败"
                : "商品发布成功，但部分图片上传失败",
            product_id: productId,
            warning: "部分图片上传失败",
          });
        });
      // }
      // else {
      //   // 没有额外图片
      //   res.status(201).json({
      //     message: product_type === "buy" ? "求购信息发布成功" : "商品发布成功",
      //     product_id: productId,
      //   });
      // }
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
// const createProductNoImage = (req, res) => {
//   const {
//     title,
//     description,
//     price,
//     product_status,
//     product_class,
//     product_type,
//   } = req.body;
//   const seller_id = req.seller_id;

//   // 验证是否为求购类型
//   // if (product_type !== "buy") {
//   //   return res.status(400).json({ message: "非求购类型必须上传图片" });
//   // }

//   // 验证必要字段
//   if (!description || !seller_id || !title || !product_class) {
//     return res.status(400).json({ message: "缺少必要的求购信息" });
//   }

//   // 使用默认图片路径或null
//   const defaultImage = null; // 或者设置一个默认的"求购"图片

//   // 插入求购记录
//   Product.create(
//     seller_id,
//     price || 0,
//     description,
//     defaultImage,
//     title,
//     "求购", // 固定状态为"求购"
//     product_class,
//     "buy",
//     (err, result) => {
//       if (err) {
//         return res
//           .status(500)
//           .json({ message: "数据库错误", error: err.message });
//       }

//       const productId = result.insertId;
//       console.log("求购信息插入成功，product_id:", productId);

//       res.status(201).json({
//         message: "求购信息发布成功",
//         product_id: productId,
//       });
//     }
//   );
// };

const getProductById = (req, res) => {
  const { product_id } = req.params;

  // 查询商品表，获取seller_id
  const query = "SELECT * FROM products WHERE product_id = ?";
  db.query(query, [product_id], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "服务器错误" });
    }
    if (result.length === 0) {
      return res.status(404).json({ message: "商品未找到" });
    }

    const product = result[0];

    // 根据 seller_id 查询 users 表中的 username 和 avatar
    const userQuery = "SELECT username, avatar FROM users WHERE student_id = ?";
    db.query(userQuery, [product.seller_id], (err, userResult) => {
      if (err) {
        return res.status(500).json({ message: "服务器错误" });
      }

      if (userResult.length === 0) {
        return res.status(404).json({ message: "卖家信息未找到" });
      }

      const seller = userResult[0];

      // 为商品添加 seller_name 和 avatar（头像）
      product.seller_name = seller.username;
      product.seller_avatar =
        seller.avatar || "../../../static/img/default-avatar.jpg"; // 默认头像好像没必要，先不动他
      console.log(product.seller_avatar);
      console.log(product.seller_name);

      // 获取商品的所有图片
      const imageQuery =
        "SELECT image_url FROM product_images WHERE product_id = ?";
      db.query(imageQuery, [product_id], (err, imageResult) => {
        if (err) {
          return res.status(500).json({ message: "服务器错误" });
        }

        product.images = imageResult.map((img) => img.image_url);
        //console.log(product.images);
        // 返回完整的商品信息
        // ✅ status 已经在 product 对象里
        // console.log("Returning product with status:", product.status);
        console.log("Returning product with op:", product.original_price);

        res.json(product);
      });
    });
  });
};

// 获取我的出售商品
const getMySaleProducts = async (req, res) => {
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
  getProductById,
  getMySaleProducts,
};
