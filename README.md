# 校园二手交易平台微信小程序开发文档

## 一. 项目概述

### 项目名称

校园二手交易平台

### 技术栈

- **前端**: Uniapp(基于vue.js)
- **后端**: Node.js
- **数据库**: MySQL

### 主要功能

- **登录注册**: 用户注册时需要上传学生卡照片，账户名为学生卡号，用户名，密码由用户自己填写。登录时使用学生卡号和密码。
- **发布商品**: 用户可以设置商品价格、物品描述，并上传图片。
- **修改已发布的商品信息**: 用户可以编辑已发布的商品信息。
- **搜索商品**: 支持全文搜索和模糊搜索。
- **聊天功能**: 用户之间可以私聊，支持实时聊天。
- **下单支付**: 用户可以使用微信支付进行下单。

## 二. 前端需求

### 1. 登录注册

- 用户注册时需要上传学生卡照片，账户名为学生卡号，用户名由用户自己填写。
- 登录时使用学生卡号和密码。

### 2. 发布商品

- 用户可以设置商品价格、物品描述，并上传图片。
- **图片格式和大小**: 支持JPG、PNG格式，最大上传文件大小为5MB。

### 3. 修改已发布的商品信息

- 用户可以编辑已发布的商品信息。

### 4. 搜索商品

- 支持全文搜索和模糊搜索。
- **无匹配商品时**: 返回空数组，并提示“没有找到相关商品”。

### 5. 聊天功能

- 用户之间可以私聊，支持实时聊天。
- **扩展功能**: 支持发送图片和表情。

### 6. 下单支付

- 用户可以使用微信支付进行下单。
- **支付回调**: 前端需处理支付回调并跳转至订单详情页，显示支付状态。

### 7. 前端界面设计

#### (1) 首页

- 展示最新发布的商品。

#### (2) 聊天页

- 展示用户的私聊记录。

#### (3) 我的页面

- 包含以下内容：
  - 我发布的商品
  - 我购买的商品
  - 订单列表
  - 支付情况
  - 订单是否已确认完成

## 三. 后端需求

### 1. 数据库设计

#### (1) 用户表 (`users`)

| 字段名         | 类型         | 描述             |
| -------------- | ------------ | ---------------- |
| `student_id`   | VARCHAR(20)  | 学生卡号（主键） |
| `username`     | VARCHAR(50)  | 用户名           |
| `password`     | VARCHAR(255) | 密码             |
| `student_card` | VARCHAR(255) | 学生卡照片路径   |
| `created_at`   | DATETIME     | 创建时间         |

#### (2) 商品表 (`products`)

| 字段名        | 类型          | 描述           |
| ------------- | ------------- | -------------- |
| `product_id`  | INT           | 商品ID（主键） |
| `seller_id`   | VARCHAR(20)   | 发布者ID       |
| `price`       | DECIMAL(10,2) | 价格           |
| `description` | TEXT          | 描述           |
| `image`       | VARCHAR(255)  | 图片路径       |
| `created_at`  | DATETIME      | 创建时间       |

#### (3) 订单表 (`orders`)

| 字段名       | 类型                                             | 描述                                 |
| ------------ | ------------------------------------------------ | ------------------------------------ |
| `order_id`   | INT                                              | 订单ID（主键）                       |
| `product_id` | INT                                              | 商品ID                               |
| `buyer_id`   | VARCHAR(20)                                      | 买家ID                               |
| `seller_id`  | VARCHAR(20)                                      | 卖家ID                               |
| `status`     | ENUM('pending', 'completed', 'canceled', 'paid') | 订单状态（增加了`canceled`和`paid`） |
| `created_at` | DATETIME                                         | 创建时间                             |

#### (4) 聊天记录表 (`messages`)

| 字段名        | 类型        | 描述           |
| ------------- | ----------- | -------------- |
| `message_id`  | INT         | 消息ID（主键） |
| `sender_id`   | VARCHAR(20) | 发送者ID       |
| `receiver_id` | VARCHAR(20) | 接收者ID       |
| `content`     | TEXT        | 消息内容       |
| `timestamp`   | DATETIME    | 时间戳         |

### 2. 用户认证和授权

#### (1) JWT认证

- 使用JWT（JSON Web Token）进行用户认证和授权。
- 用户登录成功后，服务器生成一个JWT并返回给客户端。
- 客户端在后续请求中携带该JWT，服务器验证JWT的有效性。
- **JWT刷新逻辑**: 如果JWT过期，客户端需要使用刷新Token获取新的Token。

#### (2) 安全性

- 使用HTTPS加密传输数据。
- JWT设置合理的过期时间（如1小时）。
- 密码使用bcrypt进行加密存储。
- 防止SQL注入和XSS攻击，使用ORM框架以及对用户输入进行适当的验证和转义。

### 3. 图片上传和展示

