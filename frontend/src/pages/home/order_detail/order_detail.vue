<template>
  <view>
    <!-- 步骤条 -->

    <!-- end -->

    <!-- 价钱 -->
    <view class="price bg-white">
      <view class="price bg-white">
        <view class="price-item">
          <view><text class="text-sl text-red text-uni" style="font-size: 60rpx; color: #ff0000">需付款：{{
            orderDetails.price }}</text></view>
        </view>
        <view class="price-item">
          <view><text class="text-red text-uni" style="font-size: 30rpx; color: #333">请截图保存付款信息</text></view>
        </view>
      </view>
    </view>
    <!-- end -->

    <!-- 分离线 -->
    <view class="line"></view>
    <!-- end -->

    <!-- 物流描述 -->

    <!-- <view class='logistics padding bg-white'>
		<view><text class='text-black'>见面交易，无需物流</text></view>
		<view><text class='text-blue text-weight' bindtap='toLogisticsDetails'>物流详情</text></view>
		</view> -->
    <!-- end -->

    <!-- 分离线 -->
    <view class="line"></view>
    <!-- end -->

    <!-- 商品描述 -->
    <view class="shoppin_detail bg-white">
      <view class="shoppin_detail_img">
        <image :src="getImageUrl(orderDetails.image)"></image>
      </view>

      <view class="shopping_detail">
        <view class="shopping_detail_title">
          <view class="shopping_detail_title_1 text-cut"><text class="text-black text-black">商品：{{
            orderDetails.product_title }}</text></view>
          <!-- <text class='text-blue text-weight'>联系买家</text> -->
        </view>

        <view class="shopping_detail-2">
          <text class="text-black">商品描述：</text>
          <view class="order-description-text">{{ orderDetails.description }}</view>
        </view>
      </view>
    </view>
    <!-- end -->

    <!-- 分离线 -->
    <view class="line"></view>
    <!-- end -->

    <!-- 显示付款码 -->
    <!-- 显示付款码 -->
    <view class="shopping bg-white">
      <view class="payment-code-container">
        <!-- 添加调试信息和mode属性 -->
        <image :src="getImageUrl(orderDetails.payment_code)" mode="aspectFit" style="width: 300rpx; height: 300rpx" />
      </view>
    </view>

    <!-- end -->

    <!-- 分离线 -->
    <view class="line"></view>
    <!-- end -->

    <!-- 确定按钮 -->
    <view class="comfirm bg-white">
      <button class="cu-btn bg-green lg" @tap="markAsReceived">我已收到商品</button>
      <button class="bg-green cu-btn margin-tb-sm comfirm_button lg" @tap="goChatSeller">
        联系卖家
      </button>
    </view>

    <!-- end -->
  </view>
</template>

