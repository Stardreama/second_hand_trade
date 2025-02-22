# 校园二手交易平台微信小程序开发文档（修订版）

## 一. 项目概述

### 项目名称

校园二手交易平台

### 技术栈

- **前端**: Uniapp（基于 Vue.js）
- **后端**: Node.js
- **数据库**: MySQL

### 主要功能

- **登录注册**: 用户注册时上传学生卡照片，账户名为学生卡号，用户名和密码由用户自行填写，登录时使用学生卡号和密码。
- **发布商品**: 用户可以设置商品价格、物品描述，并上传图片。
- **修改已发布的商品信息**: 用户可以编辑已发布的商品信息。
- **搜索商品**: 支持全文搜索和模糊搜索，当无匹配商品时返回空数组并提示“没有找到相关商品”。
- **聊天及交易收款**:用户间支持一对一实时聊天（替代原购物车页面），聊天界面中允许发送图片、表情及付款相关内容。**支付流程改造**：由于个人主体账号无法直接使用微信支付，故取消直接微信支付功能。在聊天中，卖方可手动发送收款码（如收款二维码图片）；买方付款后，卖方在聊天中确认收款，系统自动将对应商品标记为“已售出”。
- **订单管理**: 订单流程采用先创建订单（状态为 pending），后由卖方在聊天中确认收款后更新订单状态。订单状态包括 pending、paid（或已确认付款）、completed 和 canceled。

## 二. 前端需求

### 1. 登录注册

- 用户注册时需上传学生卡照片，账户名为学生卡号，用户名由用户自行填写。
- 登录时使用学生卡号和密码。

### 2. 发布商品

- 用户可设置商品价格、物品描述，并上传图片。
- **图片格式和大小**: 支持 JPG、PNG 格式，最大上传文件大小为 5MB。

### 3. 修改已发布的商品信息

- 用户可编辑已发布的商品信息。

### 4. 搜索商品

- 支持全文搜索和模糊搜索。
- **无匹配商品时**: 返回空数组，并提示“没有找到相关商品”。

### 5. 聊天及交易收款功能

- **实时聊天**: 用户之间可进行一对一实时聊天，支持文字、图片、表情等常规聊天内容。
- **收款功能扩展**:在聊天过程中，卖方可手动发送收款码图片给买方（代替原微信支付流程）。卖方在确认收到买方付款后，通过聊天页面触发订单状态更新，系统将对应商品标记为已售出。

### 6. 订单及支付确认流程

- **订单创建**: 当买方决定购买商品时，系统生成订单，初始状态为 pending。
- **支付确认**: 不再调用微信支付 API。交易转移到聊天环节，由卖方在收到买方付款后手动确认：卖方点击“确认收款”按钮，后台更新订单状态为 paid 或 completed，同时商品显示为已售出。

### 7. 前端界面设计

#### (1) 首页

- 展示最新发布的商品。

#### (2) 聊天页

- 替代原购物车页面，展示用户的一对一聊天记录，并支持在聊天中完成支付确认（发送收款码、确认付款）。

#### (3) 我的页面
- 包含以下内容：
  - 我发布的商品
  - 我购买的商品
  - 订单列表
  - 支付情况
  - 订单是否已确认完成

## 三. 后端需求

### 1. 数据库设计

#### (1) 用户表 (users)

| 字段名       | 类型         | 描述             |
| ------------ | ------------ | ---------------- |
| student_id   | VARCHAR(20)  | 学生卡号（主键） |
| username     | VARCHAR(50)  | 用户名           |
| password     | VARCHAR(255) | 密码             |
| student_card | VARCHAR(255) | 学生卡照片路径   |
| created_at   | DATETIME     | 创建时间         |

#### (2) 商品表 (products)

| 字段名      | 类型                      | 描述                                      |
| ----------- | ------------------------- | ----------------------------------------- |
| product_id  | INT                       | 商品ID（主键）                            |
| seller_id   | VARCHAR(20)               | 发布者ID                                  |
| price       | DECIMAL(10,2)             | 价格                                      |
| description | TEXT                      | 描述                                      |
| image       | VARCHAR(255)              | 图片路径                                  |
| status      | ENUM('available', 'sold') | 商品状态（available：在售，sold：已售出） |
| created_at  | DATETIME                  | 创建时间                                  |

#### (3) 订单表 (orders)

| 字段名     | 类型                                             | 描述                                                         |
| ---------- | ------------------------------------------------ | ------------------------------------------------------------ |
| order_id   | INT                                              | 订单ID（主键）                                               |
| product_id | INT                                              | 商品ID                                                       |
| buyer_id   | VARCHAR(20)                                      | 买家ID                                                       |
| seller_id  | VARCHAR(20)                                      | 卖家ID                                                       |
| status     | ENUM('pending', 'paid', 'completed', 'canceled') | 订单状态（pending：待付款；paid：卖方确认付款；completed：交易完成；canceled：已取消） |
| created_at | DATETIME                                         | 创建时间                                                     |

#### (4) 聊天记录表 (messages)

