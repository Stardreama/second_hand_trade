<template>
  <view>
    <!-- 用户信息 -->
    <view class="user-center-container">
      <image src="/static/img/dzq.png" class="bg-image" mode="aspectFill"></image>
      <view class="user-center-content">
        <!-- 头像和昵称放在这里 -->
        <image :src="avatar" class="avatar-image" @tap.stop="changeAvatar"></image>
        <view class="nickname-container" @tap.stop="editNickname">
          <text>{{ nickname || "Amibition" }}</text>
          <uni-icons type="compose" size="24" color="#ffffff" class="edit-icon"></uni-icons>
        </view>
      </view>
    </view>


    <!-- 修改昵称弹框 -->
    <view v-if="isNicknameModalVisible" class="nickname-modal">
      <view class="modal-content">
        <text>现在您可以修改自己的昵称啦~</text>
        <input v-model="newNickname" placeholder="请输入新的昵称" class="nickname-input" />
        <view class="modal-actions" @tap.stop>
          <button @tap="updateNickname" class="btn-confirm">
            <uni-icons type="checkbox" size="20" color="#ffffff"></uni-icons>确认
          </button>
          <button @tap="cancelNicknameUpdate" class="btn-cancel">
            <uni-icons type="close" size="20" color="#666666"></uni-icons>取消
          </button>
        </view>
      </view>
    </view>
    <!-- 用户信息end -->

    <view class="stats-card">
      <view class="stat-item" @tap="toPraise">
        <uni-icons type="hand-up-filled" size="48" color="#f56a00" class="stat-icon"></uni-icons>
        <view class="stat-number">{{ totalLikes }}</view>
        <view class="stat-label">超赞</view>
      </view>
      <view class="stat-item" @tap="toAttention">
        <uni-icons type="star-filled" size="48" color="#1890ff" class="stat-icon"></uni-icons>
        <view class="stat-number">5</view>
        <view class="stat-label">关注数</view>
      </view>
      <view class="stat-item" @tap="toFans">
        <uni-icons type="person-filled" size="48" color="#52c41a" class="stat-icon"></uni-icons>
        <view class="stat-number">0</view>
        <view class="stat-label">粉丝数</view>
      </view>
    </view>

    <!-- 设置详细 -->
    <view class="menu-card">
      <view class="menu-item" @tap="toIssue_page">
        <view class="menu-icon-container">
          <uni-icons type="list" size="40" color="#1890ff" class="menu-icon"></uni-icons>
        </view>
        <view class="menu-content">
          <text>我的发布</text>
          <view class="menu-badge">19</view>
        </view>
        <uni-icons type="right" size="28" color="#cccccc" class="menu-arrow"></uni-icons>
      </view>

      <view class="menu-item" @tap="toPay">
        <view class="menu-icon-container">
          <uni-icons type="wallet" size="40" color="#fa8c16" class="menu-icon"></uni-icons>
        </view>
        <view class="menu-content">
          <text>我的支付</text>
        </view>
        <uni-icons type="right" size="28" color="#cccccc" class="menu-arrow"></uni-icons>
      </view>

      <view class="menu-item" @tap="toSale">
        <view class="menu-icon-container">
          <uni-icons type="paperplane" size="40" color="#52c41a" class="menu-icon"></uni-icons>
        </view>
        <view class="menu-content">
          <text>我的卖出</text>
          <view class="menu-badge">99</view>
        </view>
        <uni-icons type="right" size="28" color="#cccccc" class="menu-arrow"></uni-icons>
      </view>

      <view class="menu-item" @tap="toBuy">
        <view class="menu-icon-container">
          <uni-icons type="cart" size="40" color="#722ed1" class="menu-icon"></uni-icons>
        </view>
        <view class="menu-content">
          <text>我买到的</text>
          <view class="menu-badge">1</view>
        </view>
        <uni-icons type="right" size="28" color="#cccccc" class="menu-arrow"></uni-icons>
      </view>

      <view class="menu-item" @tap="toAddress">
        <view class="menu-icon-container">
          <uni-icons type="location" size="40" color="#eb2f96" class="menu-icon"></uni-icons>
        </view>
        <view class="menu-content">
          <text>收货地址</text>
        </view>
        <uni-icons type="right" size="28" color="#cccccc" class="menu-arrow"></uni-icons>
      </view>

      <view class="menu-item" @tap="toCollect">
        <view class="menu-icon-container">
          <uni-icons type="heart" size="40" color="#f5222d" class="menu-icon"></uni-icons>
        </view>
        <view class="menu-content">
          <text>我的收藏</text>
          <view class="menu-badge">39</view>
        </view>
        <uni-icons type="right" size="28" color="#cccccc" class="menu-arrow"></uni-icons>
      </view>

      <view class="menu-item" @tap="toFeedback">
        <view class="menu-icon-container">
          <uni-icons type="chat" size="40" color="#13c2c2" class="menu-icon"></uni-icons>
        </view>
        <view class="menu-content">
          <text>意见反馈</text>
        </view>
        <uni-icons type="right" size="28" color="#cccccc" class="menu-arrow"></uni-icons>
      </view>
    </view>

    <!-- 退出按钮 -->
    <view class="logout-btn" @tap="logout">
      <uni-icons type="redo" size="28" color="#f5222d" class="logout-icon"></uni-icons>
      <text>退出登录</text>
    </view>

    <!-- tabbar 预留高度 -->
    <view class="cu-tabbar-height"></view>
  </view>
