# 校园二手交易平台后端开发文档

## 后端技术栈

- **运行时环境:** Node.js
- **数据库:** MySQL
- **核心依赖库:** Express, MySQL2, JWT, Multer，websocket

## 数据库配置

- **数据库名称:** second_hand_trade
- **数据库用户名:** root
- **数据库密码:** admin123
- **数据库端口:** 5000

### 数据库创建语句

```sql
CREATE DATABASE second_hand_trade;

USE second_hand_trade;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `addresses`;
CREATE TABLE `addresses`  (
  `address_id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `phone` varchar(15) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `province` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `city` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `district` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `is_default` tinyint(1) NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`address_id`) USING BTREE,
  INDEX `user_id`(`user_id` ASC) USING BTREE,
  CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`student_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations`  (
  `conversation_id` int NOT NULL AUTO_INCREMENT,
  `buyer_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `seller_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `product_id` int NULL DEFAULT NULL,
  `latest_message` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `latest_message_time` datetime NULL DEFAULT NULL,
  `unread_buyer` int NULL DEFAULT 0,
  `unread_seller` int NULL DEFAULT 0,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`conversation_id`) USING BTREE,
  UNIQUE INDEX `unique_conversation`(`buyer_id` ASC, `seller_id` ASC, `product_id` ASC) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS `feedback`;
CREATE TABLE `feedback`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `issue_type` int NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `images` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `contact` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS `follows`;
CREATE TABLE `follows`  (
  `follower_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `followee_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`follower_id`, `followee_id`) USING BTREE,
  INDEX `fk_followee`(`followee_id` ASC) USING BTREE,
  CONSTRAINT `fk_followee` FOREIGN KEY (`followee_id`) REFERENCES `users` (`student_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_follower` FOREIGN KEY (`follower_id`) REFERENCES `users` (`student_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;


DROP TABLE IF EXISTS `likes`;
CREATE TABLE `likes`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `product_id` int NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `unique_like`(`user_id` ASC, `product_id` ASC) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`student_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 17 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages`  (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `conversation_id` int NOT NULL,
  `sender_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `receiver_id` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `is_read` tinyint(1) NULL DEFAULT 0,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`message_id`) USING BTREE,
  INDEX `conversation_id`(`conversation_id` ASC) USING BTREE,
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS `orders`;
CREATE TABLE `orders`  (
  `order_id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `buyer_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `seller_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` enum('pending','completed','canceled','paid') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT 'pending',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`order_id`) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  INDEX `buyer_id`(`buyer_id` ASC) USING BTREE,
  INDEX `seller_id`(`seller_id` ASC) USING BTREE,
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`seller_id`) REFERENCES `users` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

DROP TABLE IF EXISTS `product_images`;
CREATE TABLE `product_images`  (
  `id` int NOT NULL AUTO_INCREMENT,
  `product_id` int NOT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_default` tinyint(1) NULL DEFAULT 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `product_id`(`product_id` ASC) USING BTREE,
  CONSTRAINT `product_images_fk` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `seller_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `original_price` decimal(10, 2) NOT NULL DEFAULT 0.00 COMMENT '原价',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `product_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `product_status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '交易方式，如 自提|邮寄',
  `product_class` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `product_type` enum('sell','buy') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'sell',
  `like_amount` int NULL DEFAULT 0,
  `is_off_shelf` tinyint(1) NOT NULL DEFAULT 0 COMMENT '是否下架：0-正常 1-已下架',
  PRIMARY KEY (`product_id`) USING BTREE,
  INDEX `seller_id`(`seller_id` ASC) USING BTREE,
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 2 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `student_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `student_card` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `QRCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;
```

## 环境配置

### 1. 配置文件（.env）

```markdown
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=admin123
DB_DATABASE=second_hand_trade
BAIDU_OCR_AK="DoeM6YLmqZDOB9FTVOC6NsQE"
BAIDU_OCR_SK="Ut9q9bvTw0LauqQMbc30PY0NJlx37FXb"
```

### 2. 运行项目

```bash
cd backend
npm install
node server.js
```

## API 文档

### 用户认证

#### 用户注册

- **URL:** /api/register
- **Method:** POST
- **Content-Type:** multipart/form-data (包含文件上传)

**Request Body:**

- student_id: string &nbsp;&nbsp;// 学生 ID
- username: string &nbsp;&nbsp;// 用户名
- password: string &nbsp;&nbsp;// 密码
- student_card: File &nbsp;&nbsp;// 学生证照片

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "message": "注册成功"
}
```

**Error Response:**

- **Code:** 400 Bad Request
- **Content:**

```json
{
  "message": "该学生ID已被注册"
}
```

#### 用户登录

- **URL:** /api/login
- **Method:** POST

**Request Body:**

```json
{
  "student_id": "string",
  "password": "string"
}
```

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "token": "string",
  "user": {
    "student_id": "string",
    "username": "string",
    "avatar": "string"
  }
}
```

#### 更新用户头像

- **URL:** /api/user/update-avatar
- **Method:** POST
- **Headers:** Authorization: Bearer token
- **Content-Type:** multipart/form-data

**Request Body:**

- avatar: File &nbsp;&nbsp;// 头像图片

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "message": "头像更新成功",
  "avatarUrl": "http://localhost:3000/uploads/avatars/image.jpg"
}
```

