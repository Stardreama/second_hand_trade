const { db } = require("../config/config");

const Product = {
  // 创建商品
  // create: (price, description, image, seller_id, callback) => {
  //   const query =
  //     "INSERT INTO products (price, description, image, seller_id) VALUES (?, ?, ?, ?)";
  //   db.query(query, [price, description, image, seller_id], callback);
  // },

  create: (
    seller_id,
    price,
    description,
    image,
    product_title,
    product_status,
    product_class,
    callback
  ) => {
    const query =
      "INSERT INTO products (seller_id, price, description, image, product_title, product_status, product_class) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(
      query,
      [
        seller_id,
        price,
        description,
        image,
        product_title,
        product_status,
        product_class,
      ],
      callback
    );
  },

  // 根据关键词搜索商品
  search: (keyword, callback) => {
    const query = "SELECT * FROM products WHERE description LIKE ?";
    const searchPattern = `%${keyword}%`; // 模糊匹配
    db.query(query, [searchPattern], callback);
  },
};

module.exports = Product;
