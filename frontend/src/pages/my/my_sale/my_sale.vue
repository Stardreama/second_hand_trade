<template>
  <view>
    <!-- 内容 -->
    <view class='pa'>
      <!-- 有售出记录时显示列表 -->
      <view v-if="soldProducts && soldProducts.length > 0">
        <view class='container bg-white shadow-warp' v-for="(item, index) in soldProducts" :key="item.order_id">

          <view class='container-top'>
            <view class='container-top-1'>
              <image :src="getImageUrl(item.image)"></image>
            </view>
            <view class='container-top-2'>
              <view class='container-top-2_1 text-cut'>
                <text>{{item.product_title}}</text>
              </view>
              <view class='container-top-2_2'>
                <text class='text-price text-sm text-red'>{{item.price}}</text>
              </view>
              <view>
                <text class='cuIcon-time lg text-gray'></text>
                <text class='text-xxm'>{{formatTime(item.created_at)}}</text>
              </view>
            </view>
          </view>

          <view class='container-line'></view>

          <view class='container-under'>
            <view class='container-under-1' @tap="contactBuyer(item)">
              <text class='cuIcon-message font-size-lg text-black'></text>
              <text class='text-sm text-black'>联系买家</text>
            </view>
            <view class='container-under-2'>
              <view class="cu-tag bg-red light">已售出</view>
            </view>
          </view>

        </view>
      </view>

      <!-- 无售出记录时显示空状态 -->
      <view v-else class="empty-state">
        <view class="empty-icon">🛒</view>
        <view class="empty-text">暂无售出记录</view>
        <view class="empty-subtext">您的商品还没有卖出去哦</view>
        <button class="cu-btn bg-blue margin-top" @tap="goToMyIssue">
          查看我的发布
        </button>
      </view>

    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      soldProducts: [],
      baseUrl: "http://localhost:3000/"
    };
  },
  methods: {
    async loadSoldProducts() {
      try {
        const token = uni.getStorageSync("token");
        if (!token) {
          uni.showToast({
            title: "请先登录",
            icon: "none"
          });
          return;
        }

        const { data: res } = await uni.request({
          url: `${this.baseUrl}api/orders/sold-products`,
          method: "GET",
          header: { Authorization: "Bearer " + token }
        });

        if (res.code === 200) {
          this.soldProducts = res.data;
        } else {
          uni.showToast({
            title: res.message || "获取数据失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("加载售出商品失败:", error);
        uni.showToast({
          title: "数据加载失败",
          icon: "none"
        });
      }
    },

    // 获取图片URL
    getImageUrl(url) {
      if (!url) return "../../../static/img/shoop_heart.jpeg";

      if (url.startsWith("http")) {
        return url;
      }

      return `${this.baseUrl}${url.replace(/\\/g, "/")}`;
    },

    // 格式化时间
    formatTime(time) {
      if (!time) return '';
      const date = new Date(time);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    },

    // 联系买家
    async contactBuyer(item) {
      if (!item.buyer_id) {
        uni.showToast({
          title: "买家信息不存在",
          icon: "none"
        });
        return;
      }

      try {
        const token = uni.getStorageSync("token");
        
        // 创建或获取会话
        const { data: res } = await uni.request({
          url: `${this.baseUrl}api/conversations/create`,
          method: "POST",
          header: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json"
          },
          data: {
            buyerId: item.buyer_id,
            productId: item.product_id
          }
        });

        if (res.conversation_id) {
          // 跳转到聊天页面
          uni.navigateTo({
            url: `/pages/msg/msg_chat/msg_chat?conversation_id=${res.conversation_id}&user_id=${item.buyer_id}&product_id=${item.product_id}&otherUserName=${item.buyer_name || '买家'}`
          });
        } else {
          uni.showToast({
            title: "创建聊天失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("联系买家失败:", error);
        uni.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      }
    },

    // 跳转到我的发布页面
    goToMyIssue() {
      uni.navigateTo({
        url: '/pages/my/my_issue/my_issue'
      });
    }
  },
  onLoad() {
    this.loadSoldProducts();
  },
  onShow() {
    // 每次页面显示时刷新数据
    this.loadSoldProducts();
  }
}
</script>

<style scoped>
/* pages/my/my_sale/my_sale.wxss */

.pa {
  padding: 20rpx;
}

/* 内容 */
.container {
  padding: 20rpx;
  height: 300rpx;
  width: 100%;
  margin-bottom: 20rpx;
}

.container-top-2 {
  margin-left: 20rpx;
  width: 120%;
}

.container-top-1 image {
  width: 150rpx;
  height: 150rpx;
  border-radius: 8rpx;
}

.container-top {
  display: flex;
  align-items: center;
}

.container-top-2_1 {
  margin-bottom: 20rpx;
  width: 50%;
}

.container-top-2_1 text {
  font-weight: 600;
}

.container-top-2_2 {
  margin-bottom: 20rpx;
}

.container-top-2_2 text {
  font-size: 25rpx;
  font-weight: 750;
}

.text-xxm {
  font-size: 22rpx;
  color: gray;
  padding-left: 10rpx;
}

.container-line {
  width: 95%;
  height: 3rpx;
  background: gainsboro;
  margin-top: 25rpx;
}

.container-under {
  display: flex;
  margin-top: 25rpx;
  align-items: center;
  justify-content: space-between;
}

.font-size-lg {
  font-size: 35rpx;
  padding-right: 10rpx;
}

.container-under-1 {
  display: flex;
  align-items: center;
  background-color: #f0f8ff;
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 30rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 34rpx;
  font-weight: bold;
  margin-bottom: 15rpx;
}

.empty-subtext {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 40rpx;
}
</style>