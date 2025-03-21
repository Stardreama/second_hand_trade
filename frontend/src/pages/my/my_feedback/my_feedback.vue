<template>
  <view class="container">
    <!-- 问题类型 -->
    <view class="section">
      <view class="section-title">问题类型</view>
      <view class="type-list">
        <view class="type-item" :class="{ 'active': selectedType === item.id }" v-for="item in typeList" :key="item.id"
          @tap="selectType(item.id)">
          {{ item.name }}
        </view>
      </view>
    </view>

    <!-- 问题描述 -->
    <view class="section">
      <view class="section-title">问题描述</view>
      <textarea class="feedback-content" v-model="content" placeholder="请详细描述您遇到的问题" maxlength="500" />
      <view class="word-count">{{ content.length }}/500</view>
    </view>

    <!-- 图片上传 -->
    <view class="section">
      <view class="section-title">上传图片(选填)</view>
      <view class="image-list">
        <view class="image-item" v-for="(item, index) in imageList" :key="index">
          <image :src="item" mode="aspectFill"></image>
          <text class="delete-btn" @tap="deleteImage(index)">×</text>
        </view>
        <view class="upload-btn" @tap="chooseImage" v-if="imageList.length < 4">
          <text class="cuIcon-cameraadd"></text>
        </view>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="section">
      <view class="section-title">联系方式(选填)</view>
      <input class="contact-input" v-model="contact" placeholder="请输入手机号/邮箱" />
    </view>

    <!-- 提交按钮 -->
    <button class="submit-btn" @tap="submitFeedback">提交反馈</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      typeList: [
        { id: 1, name: '功能异常' },
        { id: 2, name: '产品建议' },
        { id: 3, name: '其他问题' }
      ],
      selectedType: 1,
      content: '',
      imageList: [],
      contact: ''
    }
  },
  methods: {
    selectType(id) {
      this.selectedType = id
    },
    chooseImage() {
      uni.chooseImage({
        count: 4 - this.imageList.length,
        success: (res) => {
          this.imageList = [...this.imageList, ...res.tempFilePaths]
        }
      })
    },
    deleteImage(index) {
      this.imageList.splice(index, 1)
    },
    // 在script部分替换submitFeedback方法
    async submitFeedback() {
      if (!this.content) {
        uni.showToast({
          title: '请描述您的问题',
          icon: 'none'
        })
        return
      }
      // 获取用户ID
      const token = uni.getStorageSync('token');
      const userInfo = uni.getStorageSync('userInfo');
      const userId = userInfo ? userInfo.student_id : null;
      if (!userId && !token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        setTimeout(() => {
          uni.navigateTo({
            url: '/pages/auth/login'
          });
        }, 1500);
        return;
      }
      uni.showLoading({
        title: '提交中...'
      })
      console.log("123445754");
      // console.log("userid",this.$store.state.user.id);

      try {
        // 如果有图片，先上传到临时地址获取路径
        const uploadedImagePaths = [];


        if (this.imageList.length > 0) {
          for (const imagePath of this.imageList) {
            await new Promise((resolve, reject) => {
              uni.uploadFile({
                url: 'http://localhost:3000/api/feedback',
                filePath: imagePath,
                name: 'images',
                formData: {
                  issue_type: this.selectedType,
                  description: this.content,
                  contact: this.contact || '',
                  user_id: userId
                },
                success: (res) => {
                  if (res.statusCode === 201) {
                    resolve();
                  } else {
                    reject(new Error('提交失败'));
                  }
                },
                fail: reject
              });
            });
          }
        } else {
          // 无图片提交
          await uni.request({
            url: 'http://localhost:3000/api/feedback',
            method: 'POST',
            data: {
              issue_type: this.selectedType,
              description: this.content,
              contact: this.contact || '',
              user_id: userId
            }
          });
        }

        uni.hideLoading();
        uni.showToast({
          title: '提交成功',
          success: () => {
            setTimeout(() => {
              uni.switchTab({
                url: '/pages/my/my'
              });
            }, 1500);
          }
        });
      } catch (error) {
        console.error(error);
        uni.hideLoading();
        uni.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        });
      }
    }
  }
}
</script>

<style>
.container {
  padding: 30rpx;
  background: #f5f5f5;
  min-height: 100vh;
}

.section {
  background: #fff;
  border-radius: 12rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.type-list {
  display: flex;
  flex-wrap: wrap;
}

.type-item {
  padding: 15rpx 30rpx;
  background: #f5f5f5;
  border-radius: 30rpx;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
  font-size: 28rpx;
}

.type-item.active {
  background: #0081ff;
  color: #fff;
}

.feedback-content {
  width: 100%;
  height: 300rpx;
  background: #f5f5f5;
  padding: 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.word-count {
  text-align: right;
  font-size: 24rpx;
  color: #999;
  margin-top: 10rpx;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
}

.image-item {
  position: relative;
  width: 160rpx;
  height: 160rpx;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
}

.image-item image {
  width: 100%;
  height: 100%;
  border-radius: 8rpx;
}

.delete-btn {
  position: absolute;
  top: -20rpx;
  right: -20rpx;
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: 50%;
}

.upload-btn {
  width: 160rpx;
  height: 160rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  color: #999;
}

.contact-input {
  width: 100%;
  height: 80rpx;
  background: #f5f5f5;
  padding: 0 20rpx;
  border-radius: 12rpx;
  font-size: 28rpx;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  line-height: 88rpx;
  background: #0081ff;
  color: #fff;
  border-radius: 44rpx;
  margin-top: 60rpx;
}
</style>