const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const productController = require("../controllers/productController");
const multer = require("multer");
const path = require("path");

// 配置 multer 存储设置
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // 设置上传文件存储目录（需确保该目录存在）
  },
  filename: function (req, file, cb) {
    // 文件命名：时间戳-原始文件名
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// 注册路由：使用 multer 中间件处理文件上传
router.post(
  "/register",
  upload.single("student_card"),
  authController.register
);
router.post("/login", authController.login);

// JWT 认证示例
router.get("/protected", authController.authenticateJWT, (req, res) => {
  res.status(200).json({ message: "你已经成功通过JWT认证！" });
});

// 头像更新路由
router.post(
  "/user/update-avatar",
  authController.authenticateJWT,
  upload.single("avatar"),
  authController.updateAvatar
);

// 获取当前用户信息的路由
router.get(
  "/user/profile",
  authController.authenticateJWT,
  authController.getUserProfile
);
// 获取指定用户信息路由
router.get(
  "/user/:userId/info",
  authController.authenticateJWT,
  authController.getUserInfo
);
// 更新用户昵称
router.post(
  "/user/update-nickname",
  authController.authenticateJWT,  // 确保用户通过JWT认证
  authController.updateNickname    // 调用更新昵称的方法
);
// 其他路由
router.post(
  "/products",
  authController.authenticateJWT,
  productController.createProduct
);
router.get("/products/search", productController.searchProduct);

module.exports = router;