#### (1) 图片存储

- 使用云存储（如阿里云OSS、腾讯云COS）存储用户上传的图片。
- 图片上传后返回图片的URL。

#### (2) 前端展示

- 使用`<image>`标签展示图片，src属性为图片的URL。

### 4. 实时聊天功能

#### (1) 技术选型

- 使用WebSocket实现实时聊天功能。

#### (2) 聊天记录存储

- 聊天记录存储在`messages`表中。
- 前端通过WebSocket接收实时消息，并展示在聊天界面。
- **消息顺序保证**: 可以使用消息队列技术来保证消息的顺序和传输可靠性。

### 5. 支付接口对接

#### (1) 微信支付对接

- 使用微信支付API进行支付对接。
- 生成支付订单，调用微信支付接口获取支付参数。
- 前端调用微信支付API完成支付。

#### (2) 支付回调

- 微信支付成功后，微信服务器会发送支付结果通知到服务器。
- 服务器验证通知的合法性，并更新订单状态。
- **支付签名验证**: 在回调时需要进行支付通知的签名验证，确保数据的合法性。

### 6. 商品搜索功能

#### (1) 全文搜索和模糊搜索

- 使用MySQL的全文索引实现全文搜索。
- 使用LIKE语句实现模糊搜索。

## 四. API接口设计

### 1. 用户注册

- **URL**: `/api/register`

- **Method**: POST

- Request Body

  :

  ```json
  {
    "student_id": "123456",
    "username": "user1",
    "password": "password123",
    "student_card": "base64_encoded_image"
  }
  ```

- Response

  :

  ```json
  {
    "message": "注册成功"
  }
  ```

### 2. 用户登录

- **URL**: `/api/login`

- **Method**: POST

- Request Body

  :

  ```json
  {
    "student_id": "123456",
    "password": "password123"
  }
  ```

- Response

  :

  ```json
  {
    "token": "jwt_token"
  }
  ```

### 3. 发布商品

- **URL**: `/api/products`

- **Method**: POST

- Request Body

  :

  ```json
  {
    "price": 100.00,
    "description": "二手书",
    "image": "base64_encoded_image"
  }
  ```

- Response

  :

  ```json
  {
    "message": "商品发布成功",
    "product_id": 1
  }
  ```

### 4. 搜索商品

- **URL**: `/api/products/search`

- **Method**: GET

- Query Parameters

  :

  - `keyword`: 搜索关键词

- Response

  :

  ```json
  [
    {
      "product_id": 1,
      "price": 100.00,
      "description": "二手书",
      "image": "image_url"
    }
  ]
  ```

### 5. 下单支付

- **URL**: `/api/orders`

- **Method**: POST

- Request Body

  :

  ```json
  {
    "product_id": 1
  }
  ```

- Response

  :

  ```json
  {
    "order_id": 1,
    "payment_params": {
      "appId": "wx1234567890",
      "timeStamp": "1631234567",
      "nonceStr": "5K8264ILTKCH16CQ2502SI8ZNMTM67VS",
      "package": "prepay_id=wx201410272009395522657a690389285100",
      "signType": "MD5",
      "paySign": "C380BEC2BFD727A4B6845133519F3AD6"
    }
  }
  ```

## 五. 关键代码示例

### 1. JWT认证

```javascript
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ student_id: user.student_id }, 'secret_key', { expiresIn: '1h' });
};

const verifyToken = (token) => {
  return jwt.verify(token, 'secret_key');
};
```

### 2. WebSocket实现

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    // 处理消息并广播
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });
});
```

### 3. 微信支付对接

```javascript
const wxpay = require('wxpay');

const pay = new wxpay({
  appid: 'wx1234567890',
  mch_id: '1234567890',
  key: 'your_key'
});

const createOrder = (order) => {
  return pay.unifiedOrder({
    body: '校园二手交易',
    out_trade_no: order.order_id,
    total_fee: order.total_fee,
    spbill_create_ip: '127.0.0.1',
    notify_url: 'https://yourdomain.com/notify',
    trade_type: 'JSAPI',
    openid: order.openid
  });
};
```

### 4. 数据库表结构的SQL语句

```sql
CREATE TABLE users (
  student_id VARCHAR(20) PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  password VARCHAR(255) NOT NULL,
  student_card VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  product_id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id VARCHAR(20) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(student_id)
);

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  buyer_id VARCHAR(20) NOT NULL,
  seller_id VARCHAR(20) NOT NULL,
  status ENUM('pending', 'completed', 'canceled', 'paid') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(product_id),
  FOREIGN KEY (buyer_id) REFERENCES users(student_id),
  FOREIGN KEY (seller_id) REFERENCES users(student_id)
);

