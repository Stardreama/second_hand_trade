const orderService = require("../models/order");
const paymentService = require("../services/paymentService");
const purchaseModel = require("../models/product");
const { db } = require("../config/config"); // 数据库连接配置
/**
 * 创建订单并生成支付信息
 */
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};
const createOrder = async (req, res) => {
  try {
    const { product_id, buyer_id } = req.body;

    // 从数据库获取商品信息
    const product = await orderService.getProductById(product_id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // 创建订单
    const order = await orderService.createOrder({
      product_id,
      buyer_id,
      seller_id: product.seller_id,
      total_fee: product.price,
    });

    // 生成微信支付订单
    const paymentParams = await paymentService.createOrder({
      order_id: order.order_id,
      total_fee: product.price,
      openid: req.user.openid, // 假设前端已经通过JWT传递openid
    });

    // 返回订单和支付参数
    res
      .status(201)
      .json({ order_id: order.order_id, payment_params: paymentParams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
createPurchase = async (req, res) => {
  try {
    const { product_id } = req.body;
    const buyer_id = req.user.student_id;
    // 检查商品状态
    const product = await purchaseModel.checkProductValidity(product_id);
    if (!product) {
      return res.status(404).json({ code: 404, message: "商品不存在" });
    }
    if (product.is_off_shelf === 1) {
      return res.status(400).json({ code: 400, message: "商品已下架" });
    }
    if (product.seller_id === buyer_id) {
      return res.status(400).json({ code: 400, message: "不能购买自己的商品" });
    }

    // 检查重复购买
    const exists = await purchaseModel.checkExistingPurchase(
      buyer_id,
      product_id
    );
    if (exists) {
      return res.status(409).json({ code: 409, message: "请勿重复提交" });
    }

    // 创建购买记录
    await purchaseModel.createPurchase(buyer_id, product_id);
    res.status(201).json({ code: 201, message: "购买成功" });
  } catch (error) {
    console.error("购买错误:", error);
    res.status(500).json({ code: 500, message: "服务器内部错误" });
  }
};
getMyPurchases = async (req, res) => {
  try {
    const buyerId = req.user.student_id;

    const sql = `
      SELECT 
        p.purchase_id,
        p.purchase_time,
        pr.product_id,
        pr.product_title,
        pr.price,
        pr.seller_id,
        (
          SELECT JSON_ARRAYAGG(pi.image_url)
          FROM product_images pi
          WHERE pi.product_id = pr.product_id
        ) AS images
      FROM purchases p
      INNER JOIN products pr ON p.product_id = pr.product_id
      WHERE p.buyer_id = ?
      ORDER BY p.purchase_time DESC
    `;

    const results = await query(sql, [buyerId]);

    // 处理图片数据：直接使用结果中的数组，null转为空数组
    const processedData = results.map((item) => ({
      ...item,
      images: item.images || [], // 移除JSON.parse，直接使用数组或设为空数组
    }));
    console.log("购买记录:", processedData);
    res.status(200).json({
      code: 200,
      data: processedData,
    });
  } catch (error) {
    console.error("获取购买记录失败:", error);
    res.status(500).json({ code: 500, message: "服务器内部错误" });
  }
};
module.exports = {
  createOrder,
  createPurchase,
  getMyPurchases,
};
