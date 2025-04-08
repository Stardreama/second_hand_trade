const { db } = require("../config/config"); // 导入数据库连接配置

// 定义查询函数
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

// 获取用户卖出商品数量
const getSaleCount = async (req, res) => {
  try {
    const userId = req.user.student_id;

    // 查询orders表中当前用户作为卖家的记录数
    // 移除错误的数组解构
    const results = await query(
      "SELECT COUNT(*) as count FROM orders WHERE seller_id = ?",
      [userId]
    );

    res.status(200).json({
      code: 200,
      data: { count: results[0].count || 0 },
    });
  } catch (error) {
    console.error("获取卖出数量失败:", error);
    res.status(500).json({
      code: 500,
      message: "获取卖出数量失败",
    });
  }
};

// 检查商品是否已售出
const checkProductSold = async (req, res) => {
  try {
    const { productId } = req.params;

    // 查询orders表中是否存在该商品记录
    const results = await query("SELECT * FROM orders WHERE product_id = ?", [
      productId,
    ]);

    res.status(200).json({
      code: 200,
      data: {
        isSold: results && results.length > 0,
        hasBuyer: results && results.length > 0 && results[0].buyer_id !== null,
      },
    });
  } catch (error) {
    console.error("检查商品是否已售出失败:", error);
    res.status(500).json({
      code: 500,
      message: "检查商品是否已售出失败",
    });
  }
};

module.exports = {
  getSaleCount,
  checkProductSold,
};
