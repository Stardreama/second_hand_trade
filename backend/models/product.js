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
  addImage: (productId, imagePath, callback) => {
    const sql = 'INSERT INTO product_images (product_id, image_url) VALUES (?, ?)';
    db.query(sql, [productId, imagePath], callback);
  },
  // 根据关键词搜索商品
  search: (keyword, callback) => {
    const query = "SELECT * FROM products WHERE description LIKE ?";
    const searchPattern = `%${keyword}%`; // 模糊匹配
    db.query(query, [searchPattern], callback);
  },
};

module.exports = Product;
