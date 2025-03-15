const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const multer = require('multer');

// 配置 multer 存储策略
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/productImages/'); // 图片保存目录
    },
    filename: function (req, file, cb) {
        // 生成文件名：使用当前时间戳，确保文件名唯一
        const ext = file.originalname.split('.').pop();
        cb(null, `product_${Date.now()}.${ext}`);
    }
});

// 限制上传文件类型
const fileFilter = (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('仅支持jpg, jpeg, png格式的图片'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter
});

router.post("/create", upload.single('image'), productController.createProduct);
router.get("/search", productController.searchProduct);
module.exports = router;
