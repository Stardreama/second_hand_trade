<template>
  <!-- <view> -->
  <view v-if="productDetail" class="page-wrapper" :class="{ 'off-shelf-container': productDetail.is_off_shelf === 1 }">
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
        <view v-if="showFollowButton" class="follow-btn-container">
    <view class="follow-btn" 
      :class="{'follow-btn-active': isFollowing, 'bounce-animation': buttonBouncing}"
      @click="toggleFollow">
      <view class="follow-btn-inner">
        <text class="follow-icon">{{ isFollowing ? '✓' : '+' }}</text>
        <text>{{ isFollowing ? "已关注" : "关注" }}</text>
      </view>
    </view>
    
    <!-- 简化动画元素 -->
    <view v-if="showFollowAnimation" class="follow-animation-container">
      <text class="follow-heart follow-center-heart">❤</text>
      <text class="follow-text">爱你呦~</text>
  <text class="follow-item follow-item-1">❤</text>
  <text class="follow-item follow-item-2">★</text>
  <text class="follow-item follow-item-3">♥</text>
  <text class="follow-item follow-item-4">✿</text>
  <text class="follow-item follow-item-5">♡</text>
  <text class="follow-item follow-item-6">✧</text>
  <text class="follow-item follow-item-7">❀</text>
  <text class="follow-item follow-item-8">✩</text>
  <text class="follow-item follow-item-9">❥</text>
  <text class="follow-item follow-item-10">✮</text>
  <text class="follow-item follow-item-11">♬</text>
  <text class="follow-item follow-item-12">✿</text>
  <text class="follow-item follow-item-13">❋</text>
  <text class="follow-item follow-item-14">♪</text>
  <text class="follow-item follow-item-15">✺</text>
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

      <view class="bg-white top-20">
        <view class="detail-product-description">
          {{ productDetail.description }}
        </view>
      </view>

      <!-- 交易方式 -->
      <view class="hint"> </view>
      <!-- end -->
      <!-- 图片位置 -->
      <block v-for="(item, index) in images" :key="index">
        <image class="img" :src="getImageUrl(item)" mode="widthFix" @tap="previewImage(index)"></image>
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
  <view class="action-icon" @tap="toggleLike">
    <uni-icons :type="liked ? 'heart-filled' : 'heart'" :color="liked ? '#ff7900' : '#666'" size="24"></uni-icons>
    <text :class="['action-text', liked ? 'text-orange' : 'text-gray']">点赞</text>
  </view>

  <!-- 收藏按钮 -->
  <view class="action-icon" @tap="toggleFavorite">
    <uni-icons :type="favorited ? 'star-filled' : 'star'" :color="favorited ? '#ff0000' : '#666'" size="24"></uni-icons>
    <text :class="['action-text', favorited ? 'text-red' : 'text-gray']">收藏</text>
  </view>

  <!-- 聊一聊按钮 - 下架时禁用 -->
  <view class="action-icon" @tap="chatWithSeller" v-if="
    productDetail.seller_id !== userInfo.student_id &&
    productDetail.is_off_shelf !== 1
  ">
    <uni-icons type="chat" color="#007aff" size="24"></uni-icons>
    <text class="action-text text-blue">聊一聊</text>
  </view>
</view>

       <!-- 右侧主操作按钮 -->
<view class="action-right">
  <uni-button v-if="productDetail.seller_id === userInfo.student_id" 
    type="primary" 
    class="action-button"
    @click="editProduct">
    编辑商品
  </uni-button>
  <uni-button v-else-if="productDetail.is_off_shelf !== 1" 
    type="warn" 
    class="action-button buy-button"
    @click="buy">
    立即购买
  </uni-button>
  <uni-button v-else 
    type="default" 
    class="action-button" 
    disabled>
    商品已下架
  </uni-button>
</view>
      </view>
    </view>
  </view>
</template>

