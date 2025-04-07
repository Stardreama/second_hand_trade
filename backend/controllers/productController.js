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
    is_off_shelf,
    coverIndex, // 封面索引字段
    address,
  } = req.body;
  console.log("后端收到封面索引:", coverIndex);

  const seller_id = req.seller_id;
  const files = req.files || []; // 可能没有文件
  console.log("进入发布商品这里files.length:", files.length);
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
    //coverImage,
    title,
    finalProductStatus,
    product_class,
    status || "",
    product_type || "sell",
    is_off_shelf || 0, // 默认上架
    address,
    (err, result) => {
      if (err) {
        console.log("插入产品错误:", err);

        return res.status(500).json({
          message: "数据库错误",
          error: err.message,
        });
      }
      console.log("插入产品结果:", result);

      const productId = result.insertId;
      console.log("产品插入成功，product_id:", productId);
      // 准备插入所有图片的Promise数组
      let insertPromises = [];

      // 如果没有上传图片，使用默认图片
      if (files.length === 0) {
        const defaultImage =
          product_type === "buy"
            ? "https://s21.ax1x.com/2025/03/19/pEwJHfJ.png" // 求购默认图片
            : "https://s21.ax1x.com/2025/03/19/pEwJ6YQ.png"; // 出售默认图片

        insertPromises.push(
          new Promise((resolve, reject) => {
            Product.addImage(
              productId,
              defaultImage,
              1, // 设置为默认图片
              (err, result) => {
                if (err) {
                  console.error("默认图片插入失败", err);
                  return reject(err);
                }
                resolve(result);
              }
            );
          })
        );
      }

      // 添加用户上传的图片
      if (files.length > 0) {
        // 验证封面索引是否有效
        console.log("添加用户上传的图片这里files.length:", files.length);

        const parsedCoverIndex = parseInt(coverIndex);
        const isValidCoverIndex =
          !isNaN(parsedCoverIndex) &&
          parsedCoverIndex >= 0 &&
          parsedCoverIndex < files.length;

        console.log(
          "封面索引验证:",
          parsedCoverIndex,
          "是否有效:",
          isValidCoverIndex
        );

        // 首先清除默认标志
        const filePromises = files.map((file, index) => {
          return new Promise((resolve, reject) => {
            // 判断当前图片是否应该是封面
            const isDefault = isValidCoverIndex
              ? index === parsedCoverIndex
                ? 1
                : 0
              : index === 0
                ? 1
                : 0;

            console.log(
              `处理图片 ${index}:`,
              file.path,
              "是否默认:",
              isDefault,
              "封面索引:",
              parsedCoverIndex
            );

            Product.addImage(productId, file.path, isDefault, (err, result) => {
              if (err) {
                console.error(`图片${index}插入失败`, err);
                return reject(err);
              }
              resolve(result);
            });
          });
        });

        insertPromises = insertPromises.concat(filePromises);
      }

      // 等待所有图片插入完成
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
  const { product_id, is_cover } = req.body;
  const file = req.file;
  if (!file) {
    return res.status(400).json({ message: "未上传图片" });
  }

  // 如果设置为封面，先清除其他图片的封面标记
  const handleImage = async () => {
    try {
      // 如果要设为封面，先清除其他图片的封面标记
      if (is_cover === "1" || is_cover === true || is_cover === 1) {
        await new Promise((resolve, reject) => {
          db.query(
            "UPDATE product_images SET is_default = 0 WHERE product_id = ?",
            [product_id],
            (err, result) => {
              if (err) reject(err);
              else resolve(result);
            }
          );
        });

        // 添加新图片并设置为封面
        Product.addImage(product_id, file.path, 1, (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "图片上传失败", error: err.message });
          }
          res.status(200).json({ message: "封面图片上传成功" });
        });
      } else {
        // 普通图片添加
        Product.addImage(product_id, file.path, 0, (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "图片上传失败", error: err.message });
          }
          res.status(200).json({ message: "图片上传成功" });
        });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: "图片处理失败", error: error.message });
    }
  };

  handleImage();
};

