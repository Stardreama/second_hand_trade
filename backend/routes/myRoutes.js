const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const jwtService = require("../services/jwtService");
// 我的出售商品路由
router.get("/sale", productController.getMySaleProducts);

// 给我点赞的路由
router.get(
  "/like",
  jwtService.authMiddleware,
  productController.getUserLikeAmount
);
module.exports = router;
