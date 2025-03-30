<template>
  <view>
    <!-- 商品详情展示区域 -->
    <view class="pg">
      <view class="container bg-white">
        <view class="container-top">
          <!-- 使用 getImageUrl 方法处理图片路径 -->
          <image :src="getImageUrl(product.image)" alt="商品封面"></image>
        </view>
        <view class="container-top_rigth">
          <view class="container-top_rigth_1">
            <!-- 商品名称动态显示 -->
            <text>{{ product.product_title }}</text>
          </view>
          <view class="container-top_rigth_2">
            <view class="container-top_rigth_2_1">
              <text class="text-price text-red text-xl">{{ product.price }}</text>
            </view>
            <view class="container-top_rigth_2_2">
              <text class="text-price">{{ product.original_price }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 收货地址部分保持原样 -->
      <view class="container-address bg-white">
        <view class="container-address-1">
          <text>收货地址</text>
        </view>
        <view class="container-address-2">
          <view class="container-address-2_1">
            <text>董先生</text>
            <text>185****1336</text>
          </view>
          <view class="container-address-2_2">
            <text>贵州省毕节市七星关区*****学院</text>
          </view>
        </view>
        <view class="container-address-3">
          <text class="cuIcon-right lg text-gray"></text>
        </view>
      </view>

      <!-- 运费部分，目前注释掉（保留代码） -->
      <!--
      <view class="freight bg-white">
        <view class="line-freight"></view>
        <view class="freight-price">
          <view class="freight-price-1">运费</view>
          <view>
            <text class="text-price text-red freight-price-1">0.0</text>
          </view>
        </view>
      </view>
      -->
    </view>

    <!-- 底部操作栏 -->
    <view class="foot bg-white">
      <view class="foot-1">
        <text class="foot-1_1">实付款:</text>
        <text class="text-price text-red foot-1_2">{{ product.price }}</text>
      </view>
      <view class="foot-2" @tap="confirmOrder">
        <text>确定</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      product: {} // 用于存储商品详情数据
    };
  },
  onLoad(options) {
    // 从路由参数中获取 product_id
    const productId = options.product_id;
    if (productId) {
      this.fetchProductDetail(productId);
    }
  },
  methods: {
    fetchProductDetail(productId) {
      uni.request({
        url: `http://localhost:3000/api/products/${productId}`,
        method: 'GET',
        success: (res) => {
          if (res.data) {
            this.product = res.data;
            console.log(this.product.image);
          } else {
            uni.showToast({
              title: '获取商品信息失败',
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
    confirmOrder() {
      // 此处保留原有确认订单逻辑：跳转到订单详情页面或调用支付接口
      uni.navigateTo({
        url: '/pages/home/order_detail/order_detail'
      });
    },
    // 拼接图片完整 URL 的方法
    getImageUrl(imagePath) {
      if (!imagePath) return ""; // 防空处理

      // 如果已经是完整 URL，直接返回
      if (/^https?:\/\//.test(imagePath)) {
        return imagePath;
      }

      // 否则将反斜杠替换成斜杠，并拼接服务器地址
      const formattedPath = imagePath.replace(/\\/g, "/");
      return `http://localhost:3000/${formattedPath}`;
    }
  }
};
</script>

<style>
/* 样式保持原样，确保界面展示效果 */
.pg {
  padding: 20rpx;
}

.container {
  padding: 20rpx;
  height: 280rpx;
  width: 100%;
  display: flex;
}

.container-top image {
  height: 240rpx;
  width: 230rpx;
}

.container-top_rigth {
  margin-left: 20rpx;
}

.container-top_rigth_2 {
  display: flex;
  align-items: center;
  margin-top: 110rpx;
}

.container-top_rigth_2_2 text {
  margin-left: 20rpx;
  text-decoration: line-through;
  padding-left: 5rpx;
  padding-right: 5rpx;
}

.container-top_rigth_1 text {
  font-size: 30rpx;
  font-weight: 550;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.container-address {
  height: 200rpx;
  width: 100%;
  margin-top: 30rpx;
  padding: 20rpx;
  display: flex;
  align-items: center;
}

.container-address-1 {
  width: 20%;
}

.container-address-1 text {
  font-weight: 600;
}

.container-address-2 {
  width: 55%;
  margin-right: 20rpx;
  margin-left: 100rpx;
}

.container-address-2_1 {
  direction: rtl;
  margin-bottom: 10rpx;
}

.container-address-2_1 text {
  font-weight: 550;
}

.container-address-2_2 {
  direction: rtl;
}

.container-address-2_2 text {
  font-size: 25rpx;
  font-weight: 550;
}

.freight {
  height: 100rpx;
  width: 100%;
  padding: 20rpx;
}

.line-freight {
  width: 100%;
  height: 2rpx;
  background: gainsboro;
}

.freight-price {
  display: flex;
  justify-content: space-between;
  margin-top: 25rpx;
}

.freight-price-1 {
  font-weight: 600;
}

.foot {
  position: fixed;
  bottom: 0;
  display: flex;
  width: 100%;
  height: 100rpx;
}

.foot-1 {
  width: 70%;
  display: flex;
  align-items: center;
  padding-left: 20rpx;
}

.foot-2 {
  background: red;
  width: 30%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.foot-2 text {
  color: white;
}

.foot-1_1 {
  font-weight: 600;
  color: black;
}

.foot-1_2 {
  padding-left: 10rpx;
  font-weight: 550;
}
</style>
