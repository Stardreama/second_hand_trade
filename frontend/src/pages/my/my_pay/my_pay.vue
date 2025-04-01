<template>
  <view class="container">
    <view class="header">
      <uni-icons type="wallet" size="50" color="#007aff"></uni-icons>
      <text class="title">请上传你的收款码</text>
    </view>

    <text class="desc">请上传你的收款二维码，确保清晰可扫描</text>

    <view class="upload-section">
      <view class="upload-container" @tap="uploadImage">
        <image
          v-if="wechatPayCode"
          :src="wechatPayCode"
          class="pay-code-img"
        ></image>
        <view v-else class="upload-placeholder">
          <uni-icons type="image" size="80" color="#d3d3d3"></uni-icons>
          <text class="placeholder-text">请选择你的收款图片</text>
        </view>
      </view>
    </view>

    <view class="button-section">
      <button
        v-if="wechatPayCode"
        class="cu-btn bg-blue margin-top"
        @tap="uploadImage"
      >
        <uni-icons type="image" size="26" color="#fff"></uni-icons> 修改图片
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      wechatPayCode: "",
    };
  },
  onLoad() {
    this.fetchQRCode();
  },
  methods: {
    async fetchQRCode() {
      const token = uni.getStorageSync("token");

      const res = await uni.request({
        url: "http://localhost:3000/api/my/my_pay",
        method: "GET",
        header: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        this.wechatPayCode = `http://localhost:3000${res.data.qrCode}`;
        console.log("wechatPayCode", this.wechatPayCode);
      }
    },
    async uploadImage() {
      uni.chooseImage({
        count: 1,
        success: async (chooseRes) => {
          const tempFilePath = chooseRes.tempFilePaths[0];
          const token = uni.getStorageSync("token");

          const uploadRes = await uni.uploadFile({
            url: "http://localhost:3000/api/my/my_pay/update",
            filePath: tempFilePath,
            name: "file",
            header: { Authorization: `Bearer ${token}` },
          });
          const data = JSON.parse(uploadRes.data);
          if (data.success) {
            this.wechatPayCode = `http://localhost:3000${data.qrCode}`;
          }
        },
      });
    },
  },
};
</script>
<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx;
  background-color: #f0f0f0;
  min-height: 100vh;
}
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}
.title {
  font-size: 55rpx;
  font-weight: bold;
  color: #333;
  margin-left: 10rpx;
}
.desc {
  font-size: 20rpx;
  color: #555;
  text-align: center;
  margin-bottom: 20rpx;
}
.upload-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}
.upload-container {
  width: 560rpx;
  height: 560rpx;
  border-radius: 20rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.1);
}
.pay-code-img {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
}
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.placeholder-text {
  font-size: 28rpx;
  color: #aaa;
  margin-top: 10rpx;
}
.tips {
  width: 90%;
  background-color: #fff;
  padding: 30rpx;
  margin-top: 20rpx;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}
.tip-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #007aff;
}
.tip-text {
  font-size: 26rpx;
  color: #444;
  margin-top: 10rpx;
}
.button-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 40rpx;
}
.cu-btn {
  width: 80%;
  height: 80rpx;
  font-size: 32rpx;
  border-radius: 10rpx;
  text-align: center;
  line-height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.bg-blue {
  background-color: #007aff;
  color: #fff;
}
.margin-top {
  margin-top: 20rpx;
}
</style>
