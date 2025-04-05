// controllers/followController.js
const followService = require("../models/follow");

// 关注接口
const followSeller = async (req, res) => {
    try {
        // 从 JWT 中获取关注者（follower）的 student_id
        const follower_id = req.user.student_id;
        // 从请求体中获取被关注者（followee）的 student_id
        const { followee_id } = req.body;

        if (!followee_id) {
            return res.status(400).json({ message: "缺少被关注者ID" });
        }
        if (follower_id === followee_id) {
            return res.status(400).json({ message: "不能关注自己" });
        }

        // 检查是否已经关注过
        const isFollowed = await followService.checkFollowStatus(follower_id, followee_id);
        if (isFollowed) {
            return res.status(400).json({ message: "已关注" });
        }

        // 未关注，则插入记录
        await followService.addFollow(follower_id, followee_id);
        return res.status(201).json({ message: "关注成功" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "数据库错误", error: err.message });
    }
};

// 取消关注接口
const unfollowSeller = async (req, res) => {
    try {
        const follower_id = req.user.student_id;
        const { followee_id } = req.body;
        
        if (!followee_id) {
            return res.status(400).json({ message: "缺少被关注者ID" });
        }
        
        const result = await followService.removeFollow(follower_id, followee_id);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "未找到关注记录" });
        }
        
        return res.status(200).json({ message: "取消关注成功" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "数据库错误", error: err.message });
    }
};

// 检查关注状态接口
const getFollowStatus = async (req, res) => {
    try {
        // 从 JWT 中获取当前用户的 student_id
        const follower_id = req.user.student_id;
        // 从查询参数中获取被关注者的 student_id
        const { followee_id } = req.query;
        
        if (!followee_id) {
            return res.status(400).json({ message: "缺少被关注者ID" });
        }
        
        const followed = await followService.checkFollowStatus(follower_id, followee_id);
        return res.status(200).json({ followed });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "数据库错误", error: err.message });
    }
};

// 获取关注数和粉丝数接口
const getFollowCounts = async (req, res) => {
    try {
        const student_id = req.user.student_id;
        
        const followCount = await followService.getFollowCount(student_id);
        const fansCount = await followService.getFansCount(student_id);
        
        return res.status(200).json({ followCount, fansCount });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "数据库错误", error: err.message });
    }
};

// 获取关注对象列表接口
const getFolloweesList = async (req, res) => {
    try {
        const student_id = req.user.student_id;
        const followees = await followService.getFolloweesList(student_id);
        console.log(followees);
        return res.status(200).json({ followees });
    } catch (err) {
        console.error("getFolloweesList error:", err);
        return res.status(500).json({ message: "数据库错误", error: err.message });
    }
};

// 获取我的粉丝列表
const getFansList = async (req, res) => {
    try {
        const studentId = req.user.student_id;
        const fans = await followService.getFansList(studentId);
        res.status(200).json({ fans });
    } catch (err) {
        console.error("getFansList error:", err);
        return res.status(500).json({ message: "数据库错误", error: err.message });
    }
};

// 公开API：获取指定用户的关注数和粉丝数
const getPublicFollowCounts = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        if (!userId) {
            return res.status(400).json({ message: "缺少用户ID" });
        }
        
        const followCount = await followService.getFollowCount(userId);
        const fansCount = await followService.getFansCount(userId);
        
        return res.status(200).json({ followCount, fansCount });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "数据库错误", error: err.message });
    }
};

module.exports = { 
    followSeller, 
    unfollowSeller, 
    getFollowStatus, 
    getFollowCounts, 
    getFolloweesList, 
    getFansList, 
    getPublicFollowCounts 
};