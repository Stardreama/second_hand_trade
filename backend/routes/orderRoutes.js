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
// 标记商品为已卖出（卖家操作）
router.post('/mark-as-sold', jwtService.authMiddleware, orderController.markProductAsSold);

// 买家标记商品为已购买
router.post('/mark-as-received', jwtService.authMiddleware, orderController.markAsReceived);

// 获取已售出商品
router.get('/sold-products', jwtService.authMiddleware, orderController.getSoldProducts);

// 获取购买记录
router.get('/purchases', jwtService.authMiddleware, orderController.getPurchases);
module.exports = router;
