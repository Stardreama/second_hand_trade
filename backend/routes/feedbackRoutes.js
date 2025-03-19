const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');

// 使用明确的引用，避免可能的未定义错误
router.post('/feedback', (req, res) => {
    feedbackController.addFeedback(req, res);
});

module.exports = router;