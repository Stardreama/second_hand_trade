<template>
  <!-- <view> -->
  <view v-if="productDetail" class="page-wrapper">
    <!-- 仅在数据加载后渲染 -->
    <!-- 商家信息 -->

    <view class="bg-white">
      <view class="cf padding-sm">
        <view class="radius fl padding-sm">
          <!-- <image src="../../../static/img/avatar.jpg"></image> -->
          <!-- <image :src="productDetail.seller_avatar || '../../../static/img/avatar.jpg'"></image> -->
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
        <!-- <text>
          123百度图片-发现多彩世界百度图片 - 百度快照 -
          745条评价先锋图片百度图片使用世界前沿的人工智能技术，为用户甄选海量的高清美图，用更流畅、更快捷、更精准的搜索体验，带你去发现多彩的世界。
        </text> -->
        <text>{{ productDetail.description }}</text>
      </view>

      <!-- 交易方式 -->
      <view class="hint">
        <!-- <text>本交易仅支持自提、当面交易、邮寄</text> -->
        <!-- <text>{{ productDetail.status || '本交易仅支持自提、当面交易、邮寄' }}</text> -->
      </view>
      <!-- end -->

      <!-- 图片位置 -->
      <!-- <block v-for="(item, index) in 6" :key="index">
        <image class="img" src="../../../static/img/qiu.jpeg"></image>
      </block> -->
      <block v-for="(item, index) in images" :key="index">
        <image class="img" :src="getImageUrl(item)"></image>
      </block>
      <!--图片位置end  -->

      <view class="browse">
        <view>
          <text></text>
        </view>
        <!-- <view class="text-gray text-sm text-right padding-browse">
          <text class="cuIcon-attentionfill margin-lr-xs"></text>
          {{ productDetail.attention_count || 0 }}
          <text class="cuIcon-appreciatefill margin-lr-xs"></text>
          {{ productDetail.like_amount || 0 }}
          <text class="cuIcon-messagefill margin-lr-xs"></text>
          {{ productDetail.message_count || 0 }}
        </view> -->
      </view>
    </view>
    <!-- 商品内容end -->

    <!-- 相识商品 -->
    <view class="bg-white top-20"> </view>

    <!-- end -->

    <!-- 操作选项卡 -->
    <view class="cu-bar bg-white tabbar border shop fixation">
      <view class="action-buttons padding-sm">
        <!-- 仅当商品不是自己发布的时候显示聊一聊按钮 -->
        <button class="cu-btn bg-blue lg shadow" @tap="chatWithSeller"
          v-if="productDetail.seller_id !== userInfo.student_id">
          <text class="cuIcon-message"></text> 聊一聊
        </button>
      </view>
      <view class="action" @tap="toggleLike">
        <view :class="[
          'cuIcon-appreciatefill',
          liked ? 'text-orange' : 'text-gray',
        ]"></view>
        点赞
      </view>
      <!-- <view class="bg-red submit margin-rigth-20" @tap="buy">立即结算</view> -->
      <!-- 条件渲染：如果是自己发布的商品，显示“编辑商品”按钮；否则显示“立即结算”按钮 -->
      <view v-if="productDetail.seller_id === userInfo.student_id" class="bg-red submit margin-rigth-20"
        @tap="editProduct">
        编辑商品
      </view>
      <view v-else class="bg-red submit margin-rigth-20" @tap="buy">
        立即结算
      </view>
    </view>
    <!-- end -->
  </view>
</template>

<script>
import axios from "axios"; // 确保导入 axios

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
        url: `http://localhost:3000/api/products/${productId}`, // API endpoint
        method: "GET",
        success: (res) => {
          if (res.statusCode === 200) {
            this.productDetail = res.data;
            console.log("original_price:", this.productDetail.original_price);
            this.images = this.productDetail.images || []; // 商品的图片数据
            console.log(this.images);
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

.img {
  margin-top: 10rpx;
  width: 100%;
  height: 800rpx;
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

/* end */
</style>