#### 获取用户信息

- **URL:** /api/user/profile
- **Method:** GET
- **Headers:** Authorization: Bearer token

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "user": {
    "student_id": "string",
    "username": "string",
    "avatar": "string"
  }
}
```

### 商品相关

#### 发布商品(带图片)

- **URL:** /api/products/create
- **Method:** POST
- **Headers:** Authorization: Bearer token
- **Content-Type:** multipart/form-data

**Request Body:**

- title: string &nbsp;&nbsp;// 商品标题
- description: string &nbsp;&nbsp;// 商品描述
- price: string &nbsp;&nbsp;// 商品价格
- product_status: string &nbsp;&nbsp;// 商品状态 (全新/二手)
- product_class: string &nbsp;&nbsp;// 商品分类
- product_type: string &nbsp;&nbsp;// 商品类型 (sell/buy)
- image: File &nbsp;&nbsp;// 商品图片

**Success Response:**

- **Code:** 201 Created
- **Content:**

```json
{
  "message": "商品发布成功",
  "product_id": 1
}
```

#### 发布求购信息(无图片)

- **URL:** /api/products/create-no-image
- **Method:** POST
- **Headers:** Authorization: Bearer token

**Request Body:**

```json
{
  "title": "string", // 求购标题
  "description": "string", // 求购描述
  "price": "0", // 期望价格 (可选)
  "product_class": "string", // 商品分类
  "product_type": "buy" // 固定为 buy
}
```

**Success Response:**

- **Code:** 201 Created
- **Content:**

```json
{
  "message": "求购信息发布成功",
  "product_id": 1
}
```

#### 为商品添加更多图片

- **URL:** /api/products/addImage
- **Method:** POST
- **Headers:** Authorization: Bearer token
- **Content-Type:** multipart/form-data

**Request Body:**

- product_id: string &nbsp;&nbsp;// 商品 ID
- image: File &nbsp;&nbsp;// 图片文件

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
{
  "message": "图片上传成功"
}
```

#### 搜索商品

- **URL:** /api/products/search
- **Method:** GET

**Query Parameters:**

- keyword: string &nbsp;&nbsp;// 搜索关键词

**Success Response:**

- **Code:** 200 OK
- **Content:**

```json
[
  {
    "product_id": 1,
    "product_title": "iPhone 13",
    "price": "4999.00",
    "description": "几乎全新的iPhone 13",
    "image": "uploads/productImages/image.jpg",
    "product_status": "全新",
    "product_class": "数码产品",
    "product_type": "sell"
  }
]
```

#### 获取所有商品

- **URL:** /api/products/all
- **Method:** GET

**Success Response:**

- **Code:** 200 OK
- **Content:** 商品数组 (格式同上)

### 订单相关

#### 创建订单

- **URL:** /api/orders/create
- **Method:** POST
- **Headers:** Authorization: Bearer token

**Request Body:**

```json
{
  "product_id": 1
}
```

**Success Response:**

- **Code:** 201 Created
- **Content:**

```json
{
  "order_id": 1,
  "message": "订单创建成功"
}
```

#### 获取用户订单

- **URL:** /api/orders/user
- **Method:** GET
- **Headers:** Authorization: Bearer token

**Success Response:**

- **Code:** 200 OK
- **Content:** 订单数组
