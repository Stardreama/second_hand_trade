# 校园二手交易平台前端项目说明文档

[toc]

## 项目介绍

这是基于 Uniapp（Vue.js）开发的校园二手交易平台微信小程序前端部分。该系统允许用户注册登录、发布商品、修改商品信息、搜索商品、实时聊天以及进行交易确认。

## 技术栈

- **前端框架**: Uniapp（Vue 3）
- **UI 组件**: ColorUI
- **状态管理**: Vuex
- **跨端支持**: 微信小程序、H5 等多端适配

## 环境要求

- Node.js 14.0+
- 微信开发者工具（微信小程序预览）

## 安装教程

### 安装依赖

```bash
cd frontend
npm install

```

### 运行项目

```bash
# 运行到H5
npm run dev:h5

```

### 项目打包

```bash
# 打包H5版本
npm run build:h5

# 打包微信小程序版本
npm run build:mp-weixin

# 更多参考package.json文件
```

### 文件结构

```bash
frontend                      # 前端项目根目录
├── README.md                 # 项目说明文档
├── index.html                # H5入口文件
├── package-lock.json         # 依赖版本锁定文件
├── package.json              # 项目配置和依赖管理         # Vite构建工具配置文件
├── src                       # 源代码目录
│   ├── App.vue               # 应用根组件
│   ├── main.js               # 应用入口文件
│   ├── manifest.json         # 应用配置文件(平台配置、权限等)
│   ├── pages.json            # 页面路由配置文件
│   ├── uni.scss              # 全局样式变量定义
│   ├── colorui               # ColorUI组件库目录
│   │   ├── animation.css     # 动画样式
│   │   ├── icon.css          # 图标样式
│   │   ├── main.css          # 主样式文件
│   │   └── components        # ColorUI组件
│   │       └── cu-custom.vue # 自定义导航栏组件
│   ├── common                # 公共工具和数据
│   │   └── allSchool.js      # 学校数据列表
│   ├── pages                 # 页面文件目录
│   │   ├── auth              # 认证相关页面
│   │   │   ├── login.vue     # 登录页面
│   │   │   └── register.vue  # 注册页面
│   │   ├── component         # 公共组件目录
│   │   │   ├── bar.vue       # 导航条组件
│   │   │   ├── foldSwiper.vue # 折叠轮播图组件
│   │   │   ├── minSwiper.vue # 小型轮播图组件
│   │   │   └── topTab.vue    # 顶部选项卡组件
│   │   ├── disconver         # 发现页相关
│   │   │   ├── disconver.vue # 发现主页
│   │   │   ├── discover_desc # 评论详情
│   │   │   │   └── discover_desc.vue
│   │   │   └── discover_desc_more # 更多评论
│   │   │       └── discover_desc_more.vue
│   │   ├── home              # 首页相关
│   │   │   ├── home.vue      # 首页
│   │   │   ├── confirm_order # 确认订单
│   │   │   │   └── confirm_order.vue
│   │   │   ├── home_detail   # 商品详情
│   │   │   │   └── home_detail.vue
│   │   │   ├── order_detail  # 订单详情
│   │   │   │   └── order_detail.vue
│   │   │   └── img           # 首页使用的图片资源
│   │   │       └── tiao.png
│   │   ├── issue             # 发布商品相关
│   │   │   ├── issue.vue     # 发布商品页面
│   │   │   └── issue_edit    # 编辑商品信息
│   │   │       └── issue_edit.vue
│   │   ├── msg               # 消息相关
│   │   │   ├── msg.vue       # 消息列表页
│   │   │   └── msg_chat      # 聊天对话页
│   │   │       └── msg_chat.vue
│   │   └── my                # 个人中心相关
│   │       ├── my.vue        # 个人中心主页
│   │       ├── my_address    # 收货地址管理
│   │       │   ├── address_edit.vue # 地址编辑页
│   │       │   └── my_address.vue   # 地址列表页
│   │       ├── my_buy        # 我买到的商品
│   │       │   └── my_buy.vue
│   │       ├── my_collect    # 我的收藏
│   │       │   └── my_collect.vue
│   │       ├── my_detail     # 个人详情页
│   │       │   └── my_detail.vue
│   │       ├── my_feedback   # 意见反馈
│   │       │   └── my_feedback.vue
│   │       ├── my_issue      # 我发布的商品
│   │       │   └── my_issue.vue
│   │       └── my_sale       # 我卖出的商品
│   │           └── my_sale.vue
│   └── static                # 静态资源目录
│       ├── logo.png          # 应用logo
│       └── img               # 图片资源目录
│           ├── 1.jpg         # 示例图片1
│           ├── 2.jpg         # 示例图片2
│           ├── 3.jpg         # 示例图片3
│           ├── avatar.jpg    # 默认头像
│           ├── back.gif      # 返回按钮动画
│           ├── boutton.png   # 按钮图标
│           ├── deatil.jpg    # 详情页图片
│           ├── e1.png        # 发布图标(未选中)
│           ├── e2.png        # 发布图标(选中)
│           ├── f1.png        # 发现图标(未选中)
│           ├── f2.png        # 发现图标(选中)
│           ├── h1.png        # 首页图标(未选中)
│           ├── h2.png        # 首页图标(选中)
│           ├── hot_evaluate.png  # 热评图标
│           ├── hot_evaluate1.png # 热评图标替代版
│           ├── l.png         # 消息图标(未选中)
│           ├── login-logo.png # 登录页logo
│           ├── m1.png        # 我的图标(未选中)
│           ├── m2.png        # 消息图标(选中)
│           ├── qiu.jpeg      # 球类图片
│           ├── shoop_heart.jpeg # 收藏心形图标
│           ├── top.png       # 顶部图标
│           ├── top_top.png   # 回到顶部图标
│           └── w2.png        # 我的图标(选中)
└── vite.config.js
```
