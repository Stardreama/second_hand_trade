<template>
  <view class="container">
    <view class="content">
      <!-- 有购买记录 -->
      <view v-if="productList.length > 0">
        <view class="purchase-item" v-for="item in productList" :key="item.purchase_id">
          <!-- 商品标题 -->
          <view class="title">{{ item.product_title }}</view>

          <!-- 图片展示区域 -->
          <scroll-view scroll-x class="image-scroll" v-if="item.images.length > 0">
            <view class="image-container">
              <view v-for="(img, index) in item.images" :key="index" class="image-wrapper">
                <image :src="getImageUrl(img)" mode="aspectFill" class="product-image" />
              </view>
            </view>
          </scroll-view>

          <!-- 无图提示 -->
          <view v-else class="no-image">
            <text>暂无商品图片</text>
          </view>

          <!-- 价格和时间 -->
          <view class="info-row">
            <text class="price">￥{{ item.price }}</text>
            <text class="time">{{ formatTime(item.purchase_time) }}</text>
          </view>

          <!-- 操作按钮 -->
          <view class="action-buttons">
            <!-- 修改后 -->
            <view class="btn contact" @tap="goChatSeller(item)">
              联系卖家
            </view>
            <view class="btn delete" @tap="deletePurchase(item)">
              删除记录
            </view>
          </view>
        </view>
      </view>

      <!-- 无购买记录 -->
      <view v-else class="empty">
        <text class="empty-icon">🛍️</text>
        <text class="empty-text">还没有买过东西</text>
        <text class="empty-tip">快去发现心仪好物吧～</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      productList: [],
      baseUrl: "http://localhost:3000/",
    };
  },
  methods: {
    // 新增删除方法
    async deletePurchase(item) {
      uni.showModal({
        title: "确认删除",
        content: "确定要删除这条购买记录吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              const token = uni.getStorageSync("token");
              const res = await uni.request({
                url: `${this.baseUrl}api/orders/purchases/${item.purchase_id}`,
                method: "DELETE",
                header: { Authorization: `Bearer ${token}` },
              });

              if (res.data.code === 200) {
                uni.showToast({ title: "删除成功", icon: "success" });
                // 本地过滤删除项
                this.productList = this.productList.filter(
                  (p) => p.purchase_id !== item.purchase_id
                );
              } else {
                uni.showToast({ title: res.data.message, icon: "none" });
              }
            } catch (error) {
              uni.showToast({ title: "删除失败，请重试", icon: "none" });
            }
          }
        },
      });
    },
    // 创建新会话
    async goChatSeller(item) {
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
          sellerId: item.seller_id,
          productId: item.product_id,
        },
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: (res) => {
          if (res.statusCode === 201) {
            // 跳转到聊天页面
            uni.navigateTo({
              url: `/pages/msg/msg_chat/msg_chat?conversation_id=${res.data.conversation_id}&user_id=${item.seller_id}&product_id=${item.product_id}&otherUserName=${item.seller_name}`,
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
    async loadData() {
      try {
        const token = uni.getStorageSync("token");
        const res = await uni.request({
          url: this.baseUrl + "api/orders/purchases",
          header: { Authorization: `Bearer ${token}` },
        });

        if (res.data.code === 200) {
          this.productList = res.data.data.map((item) => ({
            ...item,
            images: this.processImages(item.image ? [item.image] : []),
            purchase_time: this.formatTime(item.created_at),
          }));
        }
      } catch (error) {
        uni.showToast({ title: "加载失败", icon: "none" });
      }
    },

    // 新增图片处理方法
    processImages(images) {
      if (!Array.isArray(images)) return [];
      return images.map((img) => {
        // 统一处理路径分隔符
        const formattedPath = img.replace(/\\/g, "/");
        // 判断是否需要添加baseUrl
        return formattedPath.startsWith("http")
          ? formattedPath
          : `${this.baseUrl}${formattedPath}`;
      });
    },

    // 图片路径处理方法
    getImageUrl(img) {
      // 添加默认图片处理
      return img || `${this.baseUrl}images/default-product.png`;
    },

    formatTime(timestamp) {
      const date = new Date(timestamp);
      return `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    },
  },
  mounted() {
    this.loadData();
  },
};
</script>
<style scoped>
.no-image {
  height: 200rpx;
  background: #f8f8f8;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 28rpx;
  margin: 20rpx 0;
}

/* 优化图片显示 */
.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 确保图片填充 */
}

.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.purchase-item {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.title {
  font-size: 32rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 24rpx;
}

.image-scroll {
  height: 280rpx;
  margin: 24rpx 0;
}

.image-container {
  display: flex;
  height: 100%;
}

.image-wrapper {
  width: 280rpx;
  height: 280rpx;
  margin-right: 24rpx;
  flex-shrink: 0;
  border-radius: 12rpx;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 24rpx 0;
}

.price {
  color: #e4393c;
  font-size: 36rpx;
  font-weight: bold;
}

.time {
  color: #666;
  font-size: 26rpx;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 24rpx;
  border-top: 1rpx solid #eee;
  padding-top: 24rpx;
}

.btn {
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  font-size: 28rpx;
}

.contact {
  background: #007aff;
  color: white;
}

.delete {
  background: #ff4444;
  color: white;
}

.empty {
  padding: 100rpx 0;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  display: block;
  margin-bottom: 32rpx;
  opacity: 0.8;
}

.empty-text {
  display: block;
  font-size: 34rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.empty-tip {
  display: block;
  font-size: 28rpx;
  color: #999;
}
</style>
