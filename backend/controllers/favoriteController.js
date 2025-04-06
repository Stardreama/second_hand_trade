const Favorite = require("../models/favorite");

// 添加或取消收藏
exports.toggleFavorite = (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user.student_id;

        // 检查是否已经收藏
        Favorite.findOne(userId, productId, (err, favorites) => {
            if (err) {
                console.error("获取收藏状态失败:", err);
                return res.status(500).json({
                    message: '服务器错误，请稍后再试'
                });
            }

            let favorited = false;

            if (favorites.length > 0) {
                // 已收藏，取消收藏
                Favorite.delete(userId, productId, (deleteErr) => {
                    if (deleteErr) {
                        console.error("取消收藏失败:", deleteErr);
                        return res.status(500).json({
                            message: '服务器错误，请稍后再试'
                        });
                    }
                    res.status(200).json({
                        favorited: false,
                        message: '已取消收藏'
                    });
                });
            } else {
                // 未收藏，添加收藏
                Favorite.create(userId, productId, (createErr) => {
                    if (createErr) {
                        console.error("添加收藏失败:", createErr);
                        return res.status(500).json({
                            message: '服务器错误，请稍后再试'
                        });
                    }
                    res.status(200).json({
                        favorited: true,
                        message: '收藏成功'
                    });
                });
            }
        });
    } catch (error) {
        console.error('收藏操作失败:', error);
        res.status(500).json({
            message: '服务器错误，请稍后再试'
        });
    }
};

// 获取收藏状态
exports.getFavoriteStatus = (req, res) => {
    try {
        const productId = req.params.productId;
        const userId = req.user.student_id;

        Favorite.findOne(userId, productId, (err, favorites) => {
            if (err) {
                console.error("获取收藏状态失败:", err);
                return res.status(500).json({
                    message: '服务器错误，请稍后再试'
                });
            }

            res.status(200).json({
                favorited: favorites.length > 0
            });
        });
    } catch (error) {
        console.error('获取收藏状态失败:', error);
        res.status(500).json({
            message: '服务器错误，请稍后再试'
        });
    }
};

// 获取用户所有收藏的商品
exports.getUserFavorites = (req, res) => {
    try {
        const userId = req.user.student_id;

        Favorite.findAllByUser(userId, (err, favorites) => {
            if (err) {
                console.error("获取收藏商品列表失败:", err);
                return res.status(500).json({
                    message: '服务器错误，请稍后再试'
                });
            }

            res.status(200).json({
                code: 200,
                data: favorites
            });
        });
    } catch (error) {
        console.error('获取收藏商品列表失败:', error);
        res.status(500).json({
            message: '服务器错误，请稍后再试'
        });
    }
};