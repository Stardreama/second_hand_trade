const Address = require("../models/address");
const jwt = require("jsonwebtoken");
const { jwt: jwtConfig } = require("../config/config");

exports.getAllAddresses = async (req, res) => {
  try {
    // 从查询参数或请求体中获取用户ID
    const userId = req.query.user_id || req.body.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "无法识别用户身份，请提供user_id参数",
      });
    }

    const [addresses] = await Address.getByUserId(userId);

    res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error("获取地址列表失败:", error);
    res.status(500).json({
      success: false,
      message: "获取地址列表失败",
    });
  }
};

exports.getAddressById = async (req, res) => {
  try {
    const addressId = req.params.id;
    // 从查询参数或请求体中获取用户ID
    const userId = req.query.user_id || req.body.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "无法识别用户身份，请提供user_id参数",
      });
    }

    const address = await Address.getById(addressId);

    // 检查地址是否属于当前用户
    if (!address || address.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: "地址不存在",
      });
    }

    res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error("获取地址详情失败:", error);
    res.status(500).json({
      success: false,
      message: "获取地址详情失败",
    });
  }
};

exports.createAddress = async (req, res) => {
  try {
    // 使用请求体中的user_id
    const userId = req.body.user_id;
    const { name, phone, province, city, district, address, is_default } =
      req.body;

    console.log("用户ID:", userId);
    console.log("请求体:", req.body);

    // 验证用户ID是否存在
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "无法识别用户身份，请重新登录",
      });
    }

    // 验证必填字段
    if (!name || !phone || !province || !city || !address) {
      return res.status(400).json({
        success: false,
        message: "请填写完整的地址信息",
      });
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "请输入有效的手机号",
      });
    }

    const addressData = {
      user_id: userId,
      name,
      phone,
      province,
      city,
      district: district || "",
      address,
      is_default: is_default ? true : false,
    };

    const addressId = await Address.create(addressData);

    res.status(201).json({
      success: true,
      message: "添加地址成功",
      data: { address_id: addressId },
    });
  } catch (error) {
    console.error("添加地址失败:", error);
    res.status(500).json({
      success: false,
      message: "添加地址失败",
    });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.body.user_id; // 使用请求体中的user_id
    const { name, phone, province, city, district, address, is_default } =
      req.body;

    // 验证用户ID是否存在
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "无法识别用户身份，请重新登录",
      });
    }

    // 验证必填字段
    if (!name || !phone || !province || !city || !address) {
      return res.status(400).json({
        success: false,
        message: "请填写完整信息",
      });
    }

    // 验证手机号格式
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "手机号格式不正确",
      });
    }

    // 检查地址是否存在且属于当前用户
    const existingAddress = await Address.getById(addressId);
    if (!existingAddress || existingAddress.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: "地址不存在",
      });
    }

    const addressData = {
      user_id: userId,
      name,
      phone,
      province,
      city,
      district: district || "",
      address,
      is_default: is_default ? true : false,
    };

    await Address.update(addressId, addressData);

    res.status(200).json({
      success: true,
      message: "更新地址成功",
    });
  } catch (error) {
    console.error("更新地址失败:", error);
    res.status(500).json({
      success: false,
      message: "更新地址失败",
    });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.query.user_id || req.body.user_id; // 从查询参数或请求体获取

    // 验证用户ID是否存在
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "无法识别用户身份，请重新登录",
      });
    }

    // 检查地址是否存在且属于当前用户
    const existingAddress = await Address.getById(addressId);
    if (!existingAddress || existingAddress.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: "地址不存在",
      });
    }

    await Address.delete(addressId);

    res.status(200).json({
      success: true,
      message: "删除地址成功",
    });
  } catch (error) {
    console.error("删除地址失败:", error);
    res.status(500).json({
      success: false,
      message: "删除地址失败",
    });
  }
};

exports.setDefaultAddress = async (req, res) => {
  try {
    const addressId = req.params.id;
    const userId = req.query.user_id || req.body.user_id; // 从查询参数或请求体获取

    // 验证用户ID是否存在
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "无法识别用户身份，请重新登录",
      });
    }

    // 检查地址是否存在且属于当前用户
    const existingAddress = await Address.getById(addressId);
    if (!existingAddress || existingAddress.user_id !== userId) {
      return res.status(404).json({
        success: false,
        message: "地址不存在",
      });
    }

    await Address.setDefault(userId, addressId);

    res.status(200).json({
      success: true,
      message: "设置默认地址成功",
    });
  } catch (error) {
    console.error("设置默认地址失败:", error);
    res.status(500).json({
      success: false,
      message: "设置默认地址失败",
    });
  }
};

// 保留JWT认证中间件作为可选的安全措施
exports.authenticateJWT = (req, res, next) => {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "未提供有效的授权令牌",
      });
    }

    const token = authHeader.split(" ")[1];

    // 验证token
    jwt.verify(token, jwtConfig.secret, (err, decoded) => {
      if (err) {
        console.error("JWT验证错误:", err);
        return res.status(401).json({
          success: false,
          message: "无效的授权令牌",
        });
      }

      // 添加JWT信息到请求，但优先使用请求参数中的user_id
      req.jwtUser = decoded;
      next();
    });
  } catch (error) {
    console.error("JWT验证失败:", error);
    return res.status(401).json({
      success: false,
      message: "授权验证失败",
    });
  }
};
