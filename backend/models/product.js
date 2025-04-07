const { db } = require("../config/config");
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};
const Product = {
  // 创建商品

  create: (
    seller_id,
    price,
    original_price,
    description,
    //image,
    product_title,
    product_status,
    product_class,
    status,
    product_type,
    is_off_shelf = 0,
    address,
    callback
  ) => {
    const query =
      "INSERT INTO products (seller_id, price, original_price, description, product_title, product_status, product_class, status, product_type, is_off_shelf,address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)";

    db.query(
      query,
      [
        seller_id,
        price,
        original_price,
        description,
        //image, // 这里可能为null
        product_title,
        product_status,
        product_class,
        status,
        product_type,
        is_off_shelf,
        address,
      ],
      callback
    );
  },
  addImage: (productId, imagePath, isDefault = 0, callback) => {
    // 确保isDefault是数值类型 0 或 1
    const isDefaultValue = isDefault ? 1 : 0;
    const sql =
      "INSERT INTO product_images (product_id, image_url, is_default) VALUES (?, ?, ?)";
    db.query(sql, [productId, imagePath, isDefaultValue], callback);
  },
  // 根据关键词搜索商品
  search: (keyword, callback) => {
    const query =
      "SELECT * FROM products WHERE description LIKE ? OR product_title LIKE ?";
    const searchPattern = `%${keyword}%`; // 模糊匹配
    db.query(query, [searchPattern, searchPattern], callback);
  },
  // 根据sellerID搜索商品
  findBySellerId: (sellerId) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM products WHERE seller_id = ?`;
      db.query(sql, [sellerId], async (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          // 遍历每个产品，查询其对应的图片URL
          const processedResults = await Promise.all(
            results.map(async (product) => {
              // 查询该产品的所有图片URL
              const images = await new Promise((resolve, reject) => {
                const imageQuery =
                  "SELECT image_url FROM product_images WHERE product_id = ?";
                db.query(
                  imageQuery,
                  [product.product_id],
                  (err, imageResults) => {
                    if (err) reject(err);
                    else resolve(imageResults.map((img) => img.image_url));
                  }
                );
              });

              // 返回包含图片数组的商品对象
              return {
                ...product,
                images: images, // 使用从product_images表获取的图片
              };
            })
          );

          resolve(processedResults);
        } catch (error) {
          reject(error);
        }
      });
    });
  },
  // 根据sellerID搜索商品
  findBySellerId: (sellerId) => {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM products WHERE seller_id = ?`;
      db.query(sql, [sellerId], async (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          // 遍历每个产品，查询其对应的图片URL
          const processedResults = await Promise.all(
            results.map(async (product) => {
              // 查询该产品的所有图片URL
              const images = await new Promise((resolve, reject) => {
                const imageQuery =
                  "SELECT image_url FROM product_images WHERE product_id = ?";
                db.query(
                  imageQuery,
                  [product.product_id],
                  (err, imageResults) => {
                    if (err) reject(err);
                    else resolve(imageResults.map((img) => img.image_url));
                  }
                );
              });

              // 返回包含图片数组的商品对象
              return {
                ...product,
                images: images, // 使用从product_images表获取的图片
              };
            })
          );

          resolve(processedResults);
        } catch (error) {
          reject(error);
        }
      });
    });
  },
  isLiked: async (userId, productId) => {
    const rows = await query(
      "SELECT 1 FROM likes WHERE user_id = ? AND product_id = ? LIMIT 1",
      [userId, productId]
    );
    return rows.length > 0; // 避免 rows 为 undefined
  },
  // 点赞（增加 like 记录，并增加商品 like_amount）
  addLike: async (userId, productId) => {
    await query("INSERT INTO likes (user_id, product_id) VALUES (?, ?)", [
      userId,
      productId,
    ]);
    await query(
      "UPDATE products SET like_amount = like_amount + 1 WHERE product_id = ?",
      [productId]
    );
  },

  // 取消点赞（删除 like 记录，并减少商品 like_amount）
  removeLike: async (userId, productId) => {
    await query("DELETE FROM likes WHERE user_id = ? AND product_id = ?", [
      userId,
      productId,
    ]);
    await query(
      "UPDATE products SET like_amount = like_amount - 1 WHERE product_id = ?",
      [productId]
    );
  },

  // 在Product对象中添加更新价格的方法
  updatePrice: async (productId, newPrice) => {
    return await query("UPDATE products SET price = ? WHERE product_id = ?", [
      newPrice,
      productId,
    ]);
  },
  // 更新商品上下架状态
  updateProductStatus: async (productId, sellerId, isOffShelf) => {
    return await query(
      "UPDATE products SET is_off_shelf = ? WHERE product_id = ? AND seller_id = ?",
      [isOffShelf, productId, sellerId]
    );
  },

  checkExistingPurchase: async (buyerId, productId) => {
    const sql = `SELECT * FROM purchases WHERE buyer_id = ? AND product_id = ?`;
    const results = await query(sql, [buyerId, productId]);
    return results.length > 0;
  },

  createPurchase: async (buyerId, productId, connection) => {
    const sql = `INSERT INTO purchases (buyer_id, product_id) VALUES (?, ?)`;
    return query(sql, [buyerId, productId], connection);
  },

  checkProductValidity: async (productId) => {
    const sql = `SELECT is_off_shelf, seller_id FROM products WHERE product_id = ?`;
    const [product] = await query(sql, [productId]);
    return product;
  },
  // 删除商品
  deleteProduct: async (productId, sellerId) => {
    // 开始事务
    const connection = await new Promise((resolve, reject) => {
      db.getConnection((err, conn) => {
        if (err) reject(err);
        else resolve(conn);
      });
    });

    try {
      await new Promise((resolve, reject) => {
        connection.beginTransaction(err => {
          if (err) reject(err);
          else resolve();
        });
      });

      // 验证商品是否属于该卖家
      const [product] = await query(
        "SELECT * FROM products WHERE product_id = ? AND seller_id = ?",
        [productId, sellerId],
        connection
      );

      if (!product) {
        throw new Error("商品不存在或您无权删除该商品");
      }

      // 1. 删除商品图片记录
      await query(
        "DELETE FROM product_images WHERE product_id = ?",
        [productId],
        connection
      );

      // 2. 删除点赞记录
      await query(
        "DELETE FROM likes WHERE product_id = ?",
        [productId],
        connection
      );

      // 3. 删除收藏记录（如果有收藏表的话）
      await query(
        "DELETE FROM favorites WHERE product_id = ?",
        [productId],
        connection
      );

      // 4. 删除商品记录
      await query(
        "DELETE FROM products WHERE product_id = ? AND seller_id = ?",
        [productId, sellerId],
        connection
      );

      // 提交事务
      await new Promise((resolve, reject) => {
        connection.commit(err => {
          if (err) reject(err);
          else resolve();
        });
      });

      return true;
    } catch (error) {
      // 回滚事务
      await new Promise(resolve => {
        connection.rollback(() => resolve());
      });
      throw error;
    } finally {
      connection.release(); // 释放连接
    }
  },
};

module.exports = Product;
