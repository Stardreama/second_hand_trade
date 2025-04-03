const express = require("express");
const router = express.Router();
const addressController = require("../controllers/addressController");
const authController = require("../controllers/authController");

// 所有地址路由都需要JWT认证
router.use(authController.authenticateJWT);

// 获取当前用户的所有地址
router.get("/", addressController.getAllAddresses);

// 获取特定地址详情
router.get("/:id", addressController.getAddressById);

// 创建新地址
router.post("/", addressController.createAddress);

// 更新地址
router.put("/:id", addressController.updateAddress);

// 删除地址
router.delete("/:id", addressController.deleteAddress);

// 设置默认地址
router.put("/:id/default", addressController.setDefaultAddress);

module.exports = router;
