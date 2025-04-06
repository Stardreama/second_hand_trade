const aiService = require('../services/aiService');

const aiController = {
  /**
   * 生成商品内容
   */
  generateProductContent: async (req, res) => {
    try {
      const { userInput } = req.body;

      if (!userInput) {
        return res.status(400).json({ message: '缺少用户输入' });
      }

      const result = await aiService.generateProductContent(userInput);
      res.status(200).json(result);
    } catch (error) {
      console.error('AI内容生成错误:', error);
      res.status(500).json({ 
        message: '内容生成失败',
        error: error.message 
      });
    }
  }
};

module.exports = aiController;