<script>
import uniIcons from "@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue";
export default {
  components: {
    uniIcons
  },
  data() {
    return {
      productDetail: null, // 商品详情数据
      images: [], // 商品的所有图片
      liked: false, // 是否点赞
      favorited: false, // 是否收藏
      isFollowing: false, // 当前用户是否已关注
      showFollowButton: true, // 是否显示关注按钮（商品拥有者不显示）
      userInfo: {},
      showFollowAnimation: false, // 控制关注动画显示
      buttonBouncing: false,      // 控制按钮弹跳效果
    };
  },
  onLoad(query) {
    const productId = query.product_id; // 从URL中获取product_id
    this.fetchProductDetail(productId); // 获取商品详情
    this.fetchProductLike(productId); // 获取商品点赞状态
    this.fetchProductFavorite(productId); // 获取商品收藏状态
    const userInfo = uni.getStorageSync("userInfo");
    if (userInfo) {
      this.userInfo = userInfo;
    }
  },
  onShow() {
    // 当页面显示时，若当前用户不是商品拥有者则重新检测关注状态
    if (
      this.productDetail &&
      this.userInfo.student_id !== this.productDetail.seller_id
    ) {
      this.checkFollowStatus();
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
            // 若浏览者为商品拥有者，则不显示关注按钮
            if (this.userInfo.student_id === this.productDetail.seller_id) {
              this.showFollowButton = false;
            } else {
              this.showFollowButton = true;
              this.checkFollowStatus();
            }
          } else {
            console.error("获取商品详情失败:", res);
          }
        },
        fail: (err) => {
          console.error("获取商品详情失败:", err);
        },
      });
    },
    // 检查当前用户是否关注了商品拥有者
    checkFollowStatus() {
      const token = uni.getStorageSync("token");
      uni.request({
        url: `http://localhost:3000/api/user/follow/status`,
        method: "GET",
        header: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          // follower_id: this.userInfo.student_id,
          followee_id: this.productDetail.seller_id,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            // 返回 { followed: true } 或 { followed: false }
            this.isFollowing = res.data.followed;
          } else {
            console.error("检查关注状态失败:", res);
          }
        },
        fail: (err) => {
          console.error("检查关注状态失败:", err);
        },
      });
    },
    toggleFollow() {
  const token = uni.getStorageSync("token");
  
  if (this.isFollowing) {
    // 取消关注逻辑
    uni.request({
      url: `http://localhost:3000/api/user/follow`,
      method: "DELETE", // 使用DELETE方法取消关注
      header: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        followee_id: this.productDetail.seller_id,
      },
      success: (res) => {
        if (res.statusCode === 200) {
          uni.showToast({ title: "已取消关注", icon: "none" });
          this.isFollowing = false;
          
          // 添加取消关注时的按钮动画
          this.buttonBouncing = true;
          setTimeout(() => {
            this.buttonBouncing = false;
          }, 500);
        } else {
          uni.showToast({ title: "取消关注失败", icon: "none" });
        }
      },
      fail: (err) => {
        console.error("取消关注失败:", err);
      },
    });
  } else {
    // 关注逻辑保持不变
    uni.request({
      url: `http://localhost:3000/api/user/follow`,
      method: "POST",
      header: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        followee_id: this.productDetail.seller_id,
      },
      success: (res) => {
        if (res.statusCode === 201) {
          uni.showToast({ title: "关注成功", icon: "none" });
          this.isFollowing = true;
          
          // 动画触发逻辑
          this.buttonBouncing = true;
          this.$nextTick(() => {
            this.showFollowAnimation = true;
            
            setTimeout(() => {
              this.buttonBouncing = false;
              this.showFollowAnimation = false;
            }, 1500);
          });
        } else {
          uni.showToast({ title: "关注失败", icon: "none" });
        }
      },
      fail: (err) => {
        console.error("关注失败:", err);
      },
    });
  }
},
    // 获取商品收藏状态
    fetchProductFavorite(productId) {
      const token = uni.getStorageSync("token");
      uni.request({
        url: `http://localhost:3000/api/products/favorite/${productId}`,
        method: "GET",
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            this.favorited = res.data.favorited; // 赋值收藏状态
          } else {
            console.error("获取商品收藏状态失败:", res);
          }
        },
        fail: (err) => {
          console.error("获取商品收藏状态失败:", err);
        },
      });
    },

    // 收藏操作
    toggleFavorite() {
      const token = uni.getStorageSync("token");
      if (!token) {
        uni.showToast({ title: "请先登录", icon: "none" });
        return;
      }

      uni.request({
        url: "http://localhost:3000/api/products/favorite",
        method: "POST",
        data: {
          productId: this.productDetail.product_id,
        },
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            this.favorited = res.data.favorited; // 更新收藏状态
            // 添加操作成功的提示
            uni.showToast({
              title: this.favorited ? "收藏成功" : "已取消收藏",
              icon: "success",
            });
          } else {
            console.error("收藏操作失败:", res);
            uni.showToast({
              title: "操作失败，请重试",
              icon: "none",
            });
          }
        },
        fail: (err) => {
          console.error("收藏操作失败:", err);
          uni.showToast({
            title: "网络错误，请稍后再试",
            icon: "none",
          });
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
      const urls = this.images.map((item) => this.getImageUrl(item));
      uni.previewImage({
        current: index,
        urls: urls,
        indicator: "number",
        loop: true,
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
        url:
          "/pages/issue/issue_edit/issue_edit?product_id=" +
          this.productDetail.product_id,
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

/* 新增关注按钮样式 */
.follow-btn {
  float: right;
  margin-top: 25rpx;
  margin-right: 30rpx;
  padding: 5rpx 20rpx;
  font-size: 24rpx;
  border: 2rpx solid #ccc;
  border-radius: 5rpx;
  background-color: #fff;
  color: #333;
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
  object-fit: contain;
  /* 保持图片原比例 */
  max-height: 800rpx;
  border-radius: 12rpx;
  /* 添加圆角美化效果 */
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  /* 轻微阴影增加层次感 */
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


.detail-product-description {
  font-size: 30rpx;
  color: #333;
  line-height: 1.6;
  padding: 20rpx 10rpx;
  word-wrap: break-word;
  white-space: pre-wrap;
  text-align: justify;
}


/* 将这部分样式替换为更简洁的版本 */
.follow-btn-container {
  position: relative;
  float: right;
  margin-top: 25rpx;
  margin-right: 30rpx;
  z-index: 5;
}

.follow-btn {
  position: relative;
  cursor: pointer;
  background: transparent; /* 确保没有背景色 */
  border: none; /* 移除任何可能的边框 */
  outline: none; /* 移除轮廓 */
  padding: 0; /* 移除内边距 */
  margin: 0; /* 移除外边距 */
}

.follow-btn-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12rpx 30rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  background: #f5f5f5;
  color: #333;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  /* border: 2rpx solid #e0e0e0; */
  transition: all 0.3s;
}

.follow-btn-active .follow-btn-inner {
  background: linear-gradient(to right, #36d1dc, #5b86e5);
  color: white;
  border: 2rpx solid transparent;
}

.follow-icon {
  margin-right: 8rpx;
  font-weight: bold;
}

/* 简化弹跳动画 */
@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.bounce-animation {
  animation: bounce 0.5s ease;
}
/* 全新的动画容器 - 覆盖整个屏幕 */
.follow-animation-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 999;
}

/* 中心大爱心 */
.follow-center-heart {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  font-size: 200rpx;
  color: #ff4757;
  text-shadow: 0 0 30rpx rgba(255, 71, 87, 0.8);
  animation: pulseHeart 1.5s ease-in-out forwards;
  opacity: 0;
}

/* 花束元素共同样式 */
.follow-item {
  position: absolute;
  bottom: -100rpx; /* 从屏幕底部开始 */
  font-size: 80rpx;
  text-shadow: 0 0 15rpx rgba(255, 255, 255, 0.8);
  animation-duration: 2s;
  animation-fill-mode: forwards;
  animation-timing-function: ease-out;
}

/* 各个花朵元素的颜色和起始位置 */
.follow-item-1 {
  left: calc(50% - 180rpx);
  color: #ff4757;
  animation-name: flyItem1;
}

.follow-item-2 {
  left: calc(50% - 120rpx);
  color: #ffa502;
  animation-name: flyItem2;
  animation-delay: 0.1s;
}

.follow-item-3 {
  left: calc(50% - 60rpx);
  color: #ff6b81;
  animation-name: flyItem3;
  animation-delay: 0.15s;
}

.follow-item-4 {
  left: calc(50%);
  color: #7bed9f;
  animation-name: flyItem4;
  animation-delay: 0.2s;
}

.follow-item-5 {
  left: calc(50% + 60rpx);
  color: #70a1ff;
  animation-name: flyItem5;
  animation-delay: 0.25s;
}

.follow-item-6 {
  left: calc(50% + 120rpx);
  color: #eccc68;
  animation-name: flyItem6;
  animation-delay: 0.3s;
}

.follow-item-7 {
  left: calc(50% + 180rpx);
  color: #a29bfe;
  animation-name: flyItem7;
  animation-delay: 0.35s;
}

/* 中心脉动爱心动画 */
@keyframes pulseHeart {
  0% { 
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  50% { 
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 1;
  }
  85% {
    transform: translate(-50%, -50%) scale(1.8);
    opacity: 0.8;
  }
  100% { 
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

/* 花束元素动画 - 向中心聚集 */
@keyframes flyItem1 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  60% { transform: translateY(-500rpx) translateX(70rpx) rotate(20deg) scale(1.2); opacity: 0.9; }
  100% { transform: translateY(-800rpx) translateX(100rpx) rotate(45deg) scale(0); opacity: 0; }
}

@keyframes flyItem2 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  60% { transform: translateY(-450rpx) translateX(40rpx) rotate(-15deg) scale(1.3); opacity: 0.9; }
  100% { transform: translateY(-750rpx) translateX(60rpx) rotate(-30deg) scale(0); opacity: 0; }
}

@keyframes flyItem3 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  60% { transform: translateY(-550rpx) translateX(20rpx) rotate(30deg) scale(1.1); opacity: 0.9; }
  100% { transform: translateY(-850rpx) translateX(30rpx) rotate(60deg) scale(0); opacity: 0; }
}

@keyframes flyItem4 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  60% { transform: translateY(-600rpx) translateX(0rpx) rotate(-20deg) scale(1.4); opacity: 0.9; }
  100% { transform: translateY(-900rpx) translateX(0rpx) rotate(-40deg) scale(0); opacity: 0; }
}

@keyframes flyItem5 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  60% { transform: translateY(-550rpx) translateX(-20rpx) rotate(10deg) scale(1.2); opacity: 0.9; }
  100% { transform: translateY(-850rpx) translateX(-30rpx) rotate(20deg) scale(0); opacity: 0; }
}

@keyframes flyItem6 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  60% { transform: translateY(-450rpx) translateX(-40rpx) rotate(-25deg) scale(1.3); opacity: 0.9; }
  100% { transform: translateY(-750rpx) translateX(-60rpx) rotate(-50deg) scale(0); opacity: 0; }
}

@keyframes flyItem7 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  60% { transform: translateY(-500rpx) translateX(-70rpx) rotate(15deg) scale(1.1); opacity: 0.9; }
  100% { transform: translateY(-800rpx) translateX(-100rpx) rotate(30deg) scale(0); opacity: 0; }
}

