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
const cors = require("cors");
const WebSocket = require("ws");
const http = require("http");
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const jwtService = require("./services/jwtService");
// 注册消息路由
const messageRoutes = require("./routes/messageRoutes");
// 存储在线用户
const connectedUsers = new Map();

wss.on("connection", (ws, req) => {
  // 从URL获取token和用户ID
  const urlParams = new URL(req.url, "http://localhost:3000").searchParams;
  const token = urlParams.get("token");

  if (!token) {
    ws.close();
    return;
  }

  // 验证token
  jwtService.verifyToken(token, (err, decoded) => {
    if (err) {
      ws.close();
      return;
    }

    const userId = decoded.id;

    // 存储连接
    connectedUsers.set(userId, ws);

    console.log(`用户 ${userId} 已连接 WebSocket`);

    // 监听消息
    ws.on("message", async (message) => {
      try {
        const messageStr = message.toString(); // WebSocket 接收到的是 Buffer 或字符串，需要转换
        const data = JSON.parse(messageStr); // 使用转换后的字符串
        const { type, conversationId, to, content, image_url } = data;
        console.log("收到消息:", data); // 添加调试日志
        if (type === "message") {
          // 获取会话
          const conversation = await Conversation.findById(conversationId);
          if (!conversation) return;

          // 验证发送者权限
          if (
            conversation.buyer_id !== userId &&
            conversation.seller_id !== userId
          )
            return;

          // 创建消息
          const receiverId =
            conversation.buyer_id === userId
              ? conversation.seller_id
              : conversation.buyer_id;
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

          // 发送给接收者
          const receiverWs = connectedUsers.get(receiverId);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(
              JSON.stringify({
                type: "message",
                message: savedMessage,
              })
            );
          }

          // 通知发送者消息已保存
          ws.send(
            JSON.stringify({
              type: "message_sent",
              messageId: savedMessage.message_id,
            })
          );
        }
      } catch (error) {
        console.error("处理WebSocket消息错误:", error);
      }
    });

    // 处理连接关闭
    ws.on("close", () => {
      connectedUsers.delete(userId);
      console.log(`用户 ${userId} 断开 WebSocket 连接`);
    });
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
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
