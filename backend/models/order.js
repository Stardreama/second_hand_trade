const mysql = require("mysql2");
const { db } = require("../config/config"); // 数据库连接配置
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};
/**
 * 根据商品ID获取商品信息
 */
const getProductById = (product_id) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM products WHERE product_id = ?",
      [product_id],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      }
    );
  });
};

/**
 * 创建订单
 */
const createOrder = (orderData) => {
  return new Promise((resolve, reject) => {
    const { product_id, buyer_id, seller_id, total_fee } = orderData;
    const created_at = new Date();

    db.query(
      "INSERT INTO orders (product_id, buyer_id, seller_id, status, created_at) VALUES (?, ?, ?, ?, ?)",
      [product_id, buyer_id, seller_id, "pending", created_at],
      (err, results) => {
        if (err) return reject(err);
        resolve({ order_id: results.insertId, total_fee });
      }
    );
  });
};
const getPurchasesByBuyer = async (buyerId) => {
  const sql = `
      SELECT p.*, pr.* 
      FROM purchases p
      JOIN products pr ON p.product_id = pr.product_id
      WHERE p.buyer_id = ?
      ORDER BY p.purchase_time DESC
    `;
  return await query(sql, [buyerId]);
};
module.exports = {
  getProductById,
  createOrder,
  getPurchasesByBuyer,
};