CREATE TABLE messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id VARCHAR(20) NOT NULL,
  receiver_id VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(student_id),
  FOREIGN KEY (receiver_id) REFERENCES users(student_id)
);
```

## 6.项目文件结构

文件结构：

```
second_hand_trade
│
├── backend/                     # 后端项目目录
│   ├── config/                  # 配置文件
│   │   ├── config.js            # 数据库、JWT配置等
│   │   └── paymentConfig.js     # 微信支付配置
│   ├── controllers/             # 控制器，处理请求和业务逻辑
│   │   ├── authController.js    # 处理登录、注册等认证相关的控制器
│   │   ├── productController.js # 处理商品发布、修改、查询等
│   │   ├── orderController.js   # 处理订单相关操作
│   │   └── messageController.js # 处理聊天功能相关操作
│   ├── models/                  # 数据库模型，ORM定义
│   │   ├── user.js              # 用户模型
│   │   ├── product.js           # 商品模型
│   │   ├── order.js             # 订单模型
│   │   └── message.js           # 聊天记录模型
│   ├── routes/                  # API路由
│   │   ├── authRoutes.js        # 用户认证相关路由
│   │   ├── productRoutes.js     # 商品相关路由
│   │   ├── orderRoutes.js       # 订单相关路由
│   │   └── messageRoutes.js     # 聊天相关路由
│   ├── services/                # 业务逻辑层
│   │   ├── jwtService.js        # 处理JWT生成与验证
│   │   ├── paymentService.js    # 处理微信支付逻辑
│   │   └── websocketService.js  # 处理WebSocket聊天逻辑
│   ├── utils/                   # 工具函数
│   │   └── logger.js            # 日志记录工具
│   ├── .env                     # 环境变量文件
│   ├── server.js                # 后端入口文件，启动Express应用
│   ├── package.json             # 后端依赖与配置
│   └── README.md                # 后端项目说明文档
│
├── frontend/                    # 前端项目目录
│   ├── public/                  # 静态文件
│   │   └── index.html           # 前端主HTML文件
│   ├── src/                     # 源代码
│   │   ├── assets/              # 静态资源（图片、字体等）
│   │   ├── components/          # 可复用的组件
│   │   │   ├── Header.vue       # 头部组件
│   │   │   ├── Footer.vue       # 底部组件
│   │   │   └── ProductItem.vue  # 商品项组件
│   │   ├── pages/               # 页面组件
│   │   │   ├── Home.vue         # 首页
│   │   │   ├── Login.vue        # 登录页
│   │   │   ├── Register.vue     # 注册页
│   │   │   ├── ProductDetail.vue# 商品详情页
│   │   │   ├── Chat.vue         # 聊天页
│   │   │   └── Order.vue        # 订单页
│   │   ├── services/            # 与后端API交互的服务层
│   │   │   ├── authService.js   # 用户认证服务
│   │   │   ├── productService.js# 商品服务
│   │   │   ├── orderService.js  # 订单服务
│   │   │   └── messageService.js# 消息服务
│   │   ├── store/               # 状态管理（Vuex）
│   │   │   └── index.js         # Vuex状态管理
│   │   ├── router/              # 路由管理
│   │   │   └── index.js         # 前端路由配置
│   │   ├── App.vue              # 根组件
│   │   ├── main.js              # 项目入口文件
│   │   ├── package.json         # 前端依赖与配置
│   │   └── README.md            # 前端项目说明文档
│   ├── .env                     # 环境变量文件
│   ├── vue.config.js             # Vue配置文件
│   └── README.md                # 前端项目说明文档
│
├── .gitignore                   # Git忽略文件
└── README.md                    # 项目说明文档
```

### 解释

- **backend/**: 后端部分，负责数据处理、API接口、用户认证、支付逻辑、实时聊天等。
  - **controllers/**：包含处理业务逻辑的控制器，负责接收前端请求并与模型层交互。
  - **models/**：定义数据库结构和操作方法。
  - **routes/**：包含API接口的路由，前端通过这些路由与后端交互。
  - **services/**：封装业务逻辑，比如 JWT 验证、微信支付逻辑、WebSocket聊天服务等。
  - **server.js**：后端项目的入口文件，启动 Express 应用。

- **frontend/**: 前端部分，使用 Vue.js 和 Uniapp 进行开发，负责用户界面和与后端交互。
  - **components/**：可复用的 Vue 组件，例如页面的头部、底部等。
  - **pages/**：前端页面组件，例如登录、注册、商品详情、订单页等。
  - **services/**：前端与后端的服务层，负责封装与后端 API 的交互。
  - **store/**：使用 Vuex 管理全局状态。
  - **router/**：前端的路由配置，控制页面的跳转。
  - **main.js**：前端项目的入口文件，初始化应用。

- **.gitignore**：Git忽略的文件，确保不将敏感文件或不必要的文件提交到版本库中。

- **README.md**：每个项目的说明文档，记录开发流程、技术栈和项目的使用方式。

