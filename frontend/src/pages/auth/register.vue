<!-- filepath: /D:/document/4c2025/second_hand_trade/second_hand_trade_frontend/src/pages/auth/register.vue -->
<template>
  <view class="register-container">
    <!-- 顶部背景装饰 -->
    <view class="top-bg"></view>

    <view class="header">
      <text class="title">注册账号</text>
      <text class="subtitle">注册即可体验校园二手交易服务</text>
    </view>

    <view class="form-box">
      <view class="input-group">
        <view class="icon-box">
          <text class="iconfont icon-idcard"></text>
        </view>
        <input class="input" type="text" v-model="student_id" placeholder="请输入学号" />
      </view>

      <view class="input-group">
        <view class="icon-box">
          <text class="iconfont icon-user"></text>
        </view>
        <input class="input" type="text" v-model="username" placeholder="请输入用户名" />
      </view>

      <view class="input-group">
        <view class="icon-box">
          <text class="iconfont icon-lock"></text>
        </view>
        <input class="input" type="password" v-model="password" placeholder="请设置密码" />
      </view>

      <view class="input-group">
        <view class="icon-box">
          <text class="iconfont icon-lock"></text>
        </view>
        <input class="input" type="password" v-model="confirmPassword" placeholder="请确认密码" />
      </view>

      <view class="upload-box">
        <text class="upload-title">上传学生卡照片</text>
        <view class="upload-area" @click="chooseImage">
          <image v-if="studentCardImage" :src="studentCardImage" mode="aspectFit" class="preview-image"></image>
          <view v-else class="upload-placeholder">
            <text class="iconfont icon-camera"></text>
            <text class="upload-text">点击上传</text>
          </view>
        </view>
      </view>

      <button class="register-btn" @click="handleRegister">注册</button>

      <view class="links">
        <navigator url="/pages/auth/login" open-type="navigate" class="login-link">
          已有账号？立即登录 >
        </navigator>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      student_id: "",
      username: "",
      password: "",
      confirmPassword: "",
      studentCardImage: "",
    };
  },
  methods: {
    // 添加新方法用于验证密码强度
    validatePassword(password) {
      // 检查密码长度是否至少为8位
      if (password.length < 8) {
        return { valid: false, message: "密码长度至少为8位" };
      }

      // 检查是否包含至少一个数字
      if (!/\d/.test(password)) {
        return { valid: false, message: "密码必须包含至少一个数字" };
      }

      // 检查是否包含至少一个字母
      if (!/[a-zA-Z]/.test(password)) {
        return { valid: false, message: "密码必须包含至少一个字母" };
      }

      // 所有检查都通过
      return { valid: true };
    },
    // 优化图片选择方法，添加提示
    chooseImage() {
      uni.showToast({
        title: '请上传清晰的学生卡照片',
        icon: 'none',
        duration: 2000
      });

      setTimeout(() => {
        uni.chooseImage({
          count: 1,
          sizeType: ["compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            this.studentCardImage = res.tempFilePaths[0];
            uni.showToast({
              title: '学生卡照片上传成功',
              icon: 'success',
              duration: 1500
            });
          },
        });
      }, 1000);
    },
    handleRegister() {
      // 表单验证
      if (!this.student_id) {
        uni.showToast({ title: "请输入学号", icon: "none" });
        console.error("学号未输入");
        return;
      }
      if (!this.username) {
        uni.showToast({ title: "请输入用户名", icon: "none" });
        console.error("用户名未输入");
        return;
      }
      if (!this.password) {
        uni.showToast({ title: "请设置密码", icon: "none" });
        console.error("密码未输入");
        return;
      }
      // 添加密码强度验证
      const passwordValidation = this.validatePassword(this.password);
      if (!passwordValidation.valid) {
        uni.showToast({ title: passwordValidation.message, icon: "none" });
        console.error(passwordValidation.message);
        return;
      }

      if (this.password !== this.confirmPassword) {
        uni.showToast({ title: "两次密码输入不一致", icon: "none" });
        console.error("两次密码输入不一致");
        return;
      }
      if (!this.studentCardImage) {
        uni.showToast({ title: "请上传学生卡照片", icon: "none" });
        console.error("照片未上传");
        return;
      }

      // 显示加载中提示
      uni.showLoading({
        title: "正在验证学生卡信息...",
        mask: true,
      });
      // 直接使用统一的文件上传接口
      this.uploadAndRegister();
    },
    uploadAndRegister() {
      uni.uploadFile({
        url: "http://localhost:3000/api/register", // 后端注册接口地址
        filePath: this.studentCardImage,           // 图片文件路径
        name: "student_card",                      // 与后端 multer 中间件配置一致的字段名
        formData: {
          student_id: this.student_id,
          username: this.username,
          password: this.password,
        },
        success: (res) => {
          uni.hideLoading(); // 隐藏加载提示
          console.log("注册响应:", res);

          try {
            // 解析响应数据
            const response = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;

            if (res.statusCode === 200) {
              uni.showToast({
                title: "注册成功",
                icon: "success",
                duration: 2000,
              });
              setTimeout(() => {
                uni.navigateTo({
                  url: "/pages/auth/login",
                });
              }, 2000);
            } else {
              uni.showToast({
                title: response.message || "注册失败，请重试",
                icon: "none",
                duration: 3000,
              });
            }
          } catch (error) {
            console.error("解析响应数据失败:", error);
            uni.showToast({
              title: "注册失败，请重试",
              icon: "none",
            });
          }
        },
        fail: (err) => {
          uni.hideLoading(); // 隐藏加载提示
          console.error("注册请求失败:", err);
          uni.showToast({
            title: "网络错误，请稍后再试",
            icon: "none",
          });
        },
      });
    },
  },
};
</script>

<style>
.register-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;
  position: relative;
}

.top-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 20vh;
  background: linear-gradient(135deg, #5677fc, #8eacff);
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
}

.header {
  margin-top: 30px;
  padding: 0 30px;
  z-index: 1;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
}

.subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10px;
  display: block;
}

.form-box {
  flex: 1;
  margin: 20px 20px 0 20px;
  padding: 30px 20px;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  z-index: 1;
}

.input-group {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
  padding-bottom: 5px;
}

.icon-box {
  width: 40px;
  text-align: center;
}

.iconfont {
  font-size: 22px;
  color: #5677fc;
}

.input {
  flex: 1;
  height: 45px;
  font-size: 16px;
}

.upload-box {
  margin: 20px 0;
}

.upload-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
  display: block;
}

.upload-area {
  width: 100%;
  height: 150px;
  border: 2px dashed #ccc;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-placeholder .iconfont {
  font-size: 40px;
  color: #ccc;
}

.upload-text {
  color: #999;
  margin-top: 10px;
}

.register-btn {
  height: 45px;
  line-height: 45px;
  font-size: 18px;
  background: linear-gradient(135deg, #5677fc, #8eacff);
  color: #fff;
  border-radius: 25px;
  box-shadow: 0 4px 10px rgba(86, 119, 252, 0.3);
  margin-top: 20px;
}

.links {
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
}

.login-link {
  font-size: 14px;
  color: #5677fc;
}
</style>
