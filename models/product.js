const { db } = require("../config/config");

const Product = {
  // 创建商品
  create: (price, description, image, callback) => {
    const query =
      "INSERT INTO products (price, description, image) VALUES (?, ?, ?)";
    db.query(query, [price, description, image], callback);
  },
  // 根据关键词搜索商品
  search: (keyword, callback) => {
    const query = "SELECT * FROM products WHERE description LIKE ?";
    const searchPattern = `%${keyword}%`; // 模糊匹配
    connection.query(query, [searchPattern], callback);
  },
};

module.exports = Product;
