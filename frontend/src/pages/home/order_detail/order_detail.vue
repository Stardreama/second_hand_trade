<template>
  <view>
    <!-- 步骤条 -->

    <!-- end -->


    <!-- 价钱 -->
    <view class='price bg-white'>

      <view class='price bg-white'>
        <view class='price-item'>
          <view><text class='text-sl text-red text-uni' style="font-size: 60rpx; color: #ff0000;">需付款：{{
            orderDetails.price }}</text></view>
        </view>
        <view class='price-item'>
          <view><text class='text-red text-uni' style="font-size: 30rpx; color: #333;">请截图保存付款信息</text></view>
        </view>
      </view>

    </view>
    <!-- end -->

    <!-- 分离线 -->
    <view class='line'></view>
    <!-- end -->

    <!-- 物流描述 -->

    <!-- <view class='logistics padding bg-white'>
		<view><text class='text-black'>见面交易，无需物流</text></view>
		<view><text class='text-blue text-weight' bindtap='toLogisticsDetails'>物流详情</text></view>
		</view> -->
    <!-- end -->


    <!-- 分离线 -->
    <view class='line'></view>
    <!-- end -->


    <!-- 商品描述 -->
    <view class='shoppin_detail bg-white'>
      <view class='shoppin_detail_img'>
        <image :src="getImageUrl(orderDetails.image)"></image>
      </view>


      <view class='shopping_detail '>
        <view class='shopping_detail_title'>
          <view class='shopping_detail_title_1 text-cut'><text class='text-black text-black'>商品：{{
            orderDetails.product_title }}</text></view>
          <!-- <text class='text-blue text-weight'>联系买家</text> -->
        </view>

        <view class='shopping_detail-2'><text class='text-black'>商品描述：{{ orderDetails.description }}</text></view>

      </view>
    </view>
    <!-- end -->

    <!-- 分离线 -->
    <view class='line'></view>
    <!-- end -->

    <!-- 显示付款码 -->
    <view class='shopping bg-white'>
      <view class="payment-code-container">
        <image :src="getImageUrl(orderDetails.payment_code)" alt="付款码" class="payment-code-image" />
      </view>
    </view>

    <!-- end -->

    <!-- 分离线 -->
    <view class='line'></view>
    <!-- end -->


    <!-- 确定按钮 -->
    <view class='comfirm bg-white'>
      <button class='bg-green cu-btn margin-tb-sm comfirm_button lg' @tap="goChatSeller">联系卖家</button>
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
        { icon: 'roundcheckfill', name: '已拍下' },
        { icon: 'roundcheckfill', name: '已付款' },
        { icon: 'roundcheckfill', name: '已收货' },
        { icon: 'roundcheckfill', name: '交易成功' }
      ]
    };
  },
  onLoad(options) {
    // 获取传递过来的 product_id
    const productId = options.product_id;
    if (productId) {
      this.product_id = productId;
      console.log('Received product_id:', this.product_id);
      // 使用 product_id 请求订单详情
      this.fetchOrderDetail(this.product_id);
    } else {
      console.error('No product_id received');
    }
  },
  methods: {
    // 请求订单详情信息
    fetchOrderDetail(productId) {
      uni.request({
        url: `http://localhost:3000/api/products/${productId}`,
        method: 'GET',
        success: (res) => {
          if (res.data) {
            this.orderDetails = res.data;
            console.log('订单详情：', this.orderDetails);

            // 根据订单状态更新步骤条状态
            if (this.orderDetails.status) {
              this.basics = this.orderDetails.status;
            }

            // 请求付款码，传递 seller_id
            if (this.orderDetails.seller_id) {
              this.fetchPaymentCode(this.orderDetails.seller_id);  // 将 seller_id 作为参数传递
            }
          } else {
            uni.showToast({
              title: '获取订单信息失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: '网络错误，请重试',
            icon: 'none'
          });
        }
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
          // 可选：如果后端支持传参过滤，也可以传入seller_id和product_id
          // data: {
          //   seller_id: this.orderDetails.seller_id,
          //   product_id: this.orderDetails.product_id,
          // },
          success: (res) => {
            if (res.statusCode === 200 && res.data && res.data.length > 0) {
              // 假设 res.data 是数组，使用后端逻辑返回的 findByParticipants 进行筛选
              const conversation = res.data.find(item =>
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
          }
        });
      });
    },

    // 请求付款码信息
    fetchPaymentCode(sellerId) {
      console.log("寻找付款码")
      uni.request({
        url: `http://localhost:3000/api/payment-code?seller_id=${sellerId}`,  // 根据 seller_id 获取付款码
        method: 'GET',
        success: (res) => {
          if (res.data && res.data.payment_code) {
            this.orderDetails.payment_code = res.data.payment_code; // 将付款码 URL 保存到 orderDetails 中
            console.log('付款码：', this.orderDetails.payment_code);
          } else {
            uni.showToast({
              title: '获取付款码失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: '获取付款码失败，请重试',
            icon: 'none'
          });
        }
      });
    },


    // 拼接图片完整 URL 的方法
    getImageUrl(imagePath) {
      if (!imagePath) return ""; // 防空处理
      if (/^https?:\/\//.test(imagePath)) {
        return imagePath;
      }
      const formattedPath = imagePath.replace(/\\/g, "/");
      return `http://localhost:3000/${formattedPath}`;
    },
    // 跳转到联系卖家聊天页面
    goChatSeller() {
      console.log("跳转到联系卖家页面");
      this.getConversationForOrder().then((conversationId) => {
        uni.navigateTo({
          url: `/pages/msg/msg_chat/msg_chat?conversation_id=${conversationId}&user_id=${this.orderDetails.seller_id}&product_id=${this.orderDetails.product_id || ""}&otherUserName=${this.orderDetails.seller_name}`,
        });
      }).catch((error) => {
        console.error("会话获取失败:", error);
        uni.showToast({
          title: '无法获取会话，请稍后再试',
          icon: 'none'
        });
      });
    }


  }
};
</script>




<style>
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
.shoppin_detail {
  display: flex;
  padding: 20rpx;
  height: 250rpx;
  align-items: center;
}

.shoppin_detail_img image {
  height: 130rpx;
  width: 130rpx;
}

.shopping_detail {
  margin-left: 20rpx;
  width: 100%;
}

.shopping_detail-2 {
  margin-top: 20rpx;
}

.shopping_detail_title {
  display: flex;
  justify-content: space-between;
  width: 95%;
}

.shopping_detail_title_1 {
  width: 75%;
}

/* end */

/* 交易信息 */
.shopping {
  padding: 30rpx;
  height: 235rpx;
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
.payment-code-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20rpx;
}

/* 付款码图片样式 */
.payment-code-image {
  width: 80%;
  max-width: 300rpx;
  /* 设置最大宽度 */
  height: auto;
  border-radius: 10rpx;
}
</style>
