<template>
  <view>
    <!-- 用户信息 -->
    <view class="UCenter-bg" catchtap="toMy_detail">
      <!-- 使用动态绑定 src，并给图片绑定点击事件 -->
      <image :src="avatar" class="png" @tap.stop="changeAvatar"></image>
      <view class="nickname-container" @tap.stop="editNickname">
        <text>{{ nickname || "Amibition" }}</text>
      </view>

      <image src="https://raw.githubusercontent.com/weilanwl/ColorUI/master/demo/images/wave.gif" mode="scaleToFill"
        class="gif-wave"></image>
    </view>
    <!-- 修改昵称弹框 -->
    <view v-if="isNicknameModalVisible" class="nickname-modal">
      <view class="modal-content">
        <text>现在您可以修改自己的昵称啦~</text>
        <input v-model="newNickname" placeholder="请输入新的昵称" class="nickname-input" />
        <view class="modal-actions" @tap.stop>
          <button @tap="updateNickname" class="btn-confirm">确认</button>
          <button @tap="cancelNicknameUpdate" class="btn-cancel">取消</button>
        </view>
      </view>
    </view>
    <!-- 用户信息end -->

    <view class="padding flex text-center text-grey bg-white shadow-warp">
      <view class="flex flex-sub flex-direction solid-right" bindtap="toPraise">
        <view class="text-xxl text-orange">{{ totalLikes }}</view>
        <view class="margin-top-sm">
          <text class="cuIcon-attentionfill"></text> 超赞
        </view>
      </view>
      <view class="flex flex-sub flex-direction solid-right" bindtap="toAttention">
        <view class="text-xxl text-blue">5</view>
        <view class="margin-top-sm">
          <text class="cuIcon-favorfill"></text>关注数
        </view>
      </view>
      <view class="flex flex-sub flex-direction" bindtap="toFans">
        <view class="text-xxl text-green">0</view>
        <view class="margin-top-sm">
          <text class="cuIcon-fork"></text>粉丝数
        </view>
      </view>
    </view>

    <!-- 设置详细 -->
    <view class="cu-list menu card-menu margin-top-xl margin-bottom-xl shadow-lg radius">
      <view class="cu-item arrow">
        <view class="content" @tap="toIssue_page">
          <text class="cuIcon-moneybagfill text-red"></text>
          <text class="text-grey">我的发布</text>
          <text class="num">19</text>
        </view>
      </view>
      <view class="cu-item arrow">
        <navigator class="content" hover-class="none" url="/pages/my/my_sale/my_sale">
          <text class="cuIcon-titles text-green"></text>
          <text class="text-grey">我的卖出</text>
          <text class="num">99</text>
        </navigator>
      </view>
      <view class="cu-item arrow">
        <navigator class="content" hover-class="none" url="/pages/my/my_buy/my_buy">
          <text class="cuIcon-formfill text-green"></text>
          <text class="text-grey">我买到的</text>
          <text class="num">1</text>
        </navigator>
      </view>
      <view class="cu-item arrow">
        <view class="content" @tap="toAddress">
          <text class="cuIcon-locationfill text-grey"></text>
          <text class="text-grey">收货地址</text>
        </view>
      </view>
      <view class="cu-item arrow">
        <view class="content" @tap="toCollect">
          <text class="cuIcon-appreciatefill text-red"></text>
          <text class="text-grey">我的收藏</text>
          <text class="num">39</text>
        </view>
      </view>
      <view class="cu-item arrow">
        <view class="content" @tap="toFeedback">
          <text class="cuIcon-writefill text-cyan"></text>
          <text class="text-grey">意见反馈</text>
        </view>
      </view>
      <!-- <view class="cu-item arrow content">
        <button class="cu-btn content" @click="clearAllStore">
          <text class="cuIcon-creativefill text-orange"></text>
          <text class="text-grey">清除缓存</text>
        </button>
      </view> -->
    </view>

    <!-- 红色的退出按钮 -->
    <view class="logout-btn" @tap="logout">
      <text>退出</text>
    </view>

    <!-- tabbar 预留高度 -->
    <view class="cu-tabbar-height"></view>
    <!-- 设置详细end -->
  </view>
</template>

<script>
export default {
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
    clearAllStore: function (res) {
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
            // 这里可做清除 token、清除用户信息等操作
            uni.removeStorageSync("token");
            uni.removeStorageSync("userInfo");
            // 跳转到登录页，也可以选择 switchTab 或 reLaunch 根据需要来做
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
      console.log('editNickname triggered');  // 确保事件被触发
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

    // 我的发布跳转
    toIssue_page: function () {
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
    // 跳转到个人详情（此处仍保留原有逻辑）
    toMy_detail() {
      // 根据需求可在此处添加查看个人详情的逻辑
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
  },
};
</script>

<style scoped>
/* pages/my/my.wxss */

/* 用户信息部分 */
.UCenter-bg {
  background-image: url(https://image.weilanwl.com/color2.0/index.jpg);
  background-size: cover;
  height: 450rpx;
  display: flex;
  justify-content: center;
  padding-top: 40rpx;
  overflow: hidden;
  position: relative;
  flex-direction: column;
  align-items: center;
  color: #fff;
  font-weight: 300;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.3);
}

.UCenter-bg text {
  opacity: 0.8;
}

.UCenter-bg image {
  width: 200rpx;
  height: 200rpx;
}

.UCenter-bg .gif-wave {
  position: absolute;
  width: 100%;
  bottom: 0;
  left: 0;
  z-index: 99;
  mix-blend-mode: screen;
  height: 100rpx;
}

map,
.mapBox {
  left: 0;
  z-index: 99;
  mix-blend-mode: screen;
  height: 100rpx;
}

map,
.mapBox {
  width: 750rpx;
  height: 300rpx;
}

.text-xl image {
  height: 100rpx;
  width: 100rpx;
}

.png {
  border-radius: 100%;
}

.num {
  direction: rtl;
  margin-left: 58%;
  font-size: 25rpx;
}

/* 退出按钮样式 */
.logout-btn {
  background-color: red;
  color: #fff;
  width: 100%;
  text-align: center;
  font-size: 30rpx;
  padding: 20rpx 0;
  margin-bottom: 20rpx;
  border-radius: 8rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
}

/* 修改昵称的弹框样式 */
.nickname-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background-color: white;
  padding: 30rpx;
  border-radius: 10rpx;
  width: 80%;
  text-align: center;
  z-index: 10000;
}

.nickname-input {
  width: 100%;
  margin-top: 20rpx;
  padding: 5rpx;
  border: 1px solid #ccc;
  border-radius: 5rpx;
}

.modal-actions {
  display: flex;
  justify-content: space-around;
  margin-top: 20rpx;
}

.btn-confirm,
.btn-cancel {
  width: 30%;
  padding: 1rpx;
  background-color: #5cb85c;
  color: white;
  border-radius: 10rpx;
}

.btn-cancel {
  background-color: #d9534f;
}

.nickname-container {
  text-align: center;
}
</style>
