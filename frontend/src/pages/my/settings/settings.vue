<template>
  <view class="settings-container">
    <view class="header">
      <view class="back-button" @tap="goBack">
        <uni-icons type="left" size="24" color="#333"></uni-icons>
      </view>
      <text class="header-title">个人设置</text>
    </view>
    
    <view class="info-card">
      <view class="card-title">
        <uni-icons type="person" size="20" color="#1890ff"></uni-icons>
        <text>个人信息</text>
      </view>
      
      <view class="info-item">
        <text class="info-label">学号</text>
        <text class="info-value">{{ userInfo.student_id || '未设置' }}</text>
      </view>
      
      <view class="info-item">
        <text class="info-label">用户名</text>
        <text class="info-value">{{ userInfo.username || '未设置' }}</text>
      </view>
      
      <view class="info-item">
        <text class="info-label">密码</text>
        <text class="info-value">••••••••</text>
      </view>
    </view>
    
    <view class="password-card" @tap="showPasswordModal">
      <view class="card-button">
        <uni-icons type="locked" size="20" color="#1890ff"></uni-icons>
        <text>修改密码</text>
        <uni-icons type="right" size="16" color="#cccccc" class="right-icon"></uni-icons>
      </view>
    </view>
    
    <!--修改密码弹窗 -->
    <view v-if="passwordModalVisible" class="modal-overlay">
        <view class="password-modal">
            <view class="modal-header">
                <text class="modal-title">修改密码</text>
            </view>

            <view class="modal-content">
                <view class="input-group">
                    <text class="input-label">当前密码</text>
                    <input type="password" v-model="passwordForm.oldPassword" placeholder="请输入当前密码" class="modal-input" />
                </view>

                <view class="input-group">
                    <text class="input-label">新密码</text>
                    <input type="password" v-model="passwordForm.newPassword" placeholder="请输入新密码" class="modal-input" />
                </view>

                <view class="input-group">
                    <text class="input-label">确认密码</text>
                    <input type="password" v-model="passwordForm.confirmPassword" placeholder="请再次输入新密码" class="modal-input" />
                </view>
            </view>

            <view class="modal-footer">
                <button class="btn-cancel" @tap="hidePasswordModal">取消</button>
            <button class="btn-confirm" @tap="updatePassword">确认</button>
    </view>
      </view >
    </view >
  </view >
</template >

<script>
export default {
  data() {
    return {
      userInfo: {
        student_id: '',
        username: ''
      },
      passwordModalVisible: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  },
  
  methods: {
    goBack() {
      uni.navigateBack();
    },
    
    // 获取用户详细信息
    fetchUserDetails() {
      const token = uni.getStorageSync('token');
      if (!token) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }
      
      uni.request({
        url: 'http://localhost:3000/api/user/profile/detail',
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          if (res.statusCode === 200) {
            this.userInfo = res.data.user;
          } else {
            uni.showToast({
              title: '获取用户信息失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: '网络错误，请重试',
            icon: 'none'
          });
        }
      });
    },
    
    // 显示修改密码弹窗
    showPasswordModal() {
      this.passwordModalVisible = true;
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    },
    
    // 隐藏修改密码弹窗
    hidePasswordModal() {
      this.passwordModalVisible = false;
    },
    
    // 提交更新密码请求
    updatePassword() {
      // 表单验证
      if (!this.passwordForm.oldPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
        uni.showToast({
          title: '请填写完整密码信息',
          icon: 'none'
        });
        return;
      }
      
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        uni.showToast({
          title: '两次输入的新密码不一致',
          icon: 'none'
        });
        return;
      }
      
      // 提交修改密码请求
      const token = uni.getStorageSync('token');
      
      uni.request({
        url: 'http://localhost:3000/api/user/update-password',
        method: 'POST',
        header: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        },
        success: (res) => {
          if (res.statusCode === 200) {
            uni.showToast({
              title: '密码修改成功',
              icon: 'success'
            });
            this.hidePasswordModal();
            
            // 密码修改后，需要重新登录
            setTimeout(() => {
              uni.showModal({
                title: '提示',
                content: '密码已修改，请重新登录',
                showCancel: false,
                success: () => {
                  uni.removeStorageSync('token');
                  uni.removeStorageSync('userInfo');
                  uni.reLaunch({
                    url: '/pages/auth/login'
                  });
                }
              });
            }, 1500);
          } else {
            uni.showToast({
              title: res.data.message || '密码修改失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: '网络错误，请重试',
            icon: 'none'
          });
        }
      });
    }
  },
  
  onShow() {
    this.fetchUserDetails();
  }
}
</script>

<style scoped>
.settings-container {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  height: 90rpx;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  position: relative;
}

.back-button {
  position: absolute;
  left: 30rpx;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 34rpx;
  font-weight: 500;
}

.info-card, .password-card {
  background-color: #ffffff;
  margin: 30rpx;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.card-title {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.card-title text {
  margin-left: 10rpx;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #666;
  font-size: 28rpx;
}

.info-value {
  color: #333;
  font-size: 28rpx;
}

.card-button {
  display: flex;
  align-items: center;
  padding: 10rpx 0;
}

.card-button text {
  flex: 1;
  margin-left: 10rpx;
  font-size: 30rpx;
  color: #333;
}

.right-icon {
  margin-left: 10rpx;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.password-modal {
  width: 80%;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.modal-header {
  padding: 30rpx;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 500;
}

.modal-content {
  padding: 30rpx;
}

.input-group {
  margin-bottom: 30rpx;
}

.input-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.modal-input {
  width: 100%;
  height: 80rpx;
  border: 1px solid #e8e8e8;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
}

.modal-footer {
  display: flex;
  border-top: 1px solid #f0f0f0;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  font-size: 30rpx;
}

.btn-cancel {
  color: #666;
  border-right: 1px solid #f0f0f0;
}

.btn-confirm {
  color: #1890ff;
}
</style>