// controllers/followController.js
const { db } = require("../config/config");

// 关注接口
const followSeller = (req, res) => {
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
    const checkQuery = "SELECT * FROM follows WHERE follower_id = ? AND followee_id = ?";
    db.query(checkQuery, [follower_id, followee_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "数据库错误", error: err.message });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: "已关注" });
        }

        // 未关注，则插入记录
        const insertQuery = "INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)";
        db.query(insertQuery, [follower_id, followee_id], (err, result) => {
            if (err) {
                return res.status(500).json({ message: "数据库错误", error: err.message });
            }
            return res.status(201).json({ message: "关注成功" });
        });
    });
};

// 取消关注接口
const unfollowSeller = (req, res) => {
    const follower_id = req.user.student_id;
    const { followee_id } = req.body;
    if (!followee_id) {
        return res.status(400).json({ message: "缺少被关注者ID" });
    }
    const deleteQuery = "DELETE FROM follows WHERE follower_id = ? AND followee_id = ?";
    db.query(deleteQuery, [follower_id, followee_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "数据库错误", error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "未找到关注记录" });
        }
        return res.status(200).json({ message: "取消关注成功" });
    });
};

// 检查关注状态接口
const getFollowStatus = (req, res) => {
    // 从 JWT 中获取当前用户的 student_id
    const follower_id = req.user.student_id;
    // 从查询参数中获取被关注者的 student_id
    const { followee_id } = req.query;
    if (!followee_id) {
        return res.status(400).json({ message: "缺少被关注者ID" });
    }
    const checkQuery = "SELECT * FROM follows WHERE follower_id = ? AND followee_id = ?";
    db.query(checkQuery, [follower_id, followee_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "数据库错误", error: err.message });
        }
        const followed = results.length > 0;
        return res.status(200).json({ followed });
    });
};

module.exports = { followSeller, unfollowSeller, getFollowStatus };
