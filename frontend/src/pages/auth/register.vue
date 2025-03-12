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
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.studentCardImage = res.tempFilePaths[0];
        },
      });
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
      if (this.password !== this.confirmPassword) {
        uni.showToast({ title: "两次密码输入不一致", icon: "none" });
        console.error("两次密码输入不一致");
        return;
      }
      if (!this.studentCardImage) {
        uni.showToast({ title: "请上传学生卡照片", icon: "none" });
        console.error("照片未输入");
        return;
      }

      // 检查当前环境
      // #ifdef APP-PLUS || MP
      // 在小程序或APP环境中，使用 getFileSystemManager
      this.processImageAndRegister();
      // #endif

      // #ifdef H5
      // 在H5环境中，直接使用图片路径或转换为base64
      this.registerInH5Environment();
      // #endif

      // #ifndef APP-PLUS || MP || H5
      // 其他环境，使用本地测试模式
      this.registerWithMockData();
      // #endif
    },

    // 小程序或APP环境中处理图片并注册
    processImageAndRegister() {
      uni.getFileSystemManager().readFile({
        filePath: this.studentCardImage,
        encoding: "base64",
        success: (res) => {
          this.submitRegistration(res.data);
        },
        fail: (err) => {
          console.error("图片处理失败:", err);
          uni.showToast({
            title: "图片处理失败，请重试",
            icon: "none",
          });
        },
      });
    },

    // H5环境中的注册处理
    registerInH5Environment() {
      console.log("在H5环境中注册");

      // 如果是通过uni.chooseImage获取的本地临时文件URL
      if (
        this.studentCardImage.startsWith("blob:") ||
        this.studentCardImage.startsWith("http")
      ) {
        // 创建一个新的FileReader
        const reader = new FileReader();

        // 先将图片URL转换为Blob对象
        uni.request({
          url: this.studentCardImage,
          method: "GET",
          responseType: "arraybuffer",
          success: (response) => {
            const blob = new Blob([response.data]);
            reader.onload = (e) => {
              // 获取base64字符串，去掉前缀 "data:image/xxx;base64,"
              const base64 = e.target.result.split(",")[1];
              this.submitRegistration(base64);
            };
            reader.onerror = () => {
              uni.showToast({
                title: "图片处理失败，请重试",
                icon: "none",
              });
            };
            // 读取Blob为DataURL
            reader.readAsDataURL(blob);
          },
          fail: (err) => {
            console.error("获取图片数据失败:", err);
            uni.showToast({
              title: "图片处理失败，请重试",
              icon: "none",
            });
          },
        });
      } else {
        // 如果是测试环境，可以使用一个占位符
        this.submitRegistration("test_image_base64");
      }
    },

    // 使用模拟数据进行测试
    // registerWithMockData() {
    //   console.log("使用模拟数据注册");
    //   // 保存测试用户数据到本地存储
    //   try {
    //     uni.setStorageSync("test_user", {
    //       student_id: this.student_id,
    //       username: this.username,
    //       password: this.password,
    //     });

    //     // 显示成功提示
    //     uni.showToast({
    //       title: "注册成功（测试模式）",
    //       icon: "success",
    //       duration: 2000,
    //     });

    //     // 2秒后跳转到登录页面
    //     setTimeout(() => {
    //       uni.navigateTo({
    //         url: "/pages/auth/login",
    //       });
    //     }, 2000);
    //   } catch (e) {
    //     uni.showToast({
    //       title: "注册失败，请重试",
    //       icon: "none",
    //     });
    //     console.error("本地存储数据失败:", e);
    //   }
    // },

    // 提交注册请求
    submitRegistration(imageBase64) {
      // 调用注册API
      uni.request({
        url: "http://localhost:3000/api/register", // 根据您的后端服务端口调整
        method: "POST",
        header: {
          "Content-Type": "application/json", // 确保设置正确的请求头
        },
        data: {
          student_id: this.student_id,
          username: this.username,
          password: this.password,
          student_card: imageBase64,
        },
        success: (res) => {
          console.log("注册响应:", res);
          if (res.statusCode === 200 && res.data.message === "注册成功") {
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
            // 显示具体错误信息
            uni.showToast({
              title: res.data.message || "注册失败，请重试",
              icon: "none",
            });
          }
        },
        fail: (err) => {
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
