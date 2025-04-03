/*
 * @Author: ourEDA MaMing
 * @Date: 2025-04-01 18:55:33
 * @LastEditors: ourEDA MaMing
 * @LastEditTime: 2025-04-01 20:49:20
 * @FilePath: \second_hand_trade\backend\routes\myRoutes.js
 * @Description: 李猴啊
 *
 * Copyright (c) 2025 by FanZDStar , All Rights Reserved.
 */
const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const jwtService = require("../services/jwtService");
const userController = require("../controllers/userController");
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
router.get("/my_pay", jwtService.authMiddleware, userController.getQRCode);
router.get("/my_pay-noToken", userController.getQRCodeNoToken);

router.post(
  "/my_pay/update",
  jwtService.authMiddleware,
  upload.single("file"),
  userController.updateQRCode
);
module.exports = router;
