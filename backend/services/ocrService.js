const https = require('https');
const querystring = require('querystring');
require('dotenv').config();

// 从环境变量获取AK和SK
const AK = process.env.BAIDU_OCR_AK;
const SK = process.env.BAIDU_OCR_SK;

// 获取百度OCR的Access Token
const getAccessToken = () => {
  return new Promise((resolve, reject) => {
    const params = {
      grant_type: 'client_credentials',
      client_id: AK,
      client_secret: SK
    };

    const options = {
      hostname: 'aip.baidubce.com',
      path: '/oauth/2.0/token?' + querystring.stringify(params),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response.access_token);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

// 进行OCR识别
const recognizeStudentCard = async (imageBase64) => {
  try {
    const accessToken = await getAccessToken();
    
    return new Promise((resolve, reject) => {
      const params = {
        image: imageBase64,
        detect_direction: 'false',
        paragraph: 'false',
        probability: 'false'
      };

      const postData = querystring.stringify(params);
      
      const options = {
        hostname: 'aip.baidubce.com',
        path: `/rest/2.0/ocr/v1/accurate_basic?access_token=${accessToken}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            resolve(response);
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(postData);
      req.end();
    });
  } catch (error) {
    console.error('OCR识别错误:', error);
    throw error;
  }
};

// 从OCR结果中提取学号
const extractStudentId = (ocrResult) => {
  if (!ocrResult || !ocrResult.words_result) {
    return null;
  }

  // 遍历识别结果，查找包含"学号"的文本行
  for (const item of ocrResult.words_result) {
    const text = item.words;
    if (text.includes('学号')) {
      // 使用正则表达式提取数字部分
      const matches = text.match(/\d+/);
      if (matches && matches.length > 0) {
        console.log(`提取到的学号: ${matches[0]}`);
        
        return matches[0];
      }
    }
  }

  return null;
};

module.exports = {
  recognizeStudentCard,
  extractStudentId
};