const orderService = require("../models/order");
const paymentService = require("../services/paymentService");

/**
 * 创建订单并生成支付信息
 */
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

module.exports = {
  createOrder,
};
