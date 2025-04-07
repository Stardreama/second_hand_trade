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
deletePurchase = async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const buyerId = req.user.student_id; // 从JWT中获取当前用户ID
    console.log("删除购买记录:", purchaseId);
    console.log("当前用户ID:", buyerId);
    // 1. 验证购买记录是否存在且属于当前用户
    const purchase = await query(
      "SELECT * FROM purchases WHERE purchase_id = ? AND buyer_id = ?",
      [purchaseId, buyerId]
    );

    if (purchase.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "购买记录不存在或无权操作",
      });
    }

    // 2. 执行删除
    await query("DELETE FROM purchases WHERE purchase_id = ?", [purchaseId]);

    res.json({
      code: 200,
      message: "删除成功",
    });
  } catch (err) {
    console.error("删除失败:", err);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
    });
  }
};
// 标记商品为已卖出（卖家操作）
const markProductAsSold = async (req, res) => {
  try {
    const { productId } = req.body;
    const sellerId = req.user.student_id;

    // 验证商品所有权
    const checkProduct = await query(
      "SELECT * FROM products WHERE product_id = ? AND seller_id = ?",
      [productId, sellerId]
    );

    if (checkProduct.length === 0) {
      return res.status(403).json({ code: 403, message: "无权操作此商品" });
    }

    // 检查是否已经存在订单记录
    const existingOrder = await query(
      "SELECT * FROM orders WHERE product_id = ?",
      [productId]
    );

    if (existingOrder.length > 0) {
      // 订单已存在，检查买家ID是否存在
      if (existingOrder[0].buyer_id) {
        // 买家ID已存在，更新商品为已下架
        await query("UPDATE products SET is_off_shelf = 1 WHERE product_id = ?", [productId]);
        return res.json({ code: 200, message: "商品已标记为售出" });
      } else {
        // 买家ID不存在，提示卖家通知买家
        return res.status(400).json({ 
          code: 400, 
          message: "请先提醒买家标记商品为已购买，否则无法联系买家" 
        });
      }
    } else {
      // 不存在订单记录，提示卖家通知买家先购买
      return res.status(400).json({ 
        code: 400, 
        message: "请先提醒买家标记商品为已购买，否则无法联系买家" 
      });
    }
  } catch (error) {
    console.error("标记商品为已卖出失败:", error);
    res.status(500).json({ code: 500, message: "服务器错误" });
  }
};

// 买家标记商品为已购买
const markAsReceived = async (req, res) => {
  try {
    const { productId } = req.body;
    const buyerId = req.user.student_id;
    console.log(req.body);
    
    // 检查是否已经存在订单
    const existingOrder = await query(
      "SELECT * FROM orders WHERE product_id = ?",
      [productId]
    );

    if (existingOrder.length > 0) {
      // 更新订单的买家ID
      await query("UPDATE orders SET buyer_id = ? WHERE product_id = ?", [
        buyerId,
        productId,
      ]);
    } else {
      // 获取卖家ID
      const product = await query(
        "SELECT seller_id FROM products WHERE product_id = ?",
        [productId]
      );

      if (product.length === 0) {
        return res.status(404).json({ code: 404, message: "商品不存在" });
      }

      // 创建新订单
      await query(
        "INSERT INTO orders (product_id, buyer_id, seller_id) VALUES (?, ?, ?)",
        [productId, buyerId, product[0].seller_id]
      );

      // // 将商品标记为下架
      // await query("UPDATE products SET is_off_shelf = 1 WHERE product_id = ?", [
      //   productId,
      // ]);
    }

    res.json({ code: 200, message: "已确认收货" });
  } catch (error) {
    console.error("确认收货失败:", error);
    res.status(500).json({ code: 500, message: "服务器错误" });
  }
};

// 获取已售出商品
const getSoldProducts = async (req, res) => {
  try {
    const sellerId = req.user.student_id;

    const soldProducts = await query(
      `
      SELECT o.*, p.product_title, p.price, p.description, 
             u.username as buyer_name,
             (SELECT pi.image_url FROM product_images pi 
              WHERE pi.product_id = p.product_id AND pi.is_default = 1 
              LIMIT 1) as image
      FROM orders o
      JOIN products p ON o.product_id = p.product_id
      LEFT JOIN users u ON o.buyer_id = u.student_id
      WHERE o.seller_id = ?
      ORDER BY o.created_at DESC
    `,
      [sellerId]
    );

    res.json({ code: 200, data: soldProducts });
  } catch (error) {
    console.error("获取售出商品失败:", error);
    res.status(500).json({ code: 500, message: "服务器错误" });
  }
};

// 获取购买记录
const getPurchases = async (req, res) => {
  try {
    const buyerId = req.user.student_id;

    const purchases = await query(
      `
      SELECT o.*, p.product_title, p.price, p.description, 
             u.username as seller_name,
             (SELECT pi.image_url FROM product_images pi 
              WHERE pi.product_id = p.product_id AND pi.is_default = 1 
              LIMIT 1) as image
      FROM orders o
      JOIN products p ON o.product_id = p.product_id
      JOIN users u ON p.seller_id = u.student_id
      WHERE o.buyer_id = ?
      ORDER BY o.created_at DESC
    `,
      [buyerId]
    );

    res.json({ code: 200, data: purchases });
  } catch (error) {
    console.error("获取购买记录失败:", error);
    res.status(500).json({ code: 500, message: "服务器错误" });
  }
};
module.exports = {
  createOrder,
  markProductAsSold,
  markAsReceived,
  getSoldProducts,
  getPurchases,
  createPurchase,
  getMyPurchases,
  deletePurchase,
};
