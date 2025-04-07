const Message = require("../models/message");
const Conversation = require("../models/conversation");
const User = require("../models/user");

// 获取用户的所有会话
const getUserConversations = async (req, res) => {
  try {
    const userId = req.user.student_id || req.user.id;
    console.log("获取用户会话列表，用户ID:", userId);
    const conversations = await Conversation.getUserConversations(userId);

    // 查询对话对象的用户信息
    for (let conv of conversations) {
      const otherUserId =
        conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;

      // 使用 findByStudentId 替代 findById
      await new Promise((resolve, reject) => {
        User.findByStudentId(otherUserId, (err, result) => {
          if (err) {
            console.error("查询用户信息出错:", err);
            conv.otherUser = {
              id: otherUserId,
              name: "未知用户",
              avatar: null,
            };
            return resolve();
          }

          if (result && result.length > 0) {
            const userInfo = result[0];
            // 填充用户信息
            conv.otherUser = {
              id: userInfo.student_id,
              name: userInfo.username,
              avatar: userInfo.avatar,
            };
          } else {
            conv.otherUser = {
              id: otherUserId,
              name: "未知用户",
              avatar: null,
            };
          }
          resolve();
        });
      });

      // 设置未读消息计数
      conv.unreadCount =
        userId === conv.buyer_id ? conv.unread_buyer : conv.unread_seller;
    }

    res.status(200).json(conversations);
  } catch (error) {
    console.error("获取会话列表失败:", error);
    res.status(500).json({ message: "获取会话列表失败", error: error.message });
  }
};

// 获取会话消息
const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.student_id || req.user.id;

    // 验证会话是否存在且用户有权限
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "会话不存在" });
    }

    if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
      return res.status(403).json({ message: "无权访问此会话" });
    }

    // 获取消息历史
    const messages = await Message.getByConversationId(conversationId);

    // 标记消息为已读
    if (userId === conversation.buyer_id) {
      await Conversation.resetUnreadCount(conversationId, "buyer");
    } else {
      await Conversation.resetUnreadCount(conversationId, "seller");
    }

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "获取消息失败", error: error.message });
  }
};

// 创建新会话
const createConversation = async (req, res) => {
  console.log("创建会话");

  try {
    // 获取参数
    const { sellerId, buyerId, productId } = req.body;
    const currentUserId = req.user.student_id || req.user.id;
    
    console.log("当前用户ID:", currentUserId);
    console.log("请求参数 - 买家ID:", buyerId);
    console.log("请求参数 - 卖家ID:", sellerId);
    console.log("请求参数 - 商品ID:", productId);
    
    // 根据参数和当前用户角色确定买卖家ID
    let actualBuyerId = buyerId;
    let actualSellerId = sellerId;
    
    // 如果前端没有传入买家ID，而当前用户不是卖家，那么当前用户就是买家
    if (!buyerId && currentUserId !== sellerId) {
      actualBuyerId = currentUserId;
    }
    
    // 如果前端没有传入卖家ID，而当前用户不是买家，那么当前用户就是卖家
    if (!sellerId && currentUserId !== buyerId) {
      actualSellerId = currentUserId;
    }
    
    // 如果前端传入了买卖家ID，以前端传入为准
    
    console.log("确定的买家ID:", actualBuyerId);
    console.log("确定的卖家ID:", actualSellerId);
    
    // 防止自己和自己聊天
    if (actualBuyerId === actualSellerId) {
      return res.status(400).json({ message: "不能和自己聊天" });
    }
    
    // 确保有效值
    if (!actualBuyerId || !actualSellerId) {
      return res.status(400).json({ message: "买家ID和卖家ID不能为空" });
    }

    // 查找或创建会话
    let conversation = await Conversation.findByParticipants(
      actualBuyerId,
      actualSellerId,
      productId
    );

    if (!conversation) {
      conversation = await Conversation.create(actualBuyerId, actualSellerId, productId);
    }

    res.status(201).json(conversation);
  } catch (error) {
    console.error("创建会话失败:", error);
    res.status(500).json({ message: "创建会话失败", error: error.message });
  }
};

// 发送消息
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, image_url } = req.body;
    const senderId = req.user.student_id || req.user.id;
    console.log("发送消息:", { conversationId, senderId, content, image_url }); // 调试日志
    // 验证会话
    // 确保至少有一个内容字段不为空
    if (!content && !image_url) {
      return res.status(400).json({ message: "消息内容不能为空" });
    }
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "会话不存在" });
    }

    if (
      conversation.buyer_id !== senderId &&
      conversation.seller_id !== senderId
    ) {
      return res.status(403).json({ message: "无权访问此会话" });
    }

    // 确定接收者
    const receiverId =
      conversation.buyer_id === senderId
        ? conversation.seller_id
        : conversation.buyer_id;

    // 创建消息
    const message = await Message.create(
      conversationId,
      senderId,
      receiverId,
      content,
      image_url
    );

    // 更新会话最新消息
    await Conversation.updateLatestMessage(
      conversationId,
      message.message_id,
      content || "[图片]",
      senderId
    );

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: "发送消息失败", error: error.message });
  }
};

// 上传聊天图片
const uploadChatImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "未上传图片" });
    }

    res.status(200).json({ imageUrl: req.file.path });
  } catch (error) {
    res.status(500).json({ message: "上传图片失败", error: error.message });
  }
};

module.exports = {
  getUserConversations,
  getConversationMessages,
  createConversation,
  sendMessage,
  uploadChatImage,
};