| 字段名      | 类型                             | 描述                                                         |
| ----------- | -------------------------------- | ------------------------------------------------------------ |
| message_id  | INT                              | 消息ID（主键）                                               |
| sender_id   | VARCHAR(20)                      | 发送者ID                                                     |
| receiver_id | VARCHAR(20)                      | 接收者ID                                                     |
| content     | TEXT                             | 消息内容                                                     |
| type        | ENUM('text', 'image', 'payment') | 消息类型（其中 type 为 payment 时表示为收款码或付款确认信息） |
| timestamp   | DATETIME                         | 时间戳                                                       |

### 2. 用户认证和授权

- **JWT认证**: 使用 JWT 进行用户认证与授权。登录成功后生成 JWT，并在后续请求中携带该令牌。
- **安全性**:使用 HTTPS 加密传输数据。JWT 设置合理的过期时间（例如 1 小时），并支持刷新逻辑。密码使用 bcrypt 进行加密存储，防范 SQL 注入和 XSS 攻击。

### 3. 图片上传和展示

- **图片存储**: 使用云存储（如阿里云 OSS 或腾讯云 COS）存储上传图片，上传后返回图片 URL。
- **前端展示**: 通过 <image> 标签展示图片，src 属性为图片 URL。

### 4. 实时聊天功能

- **技术选型**: 使用 WebSocket 实现实时一对一聊天。
- **扩展功能**: 除了普通文本和图片，支持发送收款码（作为图片消息或特定类型的消息）。
- **聊天记录存储**: 聊天记录存于 messages 表中，前端通过 WebSocket 获取并展示消息，确保消息顺序正确（可采用消息队列技术）。

### 5. 订单及支付确认逻辑

- **订单创建**: 当买方点击购买后，调用 API 生成订单，订单初始状态为 pending。
- **支付确认**:不再调用微信支付 API，而是在聊天中由卖方手动确认收款。卖方收到买方付款后，在聊天界面点击“确认收款”，后台 API 将对应订单状态更新为 paid 或 completed，同时更新商品状态为 sold。
- **新增接口**: 添加订单确认接口，供卖方确认收款后调用。

### 6. 商品搜索功能

#### (1) 全文搜索和模糊搜索

- 使用MySQL的全文索引实现全文搜索。
- 使用LIKE语句实现模糊搜索。

## 四. API接口设计

### 1. 用户注册

- **URL**: /api/register
- **Method**: POST
- **Request Body**:

```json
{
  "student_id": "123456",
  "username": "user1",
  "password": "password123",
  "student_card": "base64_encoded_image"
}
```

- **Response**:

```json
{
  "message": "注册成功"
}
```

### 2. 用户登录

- **URL**: /api/login
- **Method**: POST
- **Request Body**:

```json
{
  "student_id": "123456",
  "password": "password123"
}
```

- **Response**:

```json
{
  "token": "jwt_token"
}
```

### 3. 发布商品

- **URL**: /api/products
- **Method**: POST
- **Request Body**:

```json
{
  "price": 100.00,
  "description": "二手书",
  "image": "base64_encoded_image"
}
```

- **Response**:

```json
{
  "message": "商品发布成功",
  "product_id": 1
}
```

### 4. 搜索商品

- **URL**: /api/products/search
- **Method**: GET
- **Query Parameters**:keyword: 搜索关键词
- **Response**:

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

### 5. 创建订单

- **URL**: /api/orders
- **Method**: POST
- **Request Body**:

```json
{
  "product_id": 1
}
```

- **Response**:

```json
{
  "order_id": 1,
  "status": "pending"
}
```

### 6. 订单支付确认（卖方操作）

- **URL**: /api/orders/confirm
- **Method**: POST
- **Request Body**:

```json
{
  "order_id": 1,
  "seller_id": "卖方学生卡号",
  "confirmation": true
}
```

- **Response**:

```json
{
  "message": "订单已确认付款，商品标记为已售出",
  "order_status": "completed"
}
```

### 7. 发送聊天消息（含收款码）

- **URL**: /api/messages
- **Method**: POST
- **Request Body**:

```json
{
  "sender_id": "发送者学生卡号",
  "receiver_id": "接收者学生卡号",
  "content": "消息内容或收款码图片URL",
  "type": "text" // 或 "image" 或 "payment"
}
```

- **Response**:

```json
{
  "message": "消息发送成功"
}
```

## 五. 关键代码示例

### 1. JWT认证示例

```javascript
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign({ student_id: user.student_id }, 'secret_key', { expiresIn: '1h' });
};

const verifyToken = (token) => {
  return jwt.verify(token, 'secret_key');
};
```

### 2. WebSocket实现（聊天功能）

```javascript
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    // 处理消息并广播（可以增加对 type 为 "payment" 的消息处理逻辑）
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  });
});
```

### 3. 订单支付确认接口示例

