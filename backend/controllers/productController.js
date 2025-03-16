const Product = require('../models/product'); // 引入 Product 模型

// 发布商品
const createProduct = (req, res) => {
    // const { price, description } = req.body;
    // const { price, description, product_title, product_status, product_class } = req.body;
    // 从表单数据中获取 title（即产品标题）、description、price、product_status、product_class

    console.log("Request Body:", req.body);
    console.log("Request File:", req.file);

    const { title, description, price, product_status, product_class } = req.body;
    const image = req.file ? req.file.path : null;  // 获取上传的图片路径
    const seller_id = req.seller_id;  // 从 token 中获取的 seller_id

    // // 检查是否包含必要的字段
    // if (!price || !description || !image || !seller_id) {
    //     return res.status(400).json({ message: "缺少必要的商品信息" });
    // }

    // // 检查是否包含必要的字段
    // if (!price || !description || !image || !seller_id || !product_title || !product_status || !product_class) {
    //     return res.status(400).json({ message: "缺少必要的商品信息" });
    // }

    // 校验必要字段
    if (!price || !description || !image || !seller_id || !title || !product_status || !product_class) {
        return res.status(400).json({ message: "缺少必要的商品信息" });
    }

    // // 调用 Product.create 方法创建商品
    // Product.create(price, description, image, seller_id, (err, result) => {
    //     if (err) {
    //         return res.status(500).json({ message: "数据库错误", error: err.message });
    //     }
    // 调用 Product.create 方法创建商品
    // Product.create(seller_id, price, description, image, product_title, product_status, product_class, (err, result) => {
    //     if (err) {
    //         return res.status(500).json({ message: "数据库错误", error: err.message });
    //     }
    // 调用 Product.create 方法创建商品（参数顺序与模型保持一致）
    Product.create(seller_id, price, description, image, title, product_status, product_class, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "数据库错误", error: err.message });
        }
        // 返回商品创建成功的消息
        res.status(201).json({
            message: "商品发布成功",
            product_id: result.insertId, // 返回商品ID
        });
    });
};

// 搜索商品
const searchProduct = (req, res) => {
    const { keyword } = req.query;

    if (!keyword) {
        return res.status(400).json({ message: "缺少搜索关键词" });
    }

    // 根据关键词查询商品
    Product.search(keyword, (err, results) => {
        if (err) {
            return res.status(500).json({ message: "数据库错误" });
        }

        // 返回匹配的商品列表
        const products = results.map((product) => ({
            product_id: product.id,
            price: product.price,
            description: product.description,
            image: product.image, // 假设商品图片是一个URL
        }));

        res.status(200).json(products);
    });
};

module.exports = { createProduct, searchProduct };
