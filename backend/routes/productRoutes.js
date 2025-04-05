const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const productController = require("../controllers/productController");
const jwtService = require("../services/jwtService");
// 确保上传目录存在
const uploadDir = "uploads/productImages/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 存储策略
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // 设置上传路径
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop(); // 获取文件后缀
    cb(null, `product_${Date.now()}.${ext}`); // 设置文件名
  },
});

// 限制上传文件类型
const fileFilter = (req, file, cb) => {
  if (["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("仅支持jpeg和png格式的图片"), false);
  }
};

// 配置 multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制文件大小为5MB
});

// 解析token并获取seller_id
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // 获取请求头中的token

  if (!token) {
    return res.status(403).json({ message: "未授权访问" });
  }

  try {
    const decoded = jwt.verify(token, "secret_key"); // 解码token
    req.seller_id = decoded.student_id; // 从token中获取seller_id
    next();
  } catch (err) {
    return res.status(401).json({ message: "无效的token" });
  }
};

// 创建商品
router.post(
  "/create",
  authenticateToken,
  (req, res, next) => {
    // 检查请求体是否包含image属性，决定是否需要上传文件
    if (
      req.headers["content-type"] &&
      req.headers["content-type"].includes("multipart/form-data")
    ) {
      // 有文件上传，应用multer中间件
      upload.array("image", 5)(req, res, (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
        next();
      });
    } else {
      // 无文件上传，直接进入下一个中间件
      next();
    }
  },
  productController.createProduct
);

// 注册新增图片的路由（单张图片上传）
router.post(
  "/addImage",
  authenticateToken,
  upload.single("image"),
  (req, res, next) => {
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }
    next();
  },
  productController.addImage
);
// // 不需要图片的求购路由
// router.post(
//   "/create-no-image",
//   authenticateToken,
//   productController.createProductNoImage
// );
// 搜索商品
// 更新商品
router.post(
  "/update",
  authenticateToken,
  (req, res, next) => {
    // 检查请求体是否包含image属性
    if (
      req.headers["content-type"] &&
      req.headers["content-type"].includes("multipart/form-data")
    ) {
      upload.array("image", 5)(req, res, (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
        next();
      });
    } else {
      next();
    }
  },
  productController.updateProduct
);
router.get("/search", productController.searchProduct);
// 获取单个商品详细信息
router.get("/:product_id", productController.getProductById);
router.post("/like", jwtService.authMiddleware, productController.toggleLike); // 点赞或取消点赞
// 更新商品价格
router.post(
  "/updatePrice",
  jwtService.authMiddleware,
  productController.updatePrice
);
router.get(
  "/like/:productId",
  jwtService.authMiddleware,
  productController.getProductLike
);
router.post(
  "/status",
  jwtService.authMiddleware,
  productController.updateProductStatus
);
//渲染数据库中的所有商品
router.get("/", productController.getAllProducts);
// 获取指定用户发布的商品
router.get("/user/:userId", productController.getUserProducts);
module.exports = router;
