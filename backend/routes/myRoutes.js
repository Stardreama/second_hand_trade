const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// 我的出售商品路由
router.get("/sale", productController.getMySaleProducts);

module.exports = router;
