const { db } = require("../config/config");

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
      db.query(sql, [sellerId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  },
};

module.exports = Product;