/* 添加更多花束元素的样式 */
.follow-item-8 {
  left: calc(50% - 240rpx);
  color: #ff9ff3;
  animation-name: flyItem8;
  animation-delay: 0.05s;
}

.follow-item-9 {
  left: calc(50% + 240rpx);
  color: #ff6b6b;
  animation-name: flyItem9;
  animation-delay: 0.08s;
}

.follow-item-10 {
  left: calc(50% - 300rpx);
  color: #feca57;
  animation-name: flyItem10;
  animation-delay: 0.12s;
}

.follow-item-11 {
  left: calc(50% + 300rpx);
  color: #1dd1a1;
  animation-name: flyItem11;
  animation-delay: 0.18s;
}

.follow-item-12 {
  left: calc(50% - 90rpx);
  color: #5f27cd;
  animation-name: flyItem12;
  animation-delay: 0.22s;
}

.follow-item-13 {
  left: calc(50% + 90rpx);
  color: #ff9f43;
  animation-name: flyItem13;
  animation-delay: 0.28s;
}

.follow-item-14 {
  left: calc(50% - 150rpx);
  color: #00d2d3;
  animation-name: flyItem14;
  animation-delay: 0.32s;
}

.follow-item-15 {
  left: calc(50% + 150rpx);
  color: #ff6348;
  animation-name: flyItem15;
  animation-delay: 0.37s;
}

