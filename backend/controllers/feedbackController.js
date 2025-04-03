const Feedback = require("../models/feedback");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 配置图片存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/feedback";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("只允许上传图片文件！"));
    }
    cb(null, true);
  },
}).array("images", 4);

// 添加反馈函数
const addFeedback = (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    // 从请求体获取数据
    const { issue_type, description, contact, user_id } = req.body;

    // 验证必填字段
    if (!issue_type || !description) {
      return res.status(400).json({ message: "问题类型和描述不能为空" });
    }

    // 处理图片路径
    const imagePaths = req.files ? req.files.map((file) => file.path) : [];
    const imagesJson =
      imagePaths.length > 0 ? JSON.stringify(imagePaths) : null;

    // 创建反馈对象
    const feedbackData = {
      user_id: user_id || null,
      issue_type,
      description,
      images: imagesJson,
      contact: contact || null,
    };

    // 保存到数据库
    Feedback.create(feedbackData, (err, result) => {
      if (err) {
        console.error("创建反馈失败:", err);
        return res.status(500).json({ message: "数据库错误" });
      }
      res.status(201).json({
        message: "反馈提交成功",
        feedback_id: result.insertId,
      });
    });
  });
};

module.exports = {
  addFeedback,
};