</template>

<script>
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue'
export default {
  name: 'MyPage',
  components: {
    uniIcons
  },
  data() {
    return {
      avatar: "https://s21.ax1x.com/2025/03/18/pEdfnjP.jpg",
      nickname: "", // 用户昵称
      isNicknameModalVisible: false, // 控制弹框显示
      newNickname: "", // 新昵称的临时存储
      totalLikes: 0,
    };
  },
  methods: {
    // 清除全部缓存
    clearAllStore(res) {
      uni.showModal({
        title: "清除缓存",
        content: "是否要清除全部缓存!",
        success: function (res) {
          if (res.confirm) {
            uni.clearStorage({
              success: function (res) {
                uni.showToast({
                  title: "清除成功",
                  duration: 1000,
                });
              },
              fail: function (res) {
                uni.showToast({
                  title: "清除失败",
                  icon: "none",
                  duration: 1000,
                });
              },
            });
          }
        },
      });
    },

    // 退出登录
    logout() {
      uni.showModal({
        title: "退出登录",
        content: "确定要退出当前账号吗？",
        success: (res) => {
          if (res.confirm) {
            // 清除 token、清除用户信息
            uni.removeStorageSync("token");
            uni.removeStorageSync("userInfo");
            // 跳转到登录页
            uni.reLaunch({
              url: "/pages/auth/login",
            });
          }
        },
      });
    },

    // 读取用户信息（昵称）
    fetchUserProfile() {
      const token = uni.getStorageSync("token");
      if (!token) return;

      uni.request({
        url: "http://localhost:3000/api/user/profile",
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            const userInfo = res.data.user;
            this.nickname = userInfo.username; // 获取并显示昵称
            // 更新本地存储
            uni.setStorageSync("userInfo", userInfo);

            // 设置头像(确保使用完整URL)
            if (userInfo.avatar) {
              // 检查是否已经是完整URL
              if (userInfo.avatar.startsWith("http")) {
                this.avatar = userInfo.avatar;
              } else {
                // 拼接完整URL
                this.avatar = `http://localhost:3000/${userInfo.avatar.replace(
                  /\\/g,
                  "/"
                )}`;
              }
            }
          }
        },
        fail: () => {
          uni.showToast({
            title: "获取用户信息失败",
            icon: "none",
          });
        },
      });
    },

    // 修改昵称弹框
    editNickname() {
      this.isNicknameModalVisible = true;
      this.newNickname = this.nickname; // 默认显示当前昵称
      console.log("editNickname triggered"); // 确保事件被触发
    },

    // 确认修改昵称
    updateNickname() {
      console.log(this.newNickname);
      if (this.newNickname.trim() === "") {
        uni.showToast({
          title: "昵称不能为空",
          icon: "none",
        });
        return;
      }

      const token = uni.getStorageSync("token");
      if (!token) return;

      uni.request({
        url: "http://localhost:3000/api/user/update-nickname",
        method: "POST",
        data: {
          nickname: this.newNickname,
        },
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            this.nickname = this.newNickname; // 更新前端显示的昵称
            this.isNicknameModalVisible = false; // 关闭弹框
            uni.showToast({
              title: "昵称更新成功",
              icon: "success",
            });
          } else {
            uni.showToast({
              title: "更新失败",
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

    // 取消修改
    cancelNicknameUpdate() {
      console.log("取消修改");
      this.isNicknameModalVisible = false; // 关闭弹框
      this.newNickname = ""; // 清空输入框
    },

    toPay() {
      uni.navigateTo({
        url: "/pages/my/my_pay/my_pay",
      });
    },

    // 我的发布跳转
    toIssue_page() {
      uni.navigateTo({
        url: "/pages/my/my_issue/my_issue",
      });
    },

    toCollect() {
      uni.navigateTo({
        url: "/pages/my/my_collect/my_collect",
      });
    },

    toAddress() {
      uni.navigateTo({
        url: "/pages/my/my_address/my_address",
      });
    },

    toFeedback() {
      uni.navigateTo({
        url: "/pages/my/my_feedback/my_feedback",
      });
    },

    toPraise() {
      uni.showToast({
        title: "暂未开放",
        icon: "none",
      });
    },

    toAttention() {
      uni.showToast({
        title: "暂未开放",
        icon: "none",
      });
    },

    toFans() {
      uni.showToast({
        title: "暂未开放",
        icon: "none",
      });
    },
    toSale() {
      uni.navigateTo({
        url: "/pages/my/my_sale/my_sale",
      });
    },

    // 我买到的跳转
    toBuy() {
      uni.navigateTo({
        url: "/pages/my/my_buy/my_buy",
      });
    },

    // 点击头像的事件，弹出预览或更换头像的选项
    changeAvatar() {
      uni.showActionSheet({
        itemList: ["预览头像", "更换头像"],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 预览头像
            uni.previewImage({
              current: this.avatar,
              urls: [this.avatar],
            });
          } else if (res.tapIndex === 1) {
            // 选择新头像
            uni.chooseImage({
              count: 1,
              success: (chooseRes) => {
                const tempFilePath = chooseRes.tempFilePaths[0];

                // 显示上传中
                uni.showLoading({
                  title: "上传中...",
                });

                // 获取token
                const token = uni.getStorageSync("token");

                // 上传头像
                uni.uploadFile({
                  url: "http://localhost:3000/api/user/update-avatar",
                  filePath: tempFilePath,
                  name: "avatar",
                  header: {
                    Authorization: `Bearer ${token}`,
                  },
                  success: (uploadRes) => {
                    uni.hideLoading();

                    const data = JSON.parse(uploadRes.data);
                    if (uploadRes.statusCode === 200) {
                      // 更新头像地址
                      this.avatar = tempFilePath;

                      // 保存到本地存储
                      let userInfo = uni.getStorageSync("userInfo") || {};
                      userInfo.avatar = data.avatarUrl;
                      uni.setStorageSync("userInfo", userInfo);

                      uni.showToast({
                        title: "头像更新成功",
                        icon: "success",
                      });
                    } else {
                      uni.showToast({
                        title: data.message || "上传失败",
                        icon: "none",
                      });
                    }
                  },
                  fail: () => {
                    uni.hideLoading();
                    uni.showToast({
                      title: "网络错误，请重试",
                      icon: "none",
                    });
                  },
                });
              },
              fail: () => {
                uni.showToast({
                  title: "选择失败",
                  icon: "none",
                });
              },
            });
          }
        },
        fail: (err) => {
          console.log("操作取消", err);
        },
      });
    },

    // 跳转到个人详情
    toMy_detail() {
      uni.navigateTo({
        url: "/pages/my/my_detail/my_detail",
      });
    },

    // 获取点赞总数
    fetchUserLikes() {
      const token = uni.getStorageSync("token");
      if (!token) return;

      uni.request({
        url: "http://localhost:3000/api/my/like",
        header: {
          Authorization: `Bearer ${token}`,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            this.totalLikes = res.data.total_likes; // 更新 totalLikes
          }
        },
        fail: () => {
          uni.showToast({
            title: "获取点赞数失败",
            icon: "none",
          });
        },
      });
    },
  },
  onShow() {
    this.isNicknameModalVisible = false;
    this.fetchUserProfile(); // 页面显示时获取用户信息
    this.fetchUserLikes(); // 页面显示时获取点赞总数
  }
};
</script>