/* 为新增元素添加动画 */
@keyframes flyItem8 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  60% { transform: translateY(-520rpx) translateX(100rpx) rotate(30deg) scale(1.4); opacity: 0.9; }
  100% { transform: translateY(-820rpx) translateX(150rpx) rotate(60deg) scale(0); opacity: 0; }
}

@keyframes flyItem9 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  60% { transform: translateY(-520rpx) translateX(-100rpx) rotate(-30deg) scale(1.4); opacity: 0.9; }
  100% { transform: translateY(-820rpx) translateX(-150rpx) rotate(-60deg) scale(0); opacity: 0; }
}

@keyframes flyItem10 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  60% { transform: translateY(-480rpx) translateX(130rpx) rotate(45deg) scale(1.3); opacity: 0.9; }
  100% { transform: translateY(-950rpx) translateX(180rpx) rotate(90deg) scale(0); opacity: 0; }
}

@keyframes flyItem11 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  20% { opacity: 1; }
  60% { transform: translateY(-480rpx) translateX(-130rpx) rotate(-45deg) scale(1.3); opacity: 0.9; }
  100% { transform: translateY(-950rpx) translateX(-180rpx) rotate(-90deg) scale(0); opacity: 0; }
}

@keyframes flyItem12 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  15% { opacity: 1; }
  65% { transform: translateY(-580rpx) translateX(50rpx) rotate(60deg) scale(1.2); opacity: 0.9; }
  100% { transform: translateY(-880rpx) translateX(80rpx) rotate(120deg) scale(0); opacity: 0; }
}

