const { db } = require("../config/config");

const Product = {
  // 创建商品
  create: (price, description, image, callback) => {
    const query =
      "INSERT INTO products (price, description, image) VALUES (?, ?, ?)";
    db.query(query, [price, description, image], callback);
  },
};

module.exports = Product;
