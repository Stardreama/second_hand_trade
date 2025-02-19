const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const productController = require("../controllers/productController");

router.post("/api/register", authController.register);
router.post("/api/login", authController.login);
//需要JWT验证的路由示例
router.get("/protected", authController.authenticateJWT, (req, res) => {
  res.status(200).json({ message: "你已经成功通过JWT认证！" });
});
router.post(
  "/products",
  authController.authenticateJWT,
  productController.createProduct
);

module.exports = router;
