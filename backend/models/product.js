/*
 * @Author: ourEDA MaMing
 * @Date: 2025-03-09 23:53:02
 * @LastEditors: ourEDA MaMing
 * @LastEditTime: 2025-03-15 20:49:22
 * @FilePath: \backend\models\product.js
 * @Description: 李猴啊
 * 
 * Copyright (c) 2025 by FanZDStar , All Rights Reserved. 
 */
const { db } = require("../config/config");

const Product = {
  // 创建商品
  create: (price, description, image, seller_id, callback) => {
    const query =
      "INSERT INTO products (price, description, image, seller_id) VALUES (?, ?, ?, ?)";
    db.query(query, [price, description, image, seller_id], callback);
  },
  // 根据关键词搜索商品
  search: (keyword, callback) => {
    const query = "SELECT * FROM products WHERE description LIKE ?";
    const searchPattern = `%${keyword}%`; // 模糊匹配
    db.query(query, [searchPattern], callback);
  },
};

module.exports = Product;
