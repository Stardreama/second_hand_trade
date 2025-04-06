const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { authMiddleware } = require('../services/jwtService');

// 添加或取消收藏
router.post('/', authMiddleware, favoriteController.toggleFavorite);

// 获取收藏状态
router.get('/:productId', authMiddleware, favoriteController.getFavoriteStatus);

// 获取用户所有收藏的商品
router.get('/', authMiddleware, favoriteController.getUserFavorites);

module.exports = router;