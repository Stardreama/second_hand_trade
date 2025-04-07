const OpenAI = require("openai");
require("dotenv").config();

// 创建OpenAI实例
const openai = new OpenAI({
    baseURL: "https://qianfan.baidubce.com/v2",
    apiKey: process.env.BAIDU_API_KEY,
});

const aiService = {
    /**
     * 获取AI生成的商品标题和简介
     * @param {string} userInput - 用户输入内容，例如"我想要卖王道考研2024计组"
     * @returns {Promise<Object>} - 返回AI生成的结果
     */
    generateProductContent: async (userInput) => {
        try {
            const response = await openai.chat.completions.create({
                model: "ernie-speed-8k",
                messages: [
                    {
                        role: "system",
                        content: `你是一个专业的校园二手平台商品描述助手，擅长为大学生卖家或买家编写吸引人的商品标题和详细介绍。

                        任务：根据用户输入的简短描述，生成适合校园二手交易的商品标题和介绍。

                        输出要求：
                        1. 返回JSON格式，包含三个字段：type(买或卖)、title(商品标题)、introduction(商品简介)
                        2. type字段：准确识别用户是想"买"还是想"卖"商品
                        3. title字段：
                           - 简洁明了，15字以内
                           - 突出商品核心特点和卖点
                           - 包含品牌、型号等关键信息
                           - 使用吸引眼球的词汇提高点击率

                        4. introduction字段：根据交易类型采用不同视角
                           - 若用户想要出售商品，以卖家视角描述：
                             * 商品特征：具体描述商品的基本信息、品牌、型号、功能等
                             * 新旧程度：使用"全新"、"99新"等校园二手常用表达
                             * 商品优点：强调商品对大学生的实用价值
                             * 卖点强调：突出与同类商品的差异或特别优势
                             * 价格合理性：简要说明定价依据或价格优势
                             * 语言风格：自然、真实，使用大学生日常用语，亲切不营销

                           - 若用户想要购买商品，以买家视角描述：
                             * 需求描述：具体说明想要购买的商品规格、型号等基本要求
                             * 新旧要求：对商品新旧程度的期望（如"85新以上即可"）
                             * 功能期望：重点强调对商品功能的核心需求
                             * 价格预期：表达合理的价格预期或价格区间
                             * 交易方式偏好：如"希望校内当面交易验货"等
                             * 语言风格：诚恳、明确，表达真实购买意愿

                        长度适中：50-80字为宜。不要使用分点形式，而是连贯流畅的段落。务必使用中文输出结果。确保JSON格式正确，便于解析。`,
                    },
                    {
                        role: "user",
                        content: userInput,
                    },
                ],
                web_search: {
                    enable: false,
                    enable_citation: false,
                    enable_trace: false,
                },
            });

            // 从响应中提取JSON结果
            const content = response.choices[0].message.content;
            // 提取JSON部分
            const jsonMatch =
                content.match(/```json\n([\s\S]*?)\n```/) ||
                content.match(/{[\s\S]*?}/);
            console.log("AI返回的内容:", content);

            if (jsonMatch) {
                try {
                    const jsonStr = jsonMatch[1] || jsonMatch[0];
                    return JSON.parse(jsonStr);
                } catch (err) {
                    console.error("解析JSON失败:", err);
                    throw new Error("AI返回的结果格式错误");
                }
            } else {
                throw new Error("未能从AI响应中提取有效内容");
            }
        } catch (error) {
            console.error("调用AI服务失败:", error);
            throw error;
        }
    },
};

module.exports = aiService;
