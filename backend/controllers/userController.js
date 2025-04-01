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
module.exports = {
  getQRCode,
  updateQRCode,
};
