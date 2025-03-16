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

// 其他路由
router.post(
  "/products",
  authController.authenticateJWT,
  productController.createProduct
);
router.get("/products/search", productController.searchProduct);

module.exports = router;
