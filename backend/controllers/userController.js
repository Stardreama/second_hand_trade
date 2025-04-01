//用户、我的页面管理器
// controllers/myController.js
const User = require("../models/user");

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
    return res.status(400).json({ success: false, message: "seller_id 参数缺失" });
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


module.exports = {
  getQRCode,
  updateQRCode,
  getQRCodeNoToken, // 导出新的方法
};
