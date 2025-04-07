const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const jwtService = require("../services/jwtService");
// 创建订单并获取支付信息
router.post("/create", orderController.createOrder);
router.post(
  "/purchases",
  jwtService.authMiddleware,
  orderController.createPurchase
);
router.delete(
  "/purchases/:purchaseId",
  jwtService.authMiddleware,
  orderController.deletePurchase
);
module.exports = router;
