<template>
  <!-- <view> -->
    <view v-if="productDetail" class="page-wrapper" :class="{'off-shelf-container': productDetail.is_off_shelf === 1}">
    <!-- 下架遮罩层 -->
    <view class="off-shelf-mask" v-if="productDetail.is_off_shelf === 1">
      <view class="off-shelf-text">已下架</view>
    </view>
    <!-- 仅在数据加载后渲染 -->
    <!-- 商家信息 -->

    <view class="bg-white">
      <view class="cf padding-sm">
        <view class="radius fl padding-sm">
          <image :src="getImageUrl(productDetail.seller_avatar) ||
            '../../../static/img/avatar.jpg'
            "></image>
          <view class="fr padding-name">
            <!-- <view>Amibition</view> -->
            <view>{{ productDetail.seller_name }}</view>
          </view>
        </view>
      </view>
    </view>

    <!-- 商家信息end -->

    <!-- 商品内容 -->
    <view class="contanier bg-white padding-sm top-20">
      <view class="price">
        <text class="price-size" v-if="productDetail.product_type !== 'buy'">￥{{ productDetail.price }}</text>
        <text class="price-ori" v-if="productDetail.product_type !== 'buy'">￥{{ productDetail.original_price }}</text>
        <view class="cu-tag">{{ productDetail.product_status }}</view>
        <view class="cu-tag">{{ productDetail.status }}</view>
      </view>

      <view class="bg-white top-20 font-size">
        <text>{{ productDetail.description }}</text>
      </view>

      <!-- 交易方式 -->
      <view class="hint">
      </view>
      <!-- end -->
      <!-- 图片位置 -->
<block v-for="(item, index) in images" :key="index">
  <image 
    class="img" 
    :src="getImageUrl(item)" 
    mode="widthFix"
    @tap="previewImage(index)"></image>
</block>
      <view class="browse">
        <view>
          <text></text>
        </view>
      </view>
    </view>
    <!-- 商品内容end -->

    <!-- 相识商品 -->
    <view class="bg-white top-20"> </view>

    <!-- end -->

    <!-- 修改底部按钮区域，考虑下架状态 -->
    <view class="action-bar-container">
      <view class="action-bar-wrapper bg-white">
        <!-- 左侧按钮区域 -->
        <view class="action-left">
          <!-- 收藏按钮 -->
          <view class="action-icon" @tap="toggleLike">
            <view :class="['cuIcon-appreciatefill text-xl', liked ? 'text-orange' : 'text-gray']"></view>
            <text :class="['action-text', liked ? 'text-orange' : 'text-gray']">点赞</text>
          </view>
          
          <!-- 聊一聊按钮 - 下架时禁用 -->
          <view class="action-icon" 
                @tap="chatWithSeller" 
                v-if="productDetail.seller_id !== userInfo.student_id && productDetail.is_off_shelf !== 1">
            <view class="cuIcon-message text-blue text-xl"></view>
            <text class="action-text text-blue">聊一聊</text>
          </view>
        </view>
        
        <!-- 右侧主操作按钮 -->
        <view class="action-right">
          <button 
            v-if="productDetail.seller_id === userInfo.student_id" 
            class="cu-btn action-button edit-button" 
            @tap="editProduct">
            编辑商品
          </button>
          <button 
            v-else-if="productDetail.is_off_shelf !== 1"
            class="cu-btn action-button buy-button" 
            @tap="buy">
            立即购买
          </button>
          <button 
            v-else
            class="cu-btn action-button disabled-button"
            disabled>
            商品已下架
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      productDetail: null, // 商品详情数据
      images: [], // 商品的所有图片
      liked: false, // 是否点赞
    };
  },
  onLoad(query) {
    const productId = query.product_id; // 从URL中获取product_id
    this.fetchProductDetail(productId); // 获取商品详情
    this.fetchProductLike(productId); // 获取商品点赞状态
    const userInfo = uni.getStorageSync("userInfo");
    if (userInfo) {
      this.userInfo = userInfo;
    }
  },
  methods: {
    fetchProductDetail(productId) {
      uni.request({
        url: `http://localhost:3000/api/products/${productId}`,
        method: "GET",
        success: (res) => {
          if (res.statusCode === 200) {
            this.productDetail = res.data;
            // 直接使用返回的images数组，包含所有图片（默认图片和用户上传图片）
            this.images = this.productDetail.images || [];
          } else {
            console.error("获取商品详情失败:", res);
          }
        },
        fail: (err) => {
          console.error("获取商品详情失败:", err);
        },
      });
    },
    // 获取商品点赞状态
    fetchProductLike(productId) {
      const token = uni.getStorageSync("token");
      uni.request({
        url: `http://localhost:3000/api/products/like/${productId}`,
        method: "GET",
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            this.liked = res.data.liked; // 赋值点赞状态
          } else {
            console.error("获取商品点赞状态失败:", res);
          }
        },
        fail: (err) => {
          console.error("获取商品点赞状态失败:", err);
        },
      });
    },
    // 点赞操作
    toggleLike() {
      const token = uni.getStorageSync("token");
      uni.request({
        url: "http://localhost:3000/api/products/like",
        method: "POST",
        data: {
          productId: this.productDetail.product_id,
        },
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            this.liked = res.data.liked; // 更新点赞状态
          } else {
            console.error("点赞失败:", res);
          }
        },
        fail: (err) => {
          console.error("点赞失败:", err);
        },
      });
    },
    // 添加到methods中
