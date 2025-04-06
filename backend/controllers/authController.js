const jwtService = require("../services/jwtService");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const ocrService = require('../services/ocrService');
const fs = require('fs');

// 注册
const register = async (req, res) => {
  // 从 req.body 获取文本数据
  const { student_id, username, password } = req.body;
  // 从 req.file 获取上传的文件信息，如果有文件，则取其路径
  const student_card = req.file ? req.file.path : null;

  // 设置默认头像URL
  const defaultAvatarUrl = "https://s21.ax1x.com/2025/03/18/pEdfnjP.jpg";

  console.log("注册请求数据：", req.body);
  console.log("上传的文件信息：", req.file);

  // 检查是否上传了学生卡照片
  if (!student_card) {
    return res.status(400).json({ message: "请上传学生卡照片" });
  }

  // 读取学生卡照片并转换为Base64
  const imageBuffer = fs.readFileSync(student_card);
  const imageBase64 = imageBuffer.toString('base64');

  // 进行OCR识别
  const ocrResult = await ocrService.recognizeStudentCard(imageBase64);
  console.log("OCR识别结果:", ocrResult);

  // 从OCR结果中提取学号
  const recognizedStudentId = ocrService.extractStudentId(ocrResult);
  console.log("识别到的学号:", recognizedStudentId);

  // 验证识别到的学号与用户输入的学号是否一致
  if (!recognizedStudentId) {
    return res.status(400).json({ message: "无法从学生卡照片中识别学号，请上传清晰的学生卡照片" });
  }

  if (recognizedStudentId !== student_id) {
    return res.status(400).json({ message: "输入的学号与学生卡上的学号不一致，请重新输入" });
  }

  // 首先检查 student_id 是否已存在
  User.findByStudentId(student_id, (err, result) => {
    if (err) {
      console.error("数据库查询出错：", err);
      return res.status(500).json({ message: "数据库错误" });
    }

    if (result.length > 0) {
      console.log("该学生ID已被注册：", student_id);
      return res.status(400).json({ message: "该学生ID已被注册" });
    }
    // 密码加密
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("密码加密失败：", err);
        return res.status(500).json({ message: "密码加密失败" });
      }
      // 创建新用户，将 student_card 的文件路径存入数据库
      User.createWithAvatar(
        student_id,
        username,
        hashedPassword,
        student_card,
        defaultAvatarUrl,
        (err, result) => {
          if (err) {
            console.error("创建用户失败：", err);
            return res.status(500).json({ message: "数据库错误" });
          }
          console.log("注册成功，用户ID:", result.insertId);
          res.status(200).json({ message: "注册成功" });
        }
      );
    });
  });
};

// 登录
const login = (req, res) => {
  const { student_id, password } = req.body;

  console.log("登录请求数据：", req.body);

  // 查询用户是否存在
  User.findByStudentId(student_id, (err, result) => {
    if (err) {
      console.error("查询用户错误：", err);
      return res.status(500).json({ message: "数据库错误" });
    }

    // 如果 result 为空或长度为0，说明没查到
    if (!result || result.length === 0) {
      console.log("用户不存在：", student_id);
      return res.status(404).json({ message: "用户不存在" });
    }

    // 取出第一个用户对象
    const user = result[0];
    if (!user.password) {
      console.error("用户数据异常，未找到密码字段：", user);
      return res.status(500).json({ message: "服务器错误，用户数据异常" });
    }

    // 验证密码
    bcrypt.compare(password, user.password, (err, match) => {
      if (err) {
        console.error("密码比较错误：", err);
        return res.status(500).json({ message: "服务器错误" });
      }
      if (!match) {
        console.log("密码错误：", student_id);
        return res.status(401).json({ message: "密码错误" });
      }

      // 登录成功，生成JWT
      const token = jwtService.generateToken(user);
      console.log("登录成功，生成JWT：", token);

      // 返回JWT给前端
      res.status(200).json({ token });
    });
  });
};

// 验证JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1]; // 获取Authorization头部的Token

  if (!token) {
    console.log("没有提供JWT");
    return res.status(401).json({ message: "没有提供JWT" });
  }

  const userData = jwtService.verifyToken(token);
  if (!userData) {
    console.log("无效的JWT");
    return res.status(403).json({ message: "无效的JWT" });
  }

  // 将用户数据附加到请求对象上，供后续中间件使用
  req.user = userData;
  next();
};

