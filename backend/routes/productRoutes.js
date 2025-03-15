const express = require("express");
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const productController = require("../controllers/productController");

// 确保上传目录存在
const uploadDir = 'uploads/productImages/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 存储策略
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').pop();
        cb(null, `product_${Date.now()}.${ext}`);
    }
});

// 限制上传文件类型
const fileFilter = (req, file, cb) => {
    if (['image/jpeg', 'image/png'].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('仅支持jpeg和png格式的图片'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 限制文件大小为5MB
});

// 创建商品
router.post("/create", upload.single('image'), (err, req, res, next) => {
    if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
}, productController.createProduct);

// 搜索商品
router.get("/search", productController.searchProduct);

module.exports = router;