<style scoped>
/* 全新美化的样式 */

/* 用户信息部分 */
.user-center-bg {
  background: url('/static/img/dzq.png') center center no-repeat;
  background-size: cover;
  /* 确保图片覆盖整个区域 */
  height: 400rpx;
  display: flex;
  justify-content: center;
  padding-top: 60rpx;
  overflow: hidden;
  position: relative;
  flex-direction: column;
  align-items: center;
  color: #fff;
  font-weight: 300;
}

.user-center-container {
  position: relative;
  height: 400rpx;
  overflow: hidden;
}

.bg-image {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.user-center-content {
  position: relative;
  z-index: 2;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  padding-top: 60rpx;
  flex-direction: column;
  align-items: center;
  color: #fff;
  font-weight: 300;
}

.avatar-image {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
  transition: transform 0.3s;
}

.avatar-image:active {
  transform: scale(0.95);
}

.nickname-container {
  display: flex;
  align-items: center;
  margin-top: 20rpx;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
}

.nickname-container text {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.edit-icon {
  font-size: 24rpx;
}

/* 统计卡片 */
.stats-card {
  display: flex;
  justify-content: space-around;
  background-color: #fff;
  margin: -40rpx 30rpx 30rpx;
  border-radius: 16rpx;
  padding: 30rpx 0;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 10;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
}

.stat-icon {
  font-size: 48rpx;
  margin-bottom: 10rpx;
}

.like-icon {
  color: #f56a00;
}

.star-icon {
  color: #1890ff;
}

.team-icon {
  color: #52c41a;
}

.stat-number {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.stat-label {
  font-size: 24rpx;
  color: #999;
  margin-top: 6rpx;
}

/* 菜单卡片 */
.menu-card {
  background-color: #fff;
  margin: 30rpx;
  border-radius: 16rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 30rpx 24rpx;
  position: relative;
}

.menu-item:after {
  content: '';
  position: absolute;
  left: 90rpx;
  right: 0;
  bottom: 0;
  height: 1px;
  background-color: #f0f0f0;
}

.menu-item:last-child:after {
  display: none;
}

.menu-icon-container {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  border-radius: 16rpx;
  margin-right: 24rpx;
}

.menu-icon {
  font-size: 40rpx;
}

.primary-icon {
  color: #1890ff;
}

.wallet-icon {
  color: #fa8c16;
}

.solution-icon {
  color: #52c41a;
}

.cart-icon {
  color: #722ed1;
}

.location-icon {
  color: #eb2f96;
}

.heart-icon {
  color: #f5222d;
}

.comment-icon {
  color: #13c2c2;
}

.menu-content {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 28rpx;
  color: #333;
}

.menu-badge {
  background-color: #f5222d;
  color: white;
  border-radius: 20rpx;
  font-size: 24rpx;
  padding: 2rpx 14rpx;
  margin-right: 20rpx;
}

.menu-arrow {
  color: #ccc;
  font-size: 28rpx;
}

/* 退出按钮样式 */
.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  color: #f5222d;
  margin: 40rpx 30rpx;
  padding: 24rpx 0;
  border-radius: 16rpx;
  font-size: 30rpx;
  border: 1px solid #f5222d;
  box-shadow: 0 4rpx 12rpx rgba(245, 34, 45, 0.15);
}

.logout-icon {
  margin-right: 10rpx;
}

/* 弹框样式优化 */
.nickname-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: white;
  padding: 40rpx;
  border-radius: 16rpx;
  width: 70%;
  text-align: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

/* .nickname-input {
    width: 100%;
    margin-top: 20rpx;
    padding: 5rpx;
    border: 1px solid #ccc;
    border-radius: 5rpx;
  } */
.nickname-input {
  width: 100%;
  height: 80rpx;
  margin: 30rpx 0;
  padding: 15rpx 20rpx;
  border: 1px solid #d9d9d9;
  border-radius: 8rpx;
  font-size: 32rpx;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 30rpx;
}

.btn-confirm,
.btn-cancel {
  padding: 16rpx 0;
  width: 35%;
  border-radius: 8rpx;
  font-size: 26rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-confirm {
  background-color: #1890ff;
  color: white;
  border: none;
}

.btn-cancel {
  background-color: white;
  color: #666;
  border: 1px solid #d9d9d9;
}
</style>
