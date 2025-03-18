const jwtService = require("../services/jwtService");
const User = require("../models/user");
const bcrypt = require("bcrypt");

// 注册
const register = (req, res) => {
  // 从 req.body 获取文本数据
  const { student_id, username, password } = req.body;
  // 从 req.file 获取上传的文件信息，如果有文件，则取其路径
  const student_card = req.file ? req.file.path : null;

  // 设置默认头像URL
  const defaultAvatarUrl = "https://s21.ax1x.com/2025/03/18/pEdfnjP.jpg";

  console.log("注册请求数据：", req.body);
  console.log("上传的文件信息：", req.file);

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

// 获取用户资料
const getUserProfile = (req, res) => {
  const student_id = req.user.student_id;

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

module.exports = {
  register,
  login,
  authenticateJWT,
  updateAvatar,
  getUserProfile,
};
