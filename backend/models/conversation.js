const { db } = require('../config/config');

const Conversation = {
  create: (buyerId, sellerId, productId = null) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO conversations (buyer_id, seller_id, product_id)
        VALUES (?, ?, ?)
      `;
      
      db.query(query, [buyerId, sellerId, productId], (err, result) => {
        if (err) return reject(err);
        
        // 返回新创建的会话
        Conversation.findById(result.insertId)
          .then(resolve)
          .catch(reject);
      });
    });
  },
  
  findById: (conversationId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM conversations
        WHERE conversation_id = ?
      `;
      
      db.query(query, [conversationId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  },
  
  findByParticipants: (buyerId, sellerId, productId = null) => {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT * FROM conversations
        WHERE (buyer_id = ? AND seller_id = ?)
      `;
      
      const params = [buyerId, sellerId];
      
      if (productId) {
        query += ` AND product_id = ?`;
        params.push(productId);
      }
      
      db.query(query, params, (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  },
  
  getUserConversations: (userId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT c.*, p.product_title, p.image as product_image
        FROM conversations c
        LEFT JOIN products p ON c.product_id = p.product_id
        WHERE c.buyer_id = ? OR c.seller_id = ?
        ORDER BY c.latest_message_time DESC
      `;
      
      db.query(query, [userId, userId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },
  
  updateLatestMessage: (conversationId, messageId, content, senderId) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE conversations
        SET latest_message = ?,
            latest_message_time = CURRENT_TIMESTAMP,
            unread_buyer = unread_buyer + CASE WHEN buyer_id != ? THEN 1 ELSE 0 END,
            unread_seller = unread_seller + CASE WHEN seller_id != ? THEN 1 ELSE 0 END
        WHERE conversation_id = ?
      `;
      
      db.query(query, [content, senderId, senderId, conversationId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },
  
  resetUnreadCount: (conversationId, userType) => {
    return new Promise((resolve, reject) => {
      const field = userType === 'buyer' ? 'unread_buyer' : 'unread_seller';
      
      const query = `
        UPDATE conversations
        SET ${field} = 0
        WHERE conversation_id = ?
      `;
      
      db.query(query, [conversationId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
};

module.exports = Conversation;