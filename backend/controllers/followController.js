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

// 获取关注数和粉丝数接口
const getFollowCounts = (req, res) => {
    const student_id = req.user.student_id;
    // 查询关注数：你关注的数量（follower_id = student_id）
    const queryFollow = "SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?";
    // 查询粉丝数：关注你的数量（followee_id = student_id）
    const queryFans = "SELECT COUNT(*) AS count FROM follows WHERE followee_id = ?";

    db.query(queryFollow, [student_id], (err, followResults) => {
        if (err) {
            return res.status(500).json({ message: "数据库错误", error: err.message });
        }
        const followCount = followResults[0].count;
        db.query(queryFans, [student_id], (err, fansResults) => {
            if (err) {
                return res.status(500).json({ message: "数据库错误", error: err.message });
            }
            const fansCount = fansResults[0].count;
            return res.status(200).json({ followCount, fansCount });
        });
    });
};

// 获取关注对象列表接口：查询当前用户关注的所有 followee，并获取对应的用户信息
const getFolloweesList = (req, res) => {
    const student_id = req.user.student_id;
    // 通过关联 users 表获取关注对象的头像和昵称等信息
    const query = `
    SELECT u.student_id, u.avatar, u.username 
    FROM follows f 
    JOIN users u ON f.followee_id = u.student_id 
    WHERE f.follower_id = ?
    ORDER BY f.created_at DESC
  `;
    db.query(query, [student_id], (err, results) => {
        if (err) {
            console.error("getFolloweesList error:", err);
            return res.status(500).json({ message: "数据库错误", error: err.message });
        }
        console.log(results);
        return res.status(200).json({ followees: results });
    });
};

// 新建：获取我的粉丝列表
const getFansList = (req, res) => {
    const studentId = req.user.student_id;
    const sql = `
    SELECT u.student_id, u.avatar, u.username
    FROM follows f
    JOIN users u ON f.follower_id = u.student_id
    WHERE f.followee_id = ?
    ORDER BY f.created_at DESC
  `;
    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error("getFansList error:", err);
            return res.status(500).json({ message: "数据库错误", error: err.message });
        }
        res.status(200).json({ fans: results });
    });
};




// 公开API：获取指定用户的关注数和粉丝数
const getPublicFollowCounts = (req, res) => {
    const userId = req.params.userId;
    
    if (!userId) {
        return res.status(400).json({ message: "缺少用户ID" });
    }
    
    // 查询关注数：该用户关注的数量
    const queryFollow = "SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?";
    // 查询粉丝数：关注该用户的数量
    const queryFans = "SELECT COUNT(*) AS count FROM follows WHERE followee_id = ?";
    
    db.query(queryFollow, [userId], (err, followResults) => {
        if (err) {
            return res.status(500).json({ message: "数据库错误", error: err.message });
        }
        
        const followCount = followResults[0].count;
        
        db.query(queryFans, [userId], (err, fansResults) => {
            if (err) {
                return res.status(500).json({ message: "数据库错误", error: err.message });
            }
            
            const fansCount = fansResults[0].count;
            return res.status(200).json({ followCount, fansCount });
        });
    });
};


module.exports = { followSeller, unfollowSeller, getFollowStatus, getFollowCounts, getFolloweesList, getFansList, getPublicFollowCounts };
