const { db } = require("../config/config");

const Product = {
  // 创建商品

  create: (
    seller_id,
    price,
    description,
    image,
    product_title,
    product_status,
    product_class,
    product_type,
    callback
  ) => {
    const query =
      "INSERT INTO products (seller_id, price, description, image, product_title, product_status, product_class, product_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(
      query,
      [
        seller_id,
        price,
        description,
        image, // 这里可能为null
        product_title,
        product_status,
        product_class,
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
};

module.exports = Product;
