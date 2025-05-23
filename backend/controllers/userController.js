//用户、我的页面管理器
// controllers/myController.js
const User = require("../models/user");
const { db } = require("../config/config");
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};
getQRCode = async (req, res) => {
  const student_id = req.user.student_id;
  const qrCode = await User.getUserQRCode(student_id);
  res.json({ success: true, qrCode });
};
updateQRCode = async (req, res) => {
  const student_id = req.user.student_id;
  const qrCode = `/uploads/${req.file.filename}`;
  await User.updateUserQRCode(student_id, qrCode);
  res.json({ success: true, qrCode });
};

// 不使用 token，通过传递 seller_id 获取二维码
getQRCodeNoToken = async (req, res) => {
  const { seller_id } = req.query; // 获取前端传递的 seller_id

  if (!seller_id) {
    return res
      .status(400)
      .json({ success: false, message: "seller_id 参数缺失" });
  }

  try {
    const qrCode = await User.getUserQRCode(seller_id); // 使用 seller_id 作为 student_id 查询二维码
    if (!qrCode) {
      return res.status(404).json({ success: false, message: "未找到付款码" });
    }
    res.json({ success: true, qrCode });
  } catch (error) {
    console.error("获取二维码失败:", error);
    res.status(500).json({ success: false, message: "服务器错误" });
  }
};
getPurchaseCount = async (req, res) => {
  try {
    const buyerId = req.user.student_id; // 获取当前登录用户的 student_id;
    // 使用参数化查询防止SQL注入
    const result = await query(
      "SELECT COUNT(*) AS count FROM orders WHERE buyer_id = ?",
      [buyerId]
    );

    res.json({
      code: 200,
      data: {
        count: result[0].count,
      },
    });
  } catch (err) {
    console.error("统计购买量失败:", err);
    res.status(500).json({
      code: 500,
      message: "服务器内部错误",
    });
  }
};
// 获取用户发布的商品数量
getPostCount = async (req, res) => {
  try {
    const sellerId = req.user.student_id;
    const result = await query(
      "SELECT COUNT(*) AS count FROM products WHERE seller_id = ? ",
      [sellerId]
    );

    res.json({
      code: 200,
      data: { count: result[0].count },
    });
  } catch (err) {
    console.error("统计发布数量失败:", err);
    res.status(500).json({ code: 500, message: "服务器内部错误" });
  }
};
// 获取用户收藏数量
getFavoriteCount = async (req, res) => {
  try {
    const userId = req.user.student_id;
    const result = await query(
      "SELECT COUNT(*) AS count FROM favorites WHERE user_id = ?",
      [userId]
    );

    res.json({
      code: 200,
      data: { count: result[0].count },
    });
  } catch (err) {
    console.error("统计收藏失败:", err);
    res.status(500).json({ code: 500, message: "服务器内部错误" });
  }
};
module.exports = {
  getQRCode,
  updateQRCode,
  getQRCodeNoToken, // 导出新的方法
  getPurchaseCount,
  getPostCount,
  getFavoriteCount,
};
