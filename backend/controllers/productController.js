const Product = require("../models/product"); // 引入 Product 模型
const { db } = require("../config/config");
const jwtService = require("../services/jwtService");
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};
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

const updateProduct = async (req, res) => {
  try {
    const {
      product_id,
      title,
      description,
      price,
      original_price,
      product_status,
      product_class,
      status,
      product_type,
      deleted_images,
    } = req.body;

    const seller_id = req.seller_id;
    const files = req.files || [];

    // 基础字段验证
    if (!product_id || !description || !seller_id || !title || !product_class) {
      return res.status(400).json({ message: "缺少必要的商品信息" });
    }

    // 检查商品是否存在且属于当前用户
    const checkQuery =
      "SELECT * FROM products WHERE product_id = ? AND seller_id = ?";
    db.query(checkQuery, [product_id, seller_id], async (err, results) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "数据库错误", error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: "商品不存在或您无权编辑" });
      }

      // 开始事务
      db.beginTransaction(async (err) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "事务开始失败", error: err.message });
        }

        try {
          // 1. 更新商品基本信息
          let coverImage = results[0].image; // 默认保持原来的封面图片

          // 如果有新上传的图片，使用第一张作为新的封面
          if (files.length > 0) {
            coverImage = files[0].path;
          }

          const updateQuery = `
            UPDATE products 
            SET product_title = ?, description = ?, price = ?, original_price = ?,
                product_status = ?, product_class = ?, status = ?, product_type = ?, image = ?
            WHERE product_id = ? AND seller_id = ?
          `;

          await new Promise((resolve, reject) => {
            db.query(
              updateQuery,
              [
                title,
                description,
                price || 0,
                original_price || 0,
                product_status,
                product_class,
                status || "",
                product_type,
                coverImage,
                product_id,
                seller_id,
              ],
              (err, result) => {
                if (err) reject(err);
                else resolve(result);
              }
            );
          });

          // 2. 处理删除的图片
          if (deleted_images) {
            const imagesToDelete = JSON.parse(deleted_images);
            if (imagesToDelete.length > 0) {
              const deleteImageQuery =
                "DELETE FROM product_images WHERE product_id = ? AND image_url IN (?)";
              await new Promise((resolve, reject) => {
                db.query(
                  deleteImageQuery,
                  [product_id, imagesToDelete],
                  (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                  }
                );
              });
            }
          }

          // 3. 添加新图片
          if (files.length > 0) {
            const insertImagePromises = files.map((file) => {
              return new Promise((resolve, reject) => {
                Product.addImage(product_id, file.path, (err, result) => {
                  if (err) reject(err);
                  else resolve(result);
                });
              });
            });

            await Promise.all(insertImagePromises);
          }

          // 提交事务
          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                res
                  .status(500)
                  .json({ message: "提交事务失败", error: err.message });
              });
            }

            res.status(200).json({ message: "商品更新成功", product_id });
          });
        } catch (error) {
          // 回滚事务
          db.rollback(() => {
            res
              .status(500)
              .json({ message: "更新商品失败", error: error.message });
          });
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: "服务器错误", error: error.message });
  }
};
toggleLike = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user.student_id; // 从 JWT 解析出的用户 ID
  if (!productId || !userId) {
    return res.status(400).json({ message: "参数错误" });
  }

  try {
    const liked = await Product.isLiked(userId, productId);

    if (liked) {
      await Product.removeLike(userId, productId);
      res.json({ liked: false, message: "取消点赞成功" });
    } else {
      await Product.addLike(userId, productId);
      res.json({ liked: true, message: "点赞成功" });
    }
  } catch (error) {
    console.error("点赞操作失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};
// 获取商品详情，并返回是否点过赞
getProductLike = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user ? req.user.student_id : null; // 可能未登录

  try {
    const [product] = await query(
      "SELECT * FROM products WHERE product_id = ?",
      [productId]
    );
    if (product.length === 0) {
      return res.status(404).json({ message: "商品不存在" });
    }

    let liked = false;
    if (userId) {
      liked = await Product.isLiked(userId, productId);
    }

    res.json({ ...product[0], liked });
  } catch (error) {
    console.error("获取商品详情失败:", error);
    res.status(500).json({ message: "服务器错误" });
  }
};

module.exports = {
  createProduct,
  searchProduct,
  addImage,
  getAllProducts,
  getProductById,
  getMySaleProducts,
  updateProduct,
  toggleLike,
  getProductLike,
};
