<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <uni-icons type="wallet" size="50" color="#007aff"></uni-icons>
      <text class="title">请上传你的收款码</text>
    </view>

    <!-- 描述 -->
    <text class="desc">请上传你的收款二维码，确保清晰可扫描</text>

    <!-- 上传区域 -->
    <view class="upload-section">
      <view class="upload-container" @tap="uploadImage">
        <!-- 有图片时显示 -->
        <image
          v-if="wechatPayCode"
          :src="wechatPayCode"
          class="pay-code-img"
        ></image>

        <!-- 无图片时显示 -->
        <view v-else class="upload-placeholder">
          <uni-icons type="image" size="80" color="#d3d3d3"></uni-icons>
          <text class="placeholder-text">请选择你的收款图片</text>
        </view>
      </view>
    </view>

    <!-- 上传须知 -->
    <view class="tips">
      <text class="tip-title">📌 上传须知：</text>
      <text class="tip-text">✔ 请确保二维码清晰可扫描</text>
      <text class="tip-text">✔ 支持 JPG、PNG 格式</text>
      <text class="tip-text">✔ 图片仅用于收款，不会对外展示</text>
    </view>

    <!-- 操作按钮 -->
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
      wechatPayCode: "", // 存储上传的收款码图片
    };
  },
  methods: {
    // 选择图片上传
    uploadImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.wechatPayCode = res.tempFilePaths[0];
          uni.showToast({ title: "上传成功", icon: "success" });
        },
        fail: () => {
          uni.showToast({ title: "取消上传", icon: "none" });
        },
      });
    },
  },
};
</script>

<style scoped>
/* 整体页面背景 */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 40rpx;
  background-color: #f0f0f0;
  min-height: 100vh;
}

/* 头部 */
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

/* 描述 */
.desc {
  font-size: 20rpx;
  color: #555;
  text-align: center;
  margin-bottom: 20rpx;
}

/* 上传区域 */
.upload-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.upload-container {
  width: 450rpx;
  height: 450rpx;
  border-radius: 20rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.upload-container:active {
  background-color: #f8f8f8;
}

/* 已上传的图片 */
.pay-code-img {
  width: 100%;
  height: 100%;
  border-radius: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

/* 未上传时的提示 */
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

/* 上传须知 */
.tips {
  width: 90%;
  background-color: #fff;
  padding: 30rpx;
  margin-top: 20rpx;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  text-align: left;
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

/* 按钮区域 */
.button-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 40rpx;
}

/* 按钮 */
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
  gap: 10rpx;
}

.bg-blue {
  background-color: #007aff;
  color: #fff;
}

.margin-top {
  margin-top: 20rpx;
}
</style>