<script>
export default {
  data() {
    return {
      basics: 1, // 控制步骤条状态
      product_id: null, // 用于保存获取的 product_id
      orderDetails: {}, // 用于存储订单详情数据
      // 步骤条
      basicsList: [
        { icon: "roundcheckfill", name: "已拍下" },
        { icon: "roundcheckfill", name: "已付款" },
        { icon: "roundcheckfill", name: "已收货" },
        { icon: "roundcheckfill", name: "交易成功" },
      ],
    };
  },
  onLoad(options) {
    // 获取传递过来的 product_id
    const productId = options.product_id;
    if (productId) {
      this.product_id = productId;
      console.log("Received product_id:", this.product_id);
      // 使用 product_id 请求订单详情
      this.fetchOrderDetail(this.product_id);
    } else {
      console.error("No product_id received");
    }
  },
  methods: {
    // 添加handlePurchase方法
    async markAsReceived() {
      try {
        const token = uni.getStorageSync("token");
        const { data: res } = await uni.request({
          url: "http://localhost:3000/api/orders/mark-as-received",
          method: "POST",
          header: {
            Authorization: "Bearer " + token,
          },
          data: {
            productId: this.product_id
          }
        });

        if (res.code === 200) {
          uni.showToast({
            title: "确认收货成功，去提醒卖家标记为已经出售",
            icon: "success"
          });

          // 跳转到我的购买页面
          uni.navigateTo({
            url: '/pages/my/my_buy/my_buy'
          });
        } else {
          uni.showToast({
            title: res.message || "操作失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("确认收货失败:", error);
        uni.showToast({
          title: "操作失败，请稍后重试",
          icon: "none"
        });
      }
    },
    // 请求订单详情信息
    fetchOrderDetail(productId) {
      uni.request({
        url: `http://localhost:3000/api/products/${productId}`,
        method: "GET",
        success: (res) => {
          if (res.data) {
            this.orderDetails = res.data;
            console.log("订单详情：", this.orderDetails);

            // 根据订单状态更新步骤条状态
            if (this.orderDetails.status) {
              this.basics = this.orderDetails.status;
            }

            // 请求付款码，传递 seller_id
            if (this.orderDetails.seller_id) {
              this.fetchPaymentCode(this.orderDetails.seller_id); // 将 seller_id 作为参数传递
            }
          } else {
            uni.showToast({
              title: "获取订单信息失败",
              icon: "none",
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: "网络错误，请重试",
            icon: "none",
          });
        },
      });
    },

    getConversationForOrder() {
      return new Promise((resolve, reject) => {
        const token = uni.getStorageSync("token");
        if (!token) {
          reject("用户未登录");
          return;
        }
        uni.request({
          url: "http://localhost:3000/api/conversations", // 后端GET接口，返回当前用户的所有会话
          method: "GET",
          header: {
            Authorization: `Bearer ${token}`,
          },
          success: (res) => {
            if (res.statusCode === 200 && res.data && res.data.length > 0) {
              // 假设 res.data 是数组，使用后端逻辑返回的 findByParticipants 进行筛选
              const conversation = res.data.find(
                (item) =>
                  item.seller_id == this.orderDetails.seller_id &&
                  item.product_id == this.orderDetails.product_id
              );
              if (conversation && conversation.conversation_id) {
                resolve(conversation.conversation_id);
              } else {
                reject("未找到对应会话");
              }
            } else {
              reject("获取会话失败");
            }
          },
          fail: (err) => {
            reject(err);
          },
        });
      });
    },

    // 请求付款码信息
    // 请求付款码信息
    fetchPaymentCode(sellerId) {
      uni.request({
        url: `http://localhost:3000/api/my/my_pay-noToken?seller_id=${sellerId}`,
        method: "GET",
        success: (res) => {
          if (res.data && res.data.qrCode) {
            // 移除开头的斜杠 "/"
            this.orderDetails.payment_code = res.data.qrCode.startsWith("/")
              ? res.data.qrCode.substring(1)
              : res.data.qrCode;

            console.log("付款码路径：", this.orderDetails.payment_code);
          } else {
            uni.showToast({
              title: "获取付款码失败",
              icon: "none",
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: "获取付款码失败，请重试",
            icon: "none",
          });
        },
      });
    },

    // 拼接图片完整 URL 的方法
    getImageUrl(imagePath) {
      if (!imagePath) return ""; // 防空

      // 如果已经是完整 URL，直接返回
      if (/^https?:\/\//.test(imagePath)) {
        return imagePath;
      }

      // 否则把反斜杠替换成斜杠并拼接服务器地址
      const formattedPath = imagePath.replace(/\\/g, "/");
      return `http://localhost:3000/${formattedPath}`;
    },
    goChatSeller() {
      const token = uni.getStorageSync("token");
      if (!token) {
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        setTimeout(() => {
          uni.navigateTo({
            url: "/pages/auth/login",
          });
        }, 1500);
        return;
      }
      console.log(this.orderDetails.seller_id);
      
      // 创建会话
      uni.request({
        url: "http://localhost:3000/api/conversations/create",
        method: "POST",
        data: {
          sellerId: this.orderDetails.seller_id,
          productId: this.orderDetails.product_id,
        },
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: (res) => {
          if (res.statusCode === 201) {
            // 跳转到聊天页面
            uni.navigateTo({
              url: `/pages/msg/msg_chat/msg_chat?conversation_id=${res.data.conversation_id}&user_id=${this.orderDetails.seller_id}&product_id=${this.orderDetails.product_id}`,
            });
          } else {
            uni.showToast({
              title: "创建会话失败",
              icon: "none",
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: "网络错误",
            icon: "none",
          });
        },
      });
    },
  },
};
</script>

<style>
/* 新增红色按钮样式 */
.bg-red {
  background-color: #e54d42 !important;
}

/* 调整按钮间距 */
.comfirm_button.lg {
  margin-bottom: 20rpx;
}

/* 价钱 */
.price {
  width: 100%;
  padding: 60rpx;
  height: 380rpx;
}

/* 价钱 */
.price.bg-white {
  width: 100%;
  padding: 1px;
  /* Set padding to 1px */
  background-color: #ffffff;
  /* Ensure the background is white */
  box-sizing: border-box;
  /* Ensure padding doesn't affect width */
  height: auto;
  /* Allow the height to adjust based on content */
}

/* Price item */
.price-item {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0;
  /* Remove extra padding for price item */
}

/* Text styling for the price text */
.text-sl {
  font-size: 28rpx;
  color: #ff5733;
  /* Red color for "需付款：" text */
}

/* Text styling for the payment instruction text */
.text-uni {
  font-size: 22rpx;
  color: #333;
  /* Dark color for the "请截图保存付款信息" text */
}

/* end */
/* price */

.price-explain text {
  font-size: 32rpx;
  color: gray;
  font-weight: 55;
}

.price-explain-1 {
  width: 31%;
  margin-top: 20rpx;
  display: flex;
  align-content: center;
  align-items: center;
}

.price-explain-1 text {
  font-size: 25rpx;
  font-weight: 550;
}

.price-explain-1s text {
  font-size: 25rpx;
  color: black;
  font-weight: 550;
}

.price-explain-1s {
  width: 95%;
}

.line {
  width: 100%;
  height: 4rpx;
  background: gainsboro;
}

/* end */

/* 物流信息 */
.logistics {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 170rpx;
}

/* end */

/* 商品描述 */
/* 整体商品描述容器调整 */
.shoppin_detail {
  display: flex;
  padding: 20rpx;
  min-height: 250rpx;
  /* 改为最小高度 */
  height: auto;
  /* 高度自适应 */
  align-items: flex-start;
  /* 顶部对齐 */
  overflow: visible;
  /* 允许内容显示 */
}

.shoppin_detail_img image {
  height: 130rpx;
  width: 130rpx;
}

/* 商品详情区域整体样式 */
.shopping_detail {
  margin-left: 20rpx;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  /* 防止内容溢出 */
  max-width: 70%;
  /* 控制最大宽度，给左侧图片留出足够空间 */
}

/* 商品描述区域 */
.shopping_detail-2 {
  width: 100%;
  display: flex;
  flex-direction: column;
  /* 修改为纵向排列 */
  margin-top: 10rpx;
}

/* 商品标题区域 */
.shopping_detail_title {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 15rpx;
}

.shopping_detail_title_1 {
  width: 100%;
  display: flex;
  /* 使用flex布局 */
  flex-wrap: wrap;
  /* 允许内容换行 */
}


title-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  white-space: nowrap;
  /* 标签不换行 */
}

.title-content {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  /* 让内容占据剩余空间 */
  word-break: break-word;
  /* 允许在任何字符间换行 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  /* 最多显示2行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* end */

/* 交易信息 */
.shopping {
  padding: 30rpx;
  min-height: 400rpx;
  /* 确保最小高度足够 */
  position: relative;
  /* 防止子元素溢出 */
  overflow: visible;
  /* 允许内容显示 */
}

.shopping_desc {
  display: flex;
  justify-content: space-between;
}

.shopping text {
  font-size: 28rpx;
}

.margin-bottom-xs-15 {
  margin-bottom: 15rpx;
}

/* end */

/* 确定 */
.comfirm {
  width: 100%;
  height: 150rpx;
  padding: 20rpx;
}

.comfirm_button {
  width: 100%;
}

/* end */

/* 付款码图片容器 */

/* 付款码图片样式 */
.payment-code-container {
  display: flex;
  flex-direction: column;
  /* 垂直排列调试信息和图片 */
  justify-content: center;
  align-items: center;
  padding: 20rpx;
  height: auto;
  /* 高度自适应 */
  min-height: 300rpx;
  /* 设置最小高度 */
  background: #ffffff;
  /* 白色背景 */
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  /* 可选：添加阴影增强可视性 */
}


.order-description-text {
  font-size: 28rpx;
  color: #333;
  line-height: 1.6;
  word-wrap: break-word;
  white-space: pre-wrap;
  text-align: justify;
  width: 100%;
  max-height: 200rpx;
  /* 限制最大高度 */
  overflow-y: auto;
  /* 超出高度时可滚动 */
}


.desc-label {
  font-size: 28rpx;
  color: #333;
  font-weight: bold;
  margin-bottom: 8rpx;
  /* 添加底部间距 */
}
</style>