// 搜索商品
const searchProduct = (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({ message: "缺少搜索关键词" });
  }

  // 修改查询，使用JOIN获取默认图片
  const query = `
    SELECT p.*, 
      (SELECT pi.image_url FROM product_images pi 
       WHERE pi.product_id = p.product_id AND pi.is_default = 1 
       LIMIT 1) as image
    FROM products p 
    WHERE p.description LIKE ? OR p.product_title LIKE ?
    ORDER BY p.created_at DESC
  `;

  const searchPattern = `%${keyword}%`; // 模糊匹配

  db.query(query, [searchPattern, searchPattern], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "数据库错误" });
    }

    // 为没有默认图片的商品设置默认图片
    results.forEach((product) => {
      if (!product.image) {
        product.image =
          product.product_type === "buy"
            ? "https://s21.ax1x.com/2025/03/19/pEwJHfJ.png"
            : "https://s21.ax1x.com/2025/03/19/pEwJ6YQ.png";
      }
    });

    // 返回匹配的商品列表
    res.status(200).json(results);
  });
};
// 获取所有商品
const getAllProducts = async (req, res) => {
  try {
    // 修改查询，使用JOIN获取默认图片
    const query = `
      SELECT p.*, 
        (SELECT pi.image_url FROM product_images pi 
         WHERE pi.product_id = p.product_id AND pi.is_default = 1 
         LIMIT 1) as image
      FROM products p 
      ORDER BY p.created_at DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("查询商品出错:", err);
        return res.status(500).json({ message: "服务器错误" });
      }

      // 为没有默认图片的商品设置默认图片
      results.forEach((product) => {
        if (!product.image) {
          product.image =
            product.product_type === "buy"
              ? "https://s21.ax1x.com/2025/03/19/pEwJHfJ.png"
              : "https://s21.ax1x.com/2025/03/19/pEwJ6YQ.png";
        }
      });

      res.json(results);
    });
  } catch (error) {
    console.error("服务器错误:", error);
    res.status(500).json({ message: "服务器错误" });
  }
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
// 删除商品
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const sellerId = req.user.student_id; // 从JWT中获取用户ID

    if (!productId) {
      return res.status(400).json({ code: 400, message: "缺少商品ID" });
    }

    try {
      await Product.deleteProduct(productId, sellerId);
      res.status(200).json({
        code: 200,
        message: "商品删除成功",
        data: { productId }
      });
    } catch (error) {
      if (error.message.includes("无权删除")) {
        return res.status(403).json({
          code: 403,
          message: error.message
        });
      }
      throw error; // 其他错误继续向上抛出
    }
  } catch (error) {
    console.error("删除商品失败:", error);
    res.status(500).json({
      code: 500,
      message: "服务器错误，删除商品失败"
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
      coverIndex, // 封面索引字段
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

      // 从连接池获取连接
      db.getConnection((err, connection) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "获取数据库连接失败", error: err.message });
        }

        // 开始事务
        connection.beginTransaction(async (err) => {
          if (err) {
            connection.release(); // 发生错误时释放连接
            return res
              .status(500)
              .json({ message: "事务开始失败", error: err.message });
          }

          try {
            // 1. 更新商品基本信息
            const updateQueryWithoutImage = `
              UPDATE products 
              SET product_title = ?, description = ?, price = ?, original_price = ?,
                  product_status = ?, product_class = ?, status = ?, product_type = ?
              WHERE product_id = ? AND seller_id = ?
            `;

            await new Promise((resolve, reject) => {
              connection.query(
                updateQueryWithoutImage,
                [
                  title,
                  description,
                  price || 0,
                  original_price || 0,
                  product_status,
                  product_class,
                  status || "",
                  product_type,
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
            console.log("000后端：需要删除Images:", deleted_images);

            if (deleted_images) {
              try {
                // 检查deleted_images是否已经是数组
                if (Array.isArray(deleted_images)) {
                  console.log("deleted_images已经是数组:", deleted_images);

                  imagesToDelete = deleted_images;
                } else {
                  // 尝试解析JSON字符串
                  try {
                    imagesToDelete = JSON.parse(deleted_images);
                  } catch (jsonError) {
                    console.error("JSON解析失败，尝试其他方法:", jsonError);

                    // 如果JSON解析失败，尝试按逗号分隔
                    if (typeof deleted_images === "string") {
                      imagesToDelete = deleted_images.split(",");
                      console.log("按逗号分隔后:", imagesToDelete);
                    }
                  }
                }
              } catch (error) {
                console.error("处理删除图片列表失败:", error);
                // 出错时设为空数组
                imagesToDelete = [];
              }
              console.log("111后端：需要删除Images:", imagesToDelete);

              if (imagesToDelete.length > 0) {
                // 为每个图片创建一个占位符
                const placeholders = imagesToDelete.map(() => "?").join(",");

                // 执行删除操作
                const deleteImageQuery = `DELETE FROM product_images WHERE product_id = ? AND image_url IN (${placeholders})`;

                // 准备参数数组
                const queryParams = [product_id, ...imagesToDelete];

                await new Promise((resolve, reject) => {
                  connection.query(
                    deleteImageQuery,
                    queryParams,
                    (err, result) => {
                      if (err) {
                        console.error("删除图片错误:", err);
                        reject(err);
                      } else resolve(result);
                    }
                  );
                });

                console.log("删除图片成功，继续处理...");

                // 添加：在删除后检查是否还有图片
                const checkRemainingImagesQuery =
                  "SELECT COUNT(*) as count FROM product_images WHERE product_id = ?";

                const remainingImagesResult = await new Promise(
                  (resolve, reject) => {
                    connection.query(
                      checkRemainingImagesQuery,
                      [product_id],
                      (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                      }
                    );
                  }
                );

                // 如果没有剩余图片，添加默认图片
                if (remainingImagesResult[0].count === 0) {
                  // 获取产品类型以确定使用哪个默认图片
                  console.log("没有剩余图片，添加默认图片。");

                  const productTypeQuery =
                    "SELECT product_type FROM products WHERE product_id = ?";
                  const productTypeResult = await new Promise(
                    (resolve, reject) => {
                      connection.query(
                        productTypeQuery,
                        [product_id],
                        (err, result) => {
                          if (err) reject(err);
                          else resolve(result);
                        }
                      );
                    }
                  );

                  const productType = productTypeResult[0].product_type;
                  const defaultImage =
                    productType === "buy"
                      ? "https://s21.ax1x.com/2025/03/19/pEwJHfJ.png" // 求购默认图片
                      : "https://s21.ax1x.com/2025/03/19/pEwJ6YQ.png"; // 出售默认图片

                  // 添加默认图片到 product_images 表
                  await new Promise((resolve, reject) => {
                    connection.query(
                      "INSERT INTO product_images (product_id, image_url, is_default) VALUES (?, ?, 1)",
                      [product_id, defaultImage],
                      (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                      }
                    );
                  });

                  // // 更新 products 表的 image 字段
                  // await new Promise((resolve, reject) => {
                  //   connection.query(
                  //     "UPDATE products SET image = ? WHERE product_id = ?",
                  //     [defaultImage, product_id],
                  //     (err, result) => {
                  //       if (err) reject(err);
                  //       else resolve(result);
                  //     }
                  //   );
                  // });
                  console.log("添加默认图片结束");
                } else {
                  console.log("删除图片后仍有剩余图片，无需添加默认图片。");
                }
              }
            }

            // 3. 添加新图片
            if (files.length > 0) {
              // 解析封面索引
              const parsedCoverIndex = parseInt(coverIndex);
              const validCoverIndex =
                !isNaN(parsedCoverIndex) &&
                parsedCoverIndex >= 0 &&
                parsedCoverIndex < files.length;

              // 获取现有图片数量，用于校正coverIndex
              const existingImagesQuery =
                "SELECT COUNT(*) as count FROM product_images WHERE product_id = ?";
              const existingImagesResult = await new Promise(
                (resolve, reject) => {
                  connection.query(
                    existingImagesQuery,
                    [product_id],
                    (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    }
                  );
                }
              );

              const existingCount = existingImagesResult[0].count;

              const insertImagePromises = files.map((file, index) => {
                // 如果用户选择了封面且是在新上传的图片中
                let isDefault = 0;
                if (validCoverIndex && coverIndex === index) {
                  isDefault = 1;
                  // 清除其他图片的默认标记
                  connection.query(
                    "UPDATE product_images SET is_default = 0 WHERE product_id = ?",
                    [product_id]
                  );
                }

                return new Promise((resolve, reject) => {
                  connection.query(
                    "INSERT INTO product_images (product_id, image_url, is_default) VALUES (?, ?, ?)",
                    [product_id, file.path, isDefault],
                    (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    }
                  );
                });
              });

              await Promise.all(insertImagePromises);
            }
            // 更新现有图片中的封面图片
            const parsedCoverIndex = parseInt(coverIndex);

            // 如果封面是选择了现有图片中的一张（不是新上传的图片）
            if (!isNaN(parsedCoverIndex) && parsedCoverIndex >= 0) {
              const existingImagesQuery =
                "SELECT id, image_url FROM product_images WHERE product_id = ? ORDER BY id ASC";
              const existingImages = await new Promise((resolve, reject) => {
                connection.query(
                  existingImagesQuery,
                  [product_id],
                  (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                  }
                );
              });

              // 找到对应的图片ID
              if (
                existingImages.length > 0 &&
                parsedCoverIndex < existingImages.length
              ) {
                // 先清除所有默认标记
                await new Promise((resolve, reject) => {
                  connection.query(
                    "UPDATE product_images SET is_default = 0 WHERE product_id = ?",
                    [product_id],
                    (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    }
                  );
                });

                // 设置新的默认图片
                await new Promise((resolve, reject) => {
                  connection.query(
                    "UPDATE product_images SET is_default = 1 WHERE id = ?",
                    [existingImages[parsedCoverIndex].id],
                    (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    }
                  );
                });
              }
            }
            // 4. 确保至少有一张默认图片
            const checkDefaultImageQuery =
              "SELECT COUNT(*) as count FROM product_images WHERE product_id = ? AND is_default = 1";

            const defaultImageResult = await new Promise((resolve, reject) => {
              connection.query(
                checkDefaultImageQuery,
                [product_id],
                (err, result) => {
                  if (err) reject(err);
                  else resolve(result);
                }
              );
            });

            // 如果没有默认图片，选择第一张作为默认图片
            if (defaultImageResult[0].count === 0) {
              // 查找第一张图片
              const findFirstImageQuery =
                "SELECT id FROM product_images WHERE product_id = ? ORDER BY id ASC LIMIT 1";

              const firstImageResult = await new Promise((resolve, reject) => {
                connection.query(
                  findFirstImageQuery,
                  [product_id],
                  (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                  }
                );
              });

              // 如果找到了图片，设为默认
              if (firstImageResult && firstImageResult.length > 0) {
                await new Promise((resolve, reject) => {
                  connection.query(
                    "UPDATE product_images SET is_default = 1 WHERE id = ?",
                    [firstImageResult[0].id],
                    (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    }
                  );
                });
              } else {
                // 如果没有任何图片，添加默认图片
                const defaultImage =
                  product_type === "buy"
                    ? "https://s21.ax1x.com/2025/03/19/pEwJHfJ.png"
                    : "https://s21.ax1x.com/2025/03/19/pEwJ6YQ.png";

                await new Promise((resolve, reject) => {
                  connection.query(
                    "INSERT INTO product_images (product_id, image_url, is_default) VALUES (?, ?, 1)",
                    [product_id, defaultImage],
                    (err, result) => {
                      if (err) reject(err);
                      else resolve(result);
                    }
                  );
                });
              }
            }

            // 提交事务
            connection.commit((err) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release(); // 释放连接
                  res
                    .status(500)
                    .json({ message: "提交事务失败", error: err.message });
                });
              }

              connection.release(); // 释放连接
              res.status(200).json({ message: "商品更新成功", product_id });
            });
          } catch (error) {
            // 回滚事务
            connection.rollback(() => {
              connection.release(); // 释放连接
              res
                .status(500)
                .json({ message: "更新商品失败", error: error.message });
            });
          }
        });
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
// 获取用户点赞总数
const getUserLikeAmount = async (req, res) => {
  try {
    const seller_id = req.user?.student_id; // 从 token 中获取 seller_id

    if (!seller_id) {
      return res.status(401).json({ code: 401, message: "无效的用户身份" });
    }

    // 查询该用户发布的所有商品的 like_amount 总和
    const [rows] = await query(
      "SELECT COALESCE(SUM(like_amount), 0) AS total_likes FROM products WHERE seller_id = ?",
      [seller_id]
    );
    // 确保 rows 有值并且 total_likes 不为 undefined
    const totalLikes = rows.total_likes || 0;
    res.json({ code: 200, total_likes: totalLikes });
  } catch (error) {
    console.error("获取点赞总数失败:", error);
    res.status(500).json({ code: 500, message: "服务器错误" });
  }
};
// 更新商品价格
const updatePrice = async (req, res) => {
  try {
    const { productId, newPrice } = req.body;
    const userId = req.user.student_id; // 从JWT中获取用户ID

    // 验证参数
    if (!productId || !newPrice) {
      return res.status(400).json({ code: 400, message: "缺少必要参数" });
    }

    // 验证价格格式
    if (isNaN(newPrice) || newPrice < 0) {
      return res.status(400).json({ code: 400, message: "价格格式不正确" });
    }

    // 验证商品所有权 - 使用回调方式而不是await
    db.query(
      "SELECT * FROM products WHERE product_id = ? AND seller_id = ?",
      [productId, userId],
      (err, products) => {
        if (err) {
          console.error("查询商品失败:", err);
          return res
            .status(500)
            .json({ code: 500, message: "服务器错误，查询商品失败" });
        }

        if (products.length === 0) {
          return res
            .status(403)
            .json({ code: 403, message: "您没有权限修改此商品" });
        }

        // 更新商品价格 - 使用回调方式
        db.query(
          "UPDATE products SET price = ? WHERE product_id = ?",
          [newPrice, productId],
          (err, result) => {
            if (err) {
              console.error("更新价格失败:", err);
              return res
                .status(500)
                .json({ code: 500, message: "服务器错误，更新价格失败" });
            }

            // 返回成功响应
            res.json({
              code: 200,
              message: "价格更新成功",
              data: { productId, newPrice },
            });
          }
        );
      }
    );
  } catch (error) {
    console.error("更新商品价格失败:", error);
    res.status(500).json({ code: 500, message: "服务器错误，更新价格失败" });
  }
};
// 添加商品上下架控制器方法
const updateProductStatus = async (req, res) => {
  try {
    const { productId, status } = req.body;
    const sellerId = req.user.student_id; // 从JWT获取用户ID

    // 验证参数
    if (!productId) {
      return res.status(400).json({ code: 400, message: "缺少商品ID" });
    }

    // 检查商品是否属于当前用户
    const checkProduct = await query(
      "SELECT * FROM products WHERE product_id = ? AND seller_id = ?",
      [productId, sellerId]
    );

    if (checkProduct.length === 0) {
      return res.status(403).json({ code: 403, message: "无权操作此商品" });
    }

    // 设置上下架状态
    let isOffShelf = 0;
    if (status === "off_shelf") {
      isOffShelf = 1; // 下架
    } else if (status === "on_sale") {
      isOffShelf = 0; // 上架
    } else {
      return res.status(400).json({ code: 400, message: "无效的状态参数" });
    }

    // 更新商品状态
    await Product.updateProductStatus(productId, sellerId, isOffShelf);

    res.json({
      code: 200,
      message: isOffShelf ? "商品已下架" : "商品已上架",
      data: { productId, status: isOffShelf ? "off_shelf" : "on_sale" },
    });
  } catch (error) {
    console.error("更新商品状态失败:", error);
    res.status(500).json({ code: 500, message: "服务器错误，更新状态失败" });
  }
};

// 修改 getProductById 方法，返回商品下架状态
const getProductById = (req, res) => {
  const { product_id } = req.params;

  // 查询商品表，获取seller_id和下架状态
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

      // 为商品添加 seller_name 和 avatar
      product.seller_name = seller.username;
      product.seller_avatar = seller.avatar || "../../../static/img/avatar.jpg";

      // 获取商品的所有图片
      const imageQuery =
        "SELECT image_url, is_default FROM product_images WHERE product_id = ?";
      db.query(imageQuery, [product_id], (err, imageResult) => {
        if (err) {
          return res.status(500).json({ message: "服务器错误" });
        }

        product.images = imageResult.map((img) => img.image_url);

        // 找出默认图片用于前端显示封面
        product.default_images = imageResult
          .filter((img) => img.is_default === 1)
          .map((img) => img.image_url);

        // 为兼容现有前端代码，增加一个 image 属性，指向默认图片的第一张
        if (product.default_images && product.default_images.length > 0) {
          product.image = product.default_images[0];
        } else if (product.images && product.images.length > 0) {
          product.image = product.images[0];
        } else {
          product.image =
            product.product_type === "buy"
              ? "https://s21.ax1x.com/2025/03/19/pEwJHfJ.png"
              : "https://s21.ax1x.com/2025/03/19/pEwJ6YQ.png";
        }

        // 返回完整的商品信息，包括下架状态
        res.json(product);
      });
    });
  });
};

// 获取指定用户的点赞总数（无需 Token 验证的公共 API）
const getPublicUserLikeAmount = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ code: 400, message: "缺少用户ID" });
    }

    // 查询该用户发布的所有商品的 like_amount 总和
    const [rows] = await query(
      "SELECT COALESCE(SUM(like_amount), 0) AS total_likes FROM products WHERE seller_id = ?",
      [userId]
    );

    // 确保 rows 有值并且 total_likes 不为 undefined
    const totalLikes = rows.total_likes || 0;
    res.json({ code: 200, likeCount: totalLikes });
  } catch (error) {
    console.error("获取点赞总数失败:", error);
    res.status(500).json({ code: 500, message: "服务器错误" });
  }
};

// 获取指定用户发布的商品
const getUserProducts = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ message: "缺少用户ID" });
    }

    // 查询指定用户发布的商品
    const query = `
      SELECT p.*, 
        (SELECT pi.image_url FROM product_images pi 
         WHERE pi.product_id = p.product_id AND pi.is_default = 1 
         LIMIT 1) as image
      FROM products p 
      WHERE p.seller_id = ?
      ORDER BY p.created_at DESC
    `;

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error("查询用户商品失败:", err);
        return res.status(500).json({ message: "服务器错误" });
      }

      // 为没有默认图片的商品设置默认图片
      results.forEach((product) => {
        if (!product.image) {
          product.image =
            product.product_type === "buy"
              ? "https://s21.ax1x.com/2025/03/19/pEwJHfJ.png"
              : "https://s21.ax1x.com/2025/03/19/pEwJ6YQ.png";
        }
      });

      res.status(200).json({ products: results });
    });
  } catch (error) {
    console.error("获取用户商品失败:", error);
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
  getUserLikeAmount,
  updatePrice,
  updateProductStatus,
  getPublicUserLikeAmount,
  getUserProducts,
  deleteProduct,
};
