const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const jwtService = require('../services/jwtService');

// AI内容生成接口，需要用户身份验证
router.post('/generate', jwtService.authMiddleware, aiController.generateProductContent);

module.exports = router;