const { db } = require("../config/config");

const Message = {
  create: (conversationId, senderId, receiverId, content, imageUrl = null) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO messages (conversation_id, sender_id, receiver_id, content, image_url)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(
        query,
        [conversationId, senderId, receiverId, content, imageUrl],
        (err, result) => {
          if (err) return reject(err);

          // 获取新创建的消息并返回完整数据
          const findQuery = `
          SELECT * FROM messages WHERE message_id = ?
        `;

          db.query(findQuery, [result.insertId], (err, messages) => {
            if (err) return reject(err);
            resolve(messages[0]);
          });
        }
      );
    });
  },

  findById: (messageId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM messages
        WHERE message_id = ?
      `;

      db.query(query, [messageId], (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      });
    });
  },

  getByConversationId: (conversationId) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM messages
        WHERE conversation_id = ?
        ORDER BY created_at ASC
      `;

      db.query(query, [conversationId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  markAsRead: (messageId) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE messages
        SET is_read = TRUE
        WHERE message_id = ?
      `;

      db.query(query, [messageId], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  markConversationMessagesAsRead: (conversationId, senderId, readerId) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE messages 
        SET is_read = TRUE 
        WHERE conversation_id = ? AND sender_id = ? AND receiver_id = ? AND is_read = FALSE
      `;

      db.query(query, [conversationId, senderId, readerId], (err, result) => {
        if (err) return reject(err);

        // 获取刚刚标记为已读的消息
        if (result.affectedRows > 0) {
          const selectQuery = `
            SELECT * FROM messages 
            WHERE conversation_id = ? AND sender_id = ? AND receiver_id = ? AND is_read = TRUE
          `;

          db.query(
            selectQuery,
            [conversationId, senderId, readerId],
            (err, messages) => {
              if (err) return reject(err);
              resolve(messages);
            }
          );
        } else {
          resolve([]);
        }
      });
    });
  },
};

module.exports = Message;
