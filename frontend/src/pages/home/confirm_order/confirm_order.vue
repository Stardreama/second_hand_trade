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

      <!-- 收货地址部分，动态加载默认地址 -->
      <view class="container-address bg-white" v-if="address">
        <view class="container-address-1">
          <text>收货地址</text>
        </view>
        <view class="container-address-2">
          <view class="container-address-2_1">
            <text>{{ address.name }}</text>
            <text>{{ address.phone }}</text>
          </view>
          <view class="container-address-2_2">
            <text>
              {{ address.province }} {{ address.city }} {{ address.district }} {{ address.address }}
            </text>
          </view>
        </view>
        <view class="container-address-3">
          <text class="cuIcon-right lg text-gray"></text>
        </view>
      </view>
      <!-- 地址数据加载中显示提示 -->
      <view class="container-address bg-white" v-else>
        <view class="container-address-1">
          <text>收货地址</text>
        </view>
        <view class="container-address-2">
          <view class="container-address-2_1">
            <text>加载中...</text>
          </view>
        </view>
        <view class="container-address-3">
          <text class="cuIcon-right lg text-gray"></text>
        </view>
      </view>
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
      product: {},    // 用于存储商品详情数据
      address: null,  // 用于存储默认收货地址数据
      userId: null    // 从 token 中解析获取 user_id
    };
  },
  onLoad(options) {
    // 从 token 中解析获取 user_id
    const token = uni.getStorageSync('token');
    if (token) {
      try {
        // 解析 token 的 payload，假设 token 格式为 header.payload.signature
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', payload);
        this.userId = payload.student_id;  // 注意字段名称与后端保持一致
      } catch (e) {
        console.error('Token解析失败：', e);
      }
    } else {
      console.error('未找到token');
    }

    // 加载商品详情
    const productId = options.product_id;
    if (productId) {
      this.fetchProductDetail(productId);
    }
    // 加载默认收货地址，传递 user_id 给后端
    this.fetchDefaultAddress();
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
    fetchDefaultAddress() {
      // 获取 token 保证 header 中有正确的认证信息
      const token = uni.getStorageSync('token');
      console.log("userId:",this.userId);
      uni.request({
        // url: 'http://localhost:3000/api/address',
        url: `http://localhost:3000/api/address?user_id=${this.userId}`,
        method: 'GET',
        data: {
          user_id: this.userId  // 将 userId 作为参数传递给后端
        },
        header: {
          Authorization: `Bearer ${token}`
        },
        success: (res) => {
          console.log(res);
          if (res.data && res.data.data && res.data.data.length > 0) {
            // 后端返回的地址按照默认地址排序，第一个即为默认地址
            this.address = res.data.data[0];
          } else {
            uni.showToast({
              title: '地址信息为空',
              icon: 'none'
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: '获取地址失败',
            icon: 'none'
          });
        }
      });
    },
    confirmOrder() {
      uni.navigateTo({
        url: '/pages/home/order_detail/order_detail'
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
