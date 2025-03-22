const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const messageController = require("../controllers/messageController");
const authController = require("../controllers/authController");

// 配置聊天图片上传
const chatImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/chatImages/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const chatImageUpload = multer({
  storage: chatImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB限制
});

// 获取会话列表
router.get(
  "/conversations",
  authController.authenticateJWT,
  messageController.getUserConversations
);

// 创建会话
router.post(
  "/conversations/create",
  authController.authenticateJWT,
  messageController.createConversation
);

// 获取会话消息
router.get(
  "/conversations/:conversationId/messages",
  authController.authenticateJWT,
  messageController.getConversationMessages
);

// 发送消息
router.post(
  "/conversations/:conversationId/messages",
  authController.authenticateJWT,
  messageController.sendMessage
);

// 上传聊天图片
router.post(
  "/upload/chat",
  authController.authenticateJWT,
  chatImageUpload.single("image"),
  messageController.uploadChatImage
);

module.exports = router;
