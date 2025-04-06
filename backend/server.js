const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const path = require("path");
const feedbackRoutes = require("./routes/feedbackRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const myRoutes = require("./routes/myRoutes");
const Conversation = require("./models/conversation");
const Message = require("./models/message");
const addressRoutes = require("./routes/addressRoutes");
const followRoutes = require("./routes/followRoutes");
const favoriteRouter = require('./routes/favoriteRouter');
const cors = require("cors");
const http = require("http");
const server = http.createServer(app);
// 替换WebSocket为Socket.io
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
const jwtService = require("./services/jwtService");
// 注册消息路由
const messageRoutes = require("./routes/messageRoutes");
// 存储在线用户
const connectedUsers = new Map();
// 引入收藏路由
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true // 允许携带凭证
  })
);
// Socket.io连接处理
io.use((socket, next) => {
  // 获取token
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error("未提供认证令牌"));
  }

  // 验证token
  try {
    const decoded = jwtService.verifyToken(token);
    if (!decoded) {
      return next(new Error("无效的认证令牌"));
    }
    socket.userId = decoded.student_id || decoded.id;
    next();
  } catch (err) {
    next(new Error("Token验证失败"));
  }
}).on("connection", (socket) => {
  const userId = socket.userId;

  // 存储连接
  connectedUsers.set(userId, socket);
  console.log(`用户 ${userId} 已连接 Socket.io`);

  // 加入个人房间
  socket.join(`user_${userId}`);

  // 在现有的Socket.io连接处理中添加新的事件监听
  socket.on("join_conversation", (data) => {
    const { conversationId } = data;

    if (conversationId) {
      // 加入特定会话的房间
      const roomName = `conversation_${conversationId}`;
      socket.join(roomName);
      console.log(`用户 ${userId} 加入会话房间: ${roomName}`);
    }
  });

  // 修改send_message事件处理
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, content, image_url, tempId } = data;
      console.log("收到消息:", data);

      // 获取会话
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        socket.emit("error", { message: "会话不存在" });
        return;
      }

      // 验证发送者权限
      if (
        conversation.buyer_id !== userId &&
        conversation.seller_id !== userId
      ) {
        socket.emit("error", { message: "无权访问此会话" });
        return;
      }

      // 确定接收者
      const receiverId =
        conversation.buyer_id === userId
          ? conversation.seller_id
          : conversation.buyer_id;

      // 创建消息
      const savedMessage = await Message.create(
        conversationId,
        userId,
        receiverId,
        content,
        image_url
      );

      // 更新会话
      await Conversation.updateLatestMessage(
        conversationId,
        savedMessage.message_id,
        content || "[图片]",
        userId
      );

      // 两种方式发送消息，提高可靠性
      // 1. 通过用户房间 - 总是发送，确保无论在哪个页面都能收到
      io.to(`user_${receiverId}`).emit("receive_message", {
        type: "message",
        message: savedMessage,
      });

      // 2. 通过会话房间 - 针对聊天页面
      const roomName = `conversation_${conversationId}`;
      io.to(roomName).emit("receive_message", {
        type: "message",
        message: savedMessage,
      });

      // 添加：通知接收者有新消息，可用于消息列表页面更新
      io.to(`user_${receiverId}`).emit("new_message_notification", {
        conversationId,
        senderId: userId,
        message: savedMessage
      });

      // 通知发送者消息已发送成功，包含临时ID以便更新UI
      socket.emit("message_sent", {
        messageId: savedMessage.message_id,
        tempId: tempId,
      });

      // // 检查接收者是否在同一会话，如果是则立即标记为已读
      // checkAndMarkMessageAsRead(
      //   receiverId,
      //   conversationId,
      //   savedMessage.message_id
      // );

      console.log(`消息已发送到房间 ${roomName} 和用户 ${receiverId}`);
    } catch (error) {
      console.error("处理消息错误:", error);
      socket.emit("error", { message: "消息处理失败" });
    }
  });

  // 新增函数：检查并标记消息为已读
  function checkAndMarkMessageAsRead(receiverId, conversationId, messageId) {
    const receiverSocket = connectedUsers.get(receiverId);
    if (receiverSocket && receiverSocket.connected) {
      // 检查接收者是否在同一会话
      const rooms = receiverSocket.rooms;
      if (rooms.has(`conversation_${conversationId}`)) {
        // 接收者在同一会话中，立即标记为已读
        Message.markAsRead(messageId)
          .then(() => {
            // 通知发送者消息已读
            io.to(`user_${messageId.sender_id}`).emit("messages_read", {
              conversationId,
              messageIds: [messageId],
              readBy: receiverId,
            });
          })
          .catch((err) => console.error("标记消息已读失败:", err));
      }
    }
  }

  // 在Socket.io连接处理部分添加
  socket.on("mark_messages_read", async (data) => {
    try {
      const { conversationId } = data;
      const userId = socket.userId;

      // 获取会话
      const conversation = await Conversation.findById(conversationId);
      if (
        !conversation ||
        (conversation.buyer_id !== userId && conversation.seller_id !== userId)
      ) {
        return;
      }

      // 确定发送者（即要通知消息已读状态的用户）
      const senderId =
        conversation.buyer_id === userId
          ? conversation.seller_id
          : conversation.buyer_id;

      // 标记来自发送者的消息为已读
      const messagesMarked = await Message.markConversationMessagesAsRead(
        conversationId,
        senderId,
        userId
      );

      // 重置会话未读计数
      if (userId === conversation.buyer_id) {
        await Conversation.resetUnreadCount(conversationId, "buyer");
      } else {
        await Conversation.resetUnreadCount(conversationId, "seller");
      }
      console.log(`用户 ${userId} 标记消息为已读`, messagesMarked);

      // 通知发送者其消息已被阅读
      if (messagesMarked.length > 0) {
        const senderSocket = connectedUsers.get(senderId);
        if (senderSocket && senderSocket.connected) {
          senderSocket.emit("messages_read", {
            conversationId,
            messageIds: messagesMarked.map((msg) => msg.message_id),
            readBy: userId,
          });
        }
      }
    } catch (error) {
      console.error("标记消息已读失败:", error);
    }
  });

  // 添加新的事件监听
  socket.on("viewing_conversation", async (data) => {
    try {
      const { conversationId } = data;

      // 记录此用户正在查看的会话
      socket.currentConversation = conversationId;

      // 查找该会话的所有未读消息并标记为已读
      await socket.emit("mark_messages_read", { conversationId });

      // 通知该会话中的其他用户，此用户正在查看会话
      const conversation = await Conversation.findById(conversationId);
      if (conversation) {
        const otherUserId =
          conversation.buyer_id === userId
            ? conversation.seller_id
            : conversation.buyer_id;

        const otherUserSocket = connectedUsers.get(otherUserId);
        if (otherUserSocket && otherUserSocket.connected) {
          // 让对方知道用户正在查看会话，可能需要标记消息为已读
          otherUserSocket.emit("user_viewing", {
            conversationId,
            userId,
          });
        }
      }
    } catch (error) {
      console.error("处理查看会话事件失败:", error);
    }
  });

  // 修改mark_messages_read事件处理，使其更高效
  socket.on("mark_messages_read", async (data) => {
    try {
      const { conversationId } = data;
      const userId = socket.userId;

      // 获取会话
      const conversation = await Conversation.findById(conversationId);
      if (
        !conversation ||
        (conversation.buyer_id !== userId && conversation.seller_id !== userId)
      ) {
        return;
      }

      // 确定发送者（即要通知消息已读状态的用户）
      const senderId =
        conversation.buyer_id === userId
          ? conversation.seller_id
          : conversation.buyer_id;

      // 标记来自发送者的消息为已读
      const messagesMarked = await Message.markConversationMessagesAsRead(
        conversationId,
        senderId,
        userId
      );

      // 重置会话未读计数
      if (userId === conversation.buyer_id) {
        await Conversation.resetUnreadCount(conversationId, "buyer");
      } else {
        await Conversation.resetUnreadCount(conversationId, "seller");
      }

      // 通知发送者其消息已被阅读
      if (messagesMarked.length > 0) {
        const senderSocket = connectedUsers.get(senderId);
        if (senderSocket && senderSocket.connected) {
          senderSocket.emit("messages_read", {
            conversationId,
            messageIds: messagesMarked.map((msg) => msg.message_id),
            readBy: userId,
          });

          console.log(`用户 ${userId} 已读消息，通知发送者 ${senderId}`);
        }
      }
    } catch (error) {
      console.error("标记消息已读失败:", error);
    }
  });

  // 处理断开连接
  socket.on("disconnect", () => {
    connectedUsers.delete(userId);
    console.log(`用户 ${userId} 断开连接`);
  });
});

// 配置 CORS 中间件
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 增加请求体大小限制
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// 配置静态文件服务（访问上传的图片）
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ...现有代码

// 首先确保所有路由都在这里注册 (BEFORE server.listen)
app.use("/api", authRoutes);
app.use('/api/products/favorite', favoriteRouter); // 把更具体的路径先注册
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/my", myRoutes);
app.use("/api", feedbackRoutes);
app.use("/api", messageRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/user", followRoutes);

// 然后才启动服务器
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// 删除这行，它放在server.listen之后不会生效
// app.use("/api/user", followRoutes); 