previewImage(index) {
  const urls = this.images.map(item => this.getImageUrl(item));
  uni.previewImage({
    current: index,
    urls: urls,
    indicator: "number",
    loop: true
  });
},
    // 获取商品图片和头像的完整 URL
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

    // 点击跳转订单确认页面
    buy() {
      uni.navigateTo({
        url:
          "/pages/home/confirm_order/confirm_order?product_id=" +
          this.productDetail.product_id,
      });
    },
    // 跳转到编辑商品页面
    editProduct() {
      uni.navigateTo({
        url: '/pages/issue/issue_edit/issue_edit?product_id=' + this.productDetail.product_id
      });
    },
    // 跳转到聊天页面
    toChat() {
      uni.navigateTo({
        url: "/pages/msg/msg_chat/msg_chat",
      });
    },
    chatWithSeller() {
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

      // 创建会话
      uni.request({
        url: "http://localhost:3000/api/conversations/create",
        method: "POST",
        data: {
          sellerId: this.productDetail.seller_id,
          productId: this.productDetail.product_id,
        },
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: (res) => {
          if (res.statusCode === 201) {
            // 跳转到聊天页面
            uni.navigateTo({
              url: `/pages/msg/msg_chat/msg_chat?conversation_id=${res.data.conversation_id}&user_id=${this.productDetail.seller_id}&product_id=${this.productDetail.product_id}`,
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
.page-wrapper {
  padding-bottom: 90rpx;
}

.action-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 20rpx;
}
/* 优化后的底部操作栏样式 */
.action-bar-container {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 10rpx 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 99;
}

.action-bar-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10rpx 30rpx;
  height: 100rpx;
}

.action-left {
  display: flex;
  align-items: center;
}

.action-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 40rpx;
  position: relative;
}

.action-text {
  font-size: 24rpx;
  margin-top: 6rpx;
}

.action-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.action-button {
  min-width: 220rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

.buy-button {
  background: linear-gradient(135deg, #ff6b6b, #ff3030);
  color: white;
}

.edit-button {
  background: linear-gradient(135deg, #4e7df7, #2e5cf7);
  color: white;
}

/* 修改page-wrapper底部内边距，保证内容不被底部栏遮挡 */
.page-wrapper {
  padding-bottom: 120rpx;
}
/* 商家信息 */

.padding-name {
  padding-top: 25rpx;
  padding-left: 20rpx;
}

.padding-name text {
  color: gray;
  font-size: 20rpx;
}

.fl image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 100%;
}

.padding-time {
  padding-top: 45rpx;
}

text-title-size {
  font-size: 50rpx;
  color: gray;
}

/* 商家信息end */

/* 商品内容 */
.top-20 {
  margin-top: 20rpx;
}

.price-size {
  font-size: 50rpx;
  color: red;
}

.price-symbol {
  font-size: 20rpx;
  color: red;
}

.price-ori {
  margin-left: 25rpx;
  text-decoration: line-through;
}

.font-size text {
  font-size: 35rpx;
  color: black;
}

.hint {
  margin-top: 20rpx;
  color: black;
  font-size: 35rpx;
}
/* 修改图片样式，保持原比例 */
.img {
  margin-top: 20rpx;
  width: 100%;
  object-fit: contain; /* 保持图片原比例 */
  max-height: 800rpx;
  border-radius: 12rpx; /* 添加圆角美化效果 */
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05); /* 轻微阴影增加层次感 */
}

.cu-tag {
  margin-left: 20rpx;
  /* padding: 0rpx; */
  font-size: 22rpx;
}

.browse {
  display: flex;
  justify-content: space-between;
}

.browse-tiem {
  font-size: 23rpx;
  color: gray;
}

.padding-browse {
  padding: 10rpx;
}

/* 商品内容end */

/* 商家信息 */
.in_regard_to {
  display: flex;
  align-items: center;
}

.in_regard_to image {
  width: 50rpx;
  height: 65rpx;
}

.in_regard_to_text {
  font-size: 35rpx;
  color: black;
  font-family: inherit;
}

.top-30 {
  margin-top: 30rpx;
}

.Business_information {
  /* width: 30%; */
  padding: 5rpx;
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
}

.information {
  /* border-top-left-radius: 5%;
  border-top-right-radius: 5%; */
  border-radius: 20rpx;
  padding: 10rpx;
  display: flex;
  justify-content: space-around;
}

.item-inline {
  display: inline-block;
  margin-right: 10rpx;
  height: 150rpx;
  width: 230rpx;
}

/* end */

/* 消息 */
.msg {
  display: flex;
}

.msg-conetent {
  margin-left: 30rpx;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  margin-top: 10rpx;
  width: 80%;
}

.msg-timer {
  padding-left: 20rpx;
}

.msg-timers {
  color: gray;
  font-size: 22rpx;
}

/* end */

/* 相似商品 */
.container {
  margin-left: 29rpx;
  margin-right: 20rpx;
  /* float: left; */
  height: 530rpx;
  width: 43%;
  background: white;
  margin-bottom: 20rpx;
}

.container_img image {
  height: 300rpx;
  width: 100%;
}

.container_text {
  color: black;
  padding: 10rpx;
  font-size: 23rpx;
}

.container_price {
  display: flex;
  justify-content: space-between;
  padding-left: 8rpx;
  padding-right: 8rpx;
}

.container_price_text_0 {
  color: red;
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
}

.container_price_text_1 {
  font-size: 22rpx;
}

.container_line {
  width: 100%;
  background: gainsboro;
  height: 1rpx;
  margin-top: 10rpx;
}

.container_user {
  margin-top: 20rpx;
  display: flex;
  line-height: 50rpx;
}

.container_user image {
  margin-left: 10rpx;
  margin-right: 50rpx;
  height: 50rpx;
  width: 50rpx;
}

.container-flex {
  display: flex;
  flex-wrap: wrap;
}

/* end */

/* 底部操作选项卡 */
.fixation {
  position: fixed;
  bottom: 0rpx;
  width: 100%;
}

.margin-rigth-20 {
  margin-right: 20rpx;
}

/* 添加下架相关样式 */
.off-shelf-container {
  position: relative;
  filter: grayscale(80%);
}

.off-shelf-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.off-shelf-text {
  font-size: 100rpx;
  color: #ff0000;
  font-weight: bold;
  transform: rotate(-30deg);
  background: rgba(255, 255, 255, 0.8);
  padding: 20rpx 60rpx;
  border-radius: 20rpx;
  border: 5rpx solid #ff0000;
  text-shadow: 3rpx 3rpx 5rpx rgba(0, 0, 0, 0.3);
}

.disabled-button {
  background: #cccccc !important;
  color: #666666 !important;
  cursor: not-allowed;
}
/* end */
</style>
