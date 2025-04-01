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
    image,
    product_title,
    product_status,
    product_class,
    status,
    product_type,
    callback
  ) => {
    const query =
      "INSERT INTO products (seller_id, price, original_price,description, image, product_title, product_status, product_class, status, product_type) VALUES (?, ?,?,?, ?, ?, ?, ?, ?, ?)";

    db.query(
      query,
      [
        seller_id,
        price,
        original_price,
        description,
        image, // 这里可能为null
        product_title,
        product_status,
        product_class,
        status,
        product_type,
      ],
      callback
    );
  },
  addImage: (productId, imagePath, callback) => {
    const sql =
      "INSERT INTO product_images (product_id, image_url) VALUES (?, ?)";
    db.query(sql, [productId, imagePath], callback);
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

              // 替换image字段为数组
              return {
                ...product,
                image: images,
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
    return await query(
      "UPDATE products SET price = ? WHERE product_id = ?",
      [newPrice, productId]
    );
  },
};

module.exports = Product;
