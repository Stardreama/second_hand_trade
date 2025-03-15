[toc]
# 校园二手交易平台后端开发文档

## 后端技术栈

- **运行时环境**: Node.js
- **数据库**: MySQL
- **核心依赖库**: Express, MySQL2, JWT, WebSocket

## 数据库配置

- **数据库名称**: second_hand_trade
- **数据库用户名**: root
- **数据库密码**: admin123
- **数据库端口**: 5000

```sql
-- 数据库创建语句
CREATE DATABASE second_hand_trade;

USE second_hand_trade;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

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

DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `product_id` int NOT NULL AUTO_INCREMENT,
  `seller_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `price` decimal(10, 2) NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `image` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `product_title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `product_status` int NOT NULL,
  `product_class` int NOT NULL,
  PRIMARY KEY (`product_id`) USING BTREE,
  INDEX `seller_id`(`seller_id` ASC) USING BTREE,
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`student_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users`  (
  `student_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `student_card` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `avatar` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = DYNAMIC;

SET FOREIGN_KEY_CHECKS = 1;

```

## 环境配置

### 1.配置文件（.env）
```
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=your_password
  DB_DATABASE=second_hand_trade
```

### 2.运行项目

```
cd backend
npm install
node server.js
```

## API文档


### 用户认证

#### 用户注册

- **URL**: `/api/register`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "student_id": "string", // 学生ID
    "username": "string",   // 用户名
    "password": "string",   // 密码
    "student_card": "string" // 学生证信息
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "message": "注册成功"
    }
    ```
- **Error Response**:
  - **Code**: `400 Bad Request`
  - **Content**:
    ```json
    {
      "message": "该学生ID已被注册"
    }
    ```
  - **Code**: `500 Internal Server Error`
  - **Content**:
    ```json
    {
      "message": "数据库错误" 或 "密码加密失败"
    }
    ```

####  用户登录

- **URL**: `/api/login`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "student_id": "string", // 学生ID
    "password": "string"    // 密码
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "token": "string" // JWT Token
    }
    ```
- **Error Response**:
  - **Code**: `404 Not Found`
  - **Content**:
    ```json
    {
      "message": "用户不存在"
    }
    ```
  - **Code**: `401 Unauthorized`
  - **Content**:
    ```json
    {
      "message": "密码错误"
    }
    ```

#### JWT 认证保护的路由

- **URL**: `/api/protected`
- **Method**: `GET`
- **Headers**:
  - `Authorization: Bearer <JWT Token>`
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "message": "你已经成功通过JWT认证！"
    }
    ```
- **Error Response**:
  - **Code**: `401 Unauthorized`
  - **Content**:
    ```json
    {
      "message": "没有提供JWT"
    }
    ```
  - **Code**: `403 Forbidden`
  - **Content**:
    ```json
    {
      "message": "无效的JWT"
    }
    ```

### 商品相关

#### 发布商品

**请求方法**：`POST`

**请求路径**：`/api/products/create`

**请求参数**：
- `price`（必需）：商品价格。
- `description`（必需）：商品描述。
- `image`（必需）：商品图片的 URL。

**返回值**：
- 成功时返回状态码 `201`，返回值示例：
  ```json
  {
    "message": "商品发布成功",
    "product_id": 1
  }
  ```
- 如果缺少必要的商品信息，返回状态码 `400`，返回值示例：
  ```json
  {
    "message": "缺少必要的商品信息"
  }
  ```
- 如果数据库操作失败，返回状态码 `500`，返回值示例：
  ```json
  {
    "message": "数据库错误"
  }
  ```

#### 搜索商品

**请求方法**：`GET`

**请求路径**：`/api/products/search`

**请求参数**：
- `keyword`（必需）：搜索关键词。

**返回值**：
- 成功时返回状态码 `200`，返回值示例：
  ```json
  [
    {
      "product_id": 1,
      "price": 100,
      "description": "商品描述",
      "image": "https://example.com/image.jpg"
    }
  ]
  ```
- 如果缺少搜索关键词，返回状态码 `400`，返回值示例：
  ```json
  {
    "message": "缺少搜索关键词"
  }
  ```
- 如果数据库操作失败，返回状态码 `500`，返回值示例：
  ```json
  {
    "message": "数据库错误"
  }
  ```

### 订单相关

#### 创建订单并获取支付信息

**请求方法**：`POST`

**请求路径**：`/api/orders/create`

**请求参数**：
- `product_id`（必需）：商品的 ID。
- `buyer_id`（必需）：买家的 ID。

**返回值**：
- **成功时**：
  - 返回状态码 `201`。
  - 返回值示例：
    ```json
    {
      "order_id": "123456789",
      "payment_params": {
        "prepay_id": "wx123456789",
        "nonce_str": "random_string",
        "time_stamp": "1678456789",
        "sign": "signature_string",
        "package": "Sign=WXPay"
      }
    }
    ```
    其中，`payment_params` 是微信支付所需的参数。

- **商品未找到时**：
  - 返回状态码 `404`。
  - 返回值示例：
    ```json
    {
      "message": "Product not found"
    }
    ```

- **服务器错误时**：
  - 返回状态码 `500`。
  - 返回值示例：
    ```json
    {
      "message": "Server error"
    }
    ```