@keyframes flyItem13 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  15% { opacity: 1; }
  65% { transform: translateY(-580rpx) translateX(-50rpx) rotate(-60deg) scale(1.2); opacity: 0.9; }
  100% { transform: translateY(-880rpx) translateX(-80rpx) rotate(-120deg) scale(0); opacity: 0; }
}

@keyframes flyItem14 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  15% { opacity: 1; transform: translateY(20rpx); }
  70% { transform: translateY(-650rpx) translateX(30rpx) rotate(-10deg) scale(1.5); opacity: 0.85; }
  100% { transform: translateY(-1000rpx) translateX(60rpx) rotate(-20deg) scale(0); opacity: 0; }
}

@keyframes flyItem15 {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  15% { opacity: 1; transform: translateY(20rpx); }
  70% { transform: translateY(-650rpx) translateX(-30rpx) rotate(10deg) scale(1.5); opacity: 0.85; }
  100% { transform: translateY(-1000rpx) translateX(-60rpx) rotate(20deg) scale(0); opacity: 0; }
}

/* 提高中心爱心的视觉效果 */
.follow-center-heart {
  font-size: 240rpx; /* 增大尺寸 */
  text-shadow: 0 0 40rpx rgba(255, 71, 87, 0.9); /* 增强发光效果 */
}

@keyframes pulseHeart {
  0% { 
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
  40% { 
    transform: translate(-50%, -50%) scale(3.0); /* 更大的缩放效果 */
    opacity: 1;
  }
  80% {
    transform: translate(-50%, -50%) scale(2.2);
    opacity: 0.8;
  }
  100% { 
    transform: translate(-50%, -50%) scale(2.5);
    opacity: 0;
  }
}

</style>