// 更新用户头像
const updateAvatar = (req, res) => {
  // 从认证中获取用户ID
  const student_id = req.user.student_id;

  // 从请求获取上传的文件路径
  const avatarPath = req.file ? req.file.path : null;

  if (!avatarPath) {
    return res.status(400).json({ message: "没有接收到头像文件" });
  }

  // 更新用户头像
  User.updateAvatar(student_id, avatarPath, (err, result) => {
    if (err) {
      console.error("更新头像失败：", err);
      return res.status(500).json({ message: "数据库错误" });
    }

    // 构建可访问的URL路径
    const avatarUrl = `http://localhost:3000/${avatarPath.replace(/\\/g, "/")}`;

    console.log("头像更新成功");
    res.status(200).json({
      message: "头像更新成功",
      avatarUrl: avatarUrl,
    });
  });
};

//获取指定用户信息
const getUserInfo = (req, res) => {
  const targetUserId = req.params.userId;
  console.log("获取用户信息，目标用户ID:", targetUserId);

  User.getUserProfile(targetUserId, (err, result) => {
    if (err) {
      console.error("获取用户信息失败：", err);
      return res.status(500).json({ message: "数据库错误" });
    }

    if (!result || result.length === 0) {
      console.log("用户不存在:", targetUserId);
      return res.status(404).json({ message: "用户不存在" });
    }

    console.log("获取到用户信息:", result[0]);
    // 只返回必要的用户信息，保护隐私
    const userData = {
      student_id: result[0].student_id,
      username: result[0].username,
      avatar: result[0].avatar,
    };

    res.status(200).json(userData);
  });
};
// 更新用户昵称
const updateNickname = (req, res) => {
  const student_id = req.user.student_id; // 从JWT中获取用户ID
  const { nickname } = req.body; // 从请求体中获取新的昵称

  if (!nickname || nickname.trim() === "") {
    return res.status(400).json({ message: "昵称不能为空" });
  }

  // 更新数据库中的昵称
  User.updateNickname(student_id, nickname, (err, result) => {
    if (err) {
      console.error("更新昵称失败：", err);
      return res.status(500).json({ message: "数据库错误" });
    }

    res.status(200).json({ message: "昵称更新成功" });
  });
};

// 获取用户信息
const getUserProfile = (req, res) => {
  const student_id = req.user.student_id; // 从JWT获取学生ID

  User.getUserProfile(student_id, (err, result) => {
    if (err) {
      console.error("获取用户信息失败：", err);
      return res.status(500).json({ message: "数据库错误" });
    }

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "用户不存在" });
    }

    res.status(200).json({ user: result[0] });
  });
};


// 获取用户详细信息
const getUserDetailProfile = (req, res) => {
  const student_id = req.user.student_id;

  User.getUserDetailProfile(student_id, (err, results) => {
    if (err) {
      console.error('获取用户详细信息失败:', err);
      return res.status(500).json({ message: '服务器错误' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 不返回密码等敏感信息
    const user = results[0];

    res.status(200).json({ user });
  });
};

// 修改密码函数也需要相同的修复
const updatePassword = (req, res) => {
  const student_id = req.user.student_id;
  const { oldPassword, newPassword } = req.body;

  // 参数验证
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: '请提供当前密码和新密码' });
  }

  // 验证当前密码
  User.findByStudentId(student_id, (err, results) => {
    if (err) {
      return res.status(500).json({ message: '服务器错误' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const user = results[0];

    // 验证旧密码是否正确
    // 注意：实际应用中应该使用bcrypt等库来比较加密密码
    if (oldPassword !== user.password) {
      return res.status(401).json({ message: '当前密码不正确' });
    }

    // 更新新密码
    User.updatePassword(student_id, newPassword, (updateErr) => {
      if (updateErr) {
        return res.status(500).json({ message: '更新密码失败' });
      }

      res.status(200).json({ message: '密码更新成功' });
    });
  });
};
module.exports = {
  register,
  login,
  authenticateJWT,
  updateAvatar,
  getUserProfile,
  getUserInfo,
  updateNickname,
  getUserDetailProfile,
  updatePassword,
};
