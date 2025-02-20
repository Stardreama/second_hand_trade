const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
router.post(
  "/products",
  authController.authenticateJWT,
  productController.createProduct
);
router.get("/products/search", productController.searchProduct);
module.exports = router;
