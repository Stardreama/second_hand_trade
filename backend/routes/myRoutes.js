const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const jwtService = require("../services/jwtService");
const userController = require("../controllers/userController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
// 我的出售商品路由
router.get("/sale", productController.getMySaleProducts);

// 给我点赞的路由
router.get(
  "/like",
  jwtService.authMiddleware,
  productController.getUserLikeAmount
);
router.get("/my_pay", jwtService.authMiddleware, userController.getQRCode);
router.post(
  "/my_pay/update",
  jwtService.authMiddleware,
  upload.single("file"),
  userController.updateQRCode
);
module.exports = router;
