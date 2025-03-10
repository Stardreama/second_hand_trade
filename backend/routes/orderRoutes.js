const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

// 创建订单并获取支付信息
router.post("/create", orderController.createOrder);

module.exports = router;
