//用户、我的页面管理器
// controllers/myController.js
const User = require("../models/user");

// 获取用户的 QRCode
getQRCode = async (req, res) => {
  try {
    const userId = req.user.student_id; // 从认证中间件获取用户ID
    const QRCode = await User.getQRCode(userId);

    if (!QRCode) {
      return res.status(404).json({ message: "用户未找到或未上传二维码" });
    }

    res.status(200).json({ QRCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "服务器错误" });
  }
};

// 更新用户的 QRCode
updateQRCode = async (req, res) => {
  try {
    const userId = req.user.student_id;
    const { QRCode } = req.body;

    const success = await User.updateQRCode(userId, QRCode);
    if (!success) {
      return res.status(404).json({ message: "用户未找到" });
    }

    res.status(200).json({ message: "二维码更新成功" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "服务器错误" });
  }
};
module.exports = {
  getQRCode,
  updateQRCode,
};
