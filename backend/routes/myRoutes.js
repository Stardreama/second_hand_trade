const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const jwtService = require("../services/jwtService");
const userController = require("../controllers/userController");
// 我的出售商品路由
router.get("/sale", productController.getMySaleProducts);

// 给我点赞的路由
router.get(
  "/like",
  jwtService.authMiddleware,
  productController.getUserLikeAmount
);
// 获取用户的 QRCode
router.get("/my_pay", jwtService.authMiddleware, userController.getQRCode);

// 更新用户的 QRCode
router.post("/my_pay", jwtService.authMiddleware, userController.updateQRCode);
module.exports = router;
