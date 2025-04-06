const config = require("../config/config");
const db = config.db;

const Favorite = {
    create: (userId, productId, callback) => {
        const query = "INSERT INTO favorites (user_id, product_id) VALUES (?, ?)";
        db.query(query, [userId, productId], callback);
    },

    delete: (userId, productId, callback) => {
        const query = "DELETE FROM favorites WHERE user_id = ? AND product_id = ?";
        db.query(query, [userId, productId], callback);
    },

    findOne: (userId, productId, callback) => {
        const query = "SELECT * FROM favorites WHERE user_id = ? AND product_id = ?";
        db.query(query, [userId, productId], callback);
    },

    findAllByUser: (userId, callback) => {
        const query = `
      SELECT p.*, u.username as seller_name, u.avatar as seller_avatar, 
             (SELECT JSON_ARRAYAGG(pi.image_url) FROM product_images pi WHERE pi.product_id = p.product_id) as images
      FROM favorites f
      JOIN products p ON f.product_id = p.product_id
      JOIN users u ON p.seller_id = u.student_id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `;
        db.query(query, [userId], callback);
    }
};

module.exports = Favorite;