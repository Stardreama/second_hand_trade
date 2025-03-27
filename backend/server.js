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

  // 修改消息发送部分
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, content, image_url } = data;
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
      // 1. 通过用户房间
      io.to(`user_${receiverId}`).emit("receive_message", {
        type: "message",
        message: savedMessage,
      });

      // 2. 通过会话房间
      const roomName = `conversation_${conversationId}`;
      io.to(roomName).emit("receive_message", {
        type: "message",
        message: savedMessage,
      });

      // 通知发送者
      socket.emit("message_sent", {
        messageId: savedMessage.message_id,
      });

      console.log(`消息已发送到房间 ${roomName} 和用户 ${receiverId}`);
    } catch (error) {
      console.error("处理消息错误:", error);
      socket.emit("error", { message: "消息处理失败" });
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

// 路由加载
app.use("/api", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/my", myRoutes);
app.use("/api", feedbackRoutes);
app.use("/api", messageRoutes);
app.use("/api/address", addressRoutes);
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