```javascript
// Express 路由：卖方在聊天中确认收款后调用此接口
app.post('/api/orders/confirm', async (req, res) => {
  const { order_id, seller_id, confirmation } = req.body;
  // 验证订单和卖方身份，确认订单状态为 pending 后进行更新
  if (confirmation) {
    // 更新订单状态为 'completed' 并更新对应商品状态为 'sold'
    // 示例伪代码：
    await Order.update({ status: 'completed' }, { where: { order_id, seller_id } });
    await Product.update({ status: 'sold' }, { where: { product_id: req.body.product_id } });
    return res.json({ message: '订单已确认付款，商品标记为已售出', order_status: 'completed' });
  }
  res.status(400).json({ message: '确认失败' });
});
```

### 4. 数据库表结构的 SQL 语句（调整后）

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
  status ENUM('available', 'sold') DEFAULT 'available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(student_id)
);

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  buyer_id VARCHAR(20) NOT NULL,
  seller_id VARCHAR(20) NOT NULL,
  status ENUM('pending', 'paid', 'completed', 'canceled') DEFAULT 'pending',
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
  type ENUM('text', 'image', 'payment') DEFAULT 'text',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(student_id),
  FOREIGN KEY (receiver_id) REFERENCES users(student_id)
);
```

## 六. 项目文件结构

```csharp
second_hand_trade
│
├── backend/                     # 后端项目目录
│   ├── config/                  # 配置文件（数据库、JWT、订单确认相关配置）
│   │   ├── config.js            # 数据库、JWT配置等
│   │   └── paymentConfig.js     # （原微信支付配置文件已废弃，可留作备份）
│   ├── controllers/             # 控制器，处理请求和业务逻辑
│   │   ├── authController.js    # 处理登录、注册等认证相关的控制器
│   │   ├── productController.js # 处理商品发布、修改、查询等
│   │   ├── orderController.js   # 包含订单创建与支付确认接口
│   │   └── messageController.js # 处理聊天及消息发送（含收款码消息）
│   ├── models/                  # 数据库模型，ORM 定义
│   │   ├── user.js              # 用户模型
│   │   ├── product.js           # 商品模型
│   │   ├── order.js             # 订单模型
│   │   └── message.js           # 聊天记录模型
│   ├── routes/                  # API 路由
│   │   ├── authRoutes.js        # 用户认证相关路由
│   │   ├── productRoutes.js     # 商品相关路由
│   │   ├── orderRoutes.js       # 包括订单创建及确认付款接口
│   │   └── messageRoutes.js     # 聊天相关路由
│   ├── services/                # 业务逻辑层
│   │   ├── jwtService.js        # 处理JWT生成与验证
│   │   ├── orderService.js      # 处理订单及支付确认逻辑
│   │   └── websocketService.js  # 处理WebSocket聊天逻辑
│   ├── utils/                   # 工具函数
│   │   └── logger.js            # 日志记录工具
│   ├── .env                     # 环境变量文件
│   ├── server.js                # 后端入口文件，启动 Express 应用
│   ├── package.json             # 后端依赖与配置
│   └── README.md                # 后端项目说明文档
│
├── frontend/                    # 前端项目目录
│   ├── public/                  # 静态文件
│   │   └── index.html           # 前端主HTML文件
│   ├── src/                     # 源代码
│   │   ├── assets/              # 静态资源（图片、字体等）
│   │   ├── components/          # 可复用的组件
│   │   │   ├── Header/Header.vue       # 头部组件
│   │   │   ├── Footer/Footer.vue       # 底部组件
│   │   │   └── ProductItem/ProductItem.vue  # 商品项组件
│   │   ├── pages/               
│   │   │   ├── Home/Home.vue         # 首页
│   │   │   ├── Login/Login.vue        # 登录页
│   │   │   ├── Register/Register.vue     # 注册页
│   │   │   ├── ProductDetail/ProductDetail.vue# 商品详情页
│   │   │   ├── Chat/Chat.vue         # 聊天页（含收款码发送与支付确认功能）
│   │   │   └── Order/Order.vue       # 订单页
│   │   ├── services/            
│   │   │   ├── authService.js   # 用户认证服务
│   │   │   ├── productService.js# 商品服务
│   │   │   ├── orderService.js    # 包含订单创建与确认付款接口调用
│   │   │   └── messageService.js# 消息服务
│   │   ├── store/               # 状态管理（Vuex）
│   │   │   └── index.js         # Vuex状态管理
│   │   ├── router/              # 路由管理
│   │   │   └── index.js         # 前端路由配置
│   │   ├── static/
│   │   ├── App.vue              # 根组件     
│   │   └── main.js   			 # 项目入口文件         
│   ├── package.json         	# 前端依赖与配置
│   ├── vue.config.js             # Vue配置文件
│   ├── index.html
│   └── README.md                # 前端项目说明文档
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

【update】

- **后端部分**: 除了原有的用户、商品、聊天等功能外，订单模块中取消了直接微信支付流程。新增订单确认接口供卖方在聊天中确认收款，从而完成订单状态更新和商品售出状态的切换。
- **前端部分**:“购物车”页面改为聊天页面，支持一对一实时沟通及发送收款码。“我的页面”增加“我卖出的商品”列表，方便卖家查看已完成交易的商品。
