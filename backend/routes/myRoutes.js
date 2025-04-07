const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const jwtService = require("../services/jwtService");
const userController = require("../controllers/userController");
const orderController = require("../controllers/orderController");
const multer = require("multer");
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
// 我的出售商品路由
router.get("/sale", productController.getMySaleProducts);

// 给我点赞的路由
router.get(
  "/like",
  jwtService.authMiddleware,
  productController.getUserLikeAmount
);

// 新增：无需 Token 验证的公共 API，通过用户ID获取点赞总数
router.get("/public/like/:userId", productController.getPublicUserLikeAmount);

router.get("/my_pay", jwtService.authMiddleware, userController.getQRCode);
router.get("/my_pay-noToken", userController.getQRCodeNoToken);

router.post(
  "/my_pay/update",
  jwtService.authMiddleware,
  upload.single("file"),
  userController.updateQRCode
);
router.get(
  "/purchases",
  jwtService.authMiddleware,
  orderController.getMyPurchases
);
router.get(
  "/purchase-count",
  jwtService.authMiddleware,
  userController.getPurchaseCount
);
module.exports = router;
