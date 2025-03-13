<!-- filepath: /D:/document/4c2025/second_hand_trade/second_hand_trade_frontend/src/pages/auth/login.vue -->
<template>
  <view class="login-container">
    <!-- 顶部背景装饰 -->
    <view class="top-bg"></view>

    <view class="logo-box">
      <image class="logo" src="/static/img/login-logo.png" mode="aspectFit"></image>
      <text class="title">校园二手交易平台</text>
    </view>

    <view class="form-box">
      <view class="input-group">
        <view class="icon-box">
          <text class="iconfont icon-user"></text>
        </view>
        <input class="input" type="text" v-model="student_id" placeholder="请输入学号" />
      </view>

      <view class="input-group">
        <view class="icon-box">
          <text class="iconfont icon-lock"></text>
        </view>
        <input class="input" type="password" v-model="password" placeholder="请输入密码" />
      </view>

      <button class="login-btn" @click="handleLogin">登录</button>
      
      <view class="links">
        <navigator url="/pages/auth/register" open-type="navigate" class="register-link">
          没有账号？立即注册 >
        </navigator>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      student_id: '',
      password: ''
    }
  },
  methods: {
    handleLogin() {
      if (!this.student_id) {
        uni.showToast({
          title: '请输入学号',
          icon: 'none'
        })
        return
      }
      if (!this.password) {
        uni.showToast({
          title: '请输入密码',
          icon: 'none'
        })
        return
      }

      // 仅有前端测试：验证用户输入与本地存储的测试用户是否匹配
    // try {
    //   // 获取注册时保存的测试用户数据
    //   const testUser = uni.getStorageSync('test_user');
    //   
    //   if (testUser && testUser.student_id === this.student_id && testUser.password === this.password) {
    //     // 登录成功，生成模拟的token
    //     const mockToken = 'mock_token_' + Date.now();
    //     uni.setStorageSync('token', mockToken);
    //     uni.setStorageSync('current_user', {
    //       student_id: testUser.student_id,
    //       username: testUser.username
    //     });
    //     
    //     // 显示成功提示
    //     uni.showToast({
    //       title: '登录成功',
    //       icon: 'success'
    //     });
    //     
    //     // 跳转到首页
    //     setTimeout(() => {
    //       uni.switchTab({
    //         url: '/pages/home/home'
    //       });
    //     }, 1500);
    //   } else {
    //     // 登录失败提示
    //     uni.showToast({
    //       title: '学号或密码错误',
    //       icon: 'none'
    //     });
    //   }
    // } catch(e) {
    //   console.error('读取本地存储数据失败:', e);
    //   // 如果没有找到测试用户数据，可以默认成功登录（测试模式）
    //   const mockToken = 'default_mock_token_' + Date.now();
    //   uni.setStorageSync('token', mockToken);
    //   
    //   uni.showToast({
    //     title: '测试模式：登录成功',
    //     icon: 'success'
    //   });
    //   
    //   setTimeout(() => {
    //     uni.switchTab({
    //       url: '/pages/home/home'
    //     });
    //   }, 1500);
    // }



      //实际前后端协同测试 调用登录API
      uni.request({
        url: 'http://localhost:3000/api/login',
        method: 'POST',
        data: {
          student_id: this.student_id,
          password: this.password
        },
        success: (res) => {
          if (res.data.token) {
            // 保存token
            uni.setStorageSync('token', res.data.token)
            // 跳转到首页
            uni.switchTab({
              url: '/pages/home/home'
            })
          } else {
            uni.showToast({
              title: '登录失败，请检查用户名和密码',
              icon: 'none'
            })
          }
        },
        fail: () => {
          uni.showToast({
            title: '网络错误，请稍后再试',
            icon: 'none'
          })
        }
      })
    }
  }
}
</script>

<style>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
  position: relative;
}

.top-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 30vh;
  background: linear-gradient(135deg, #5677FC, #8EACFF);
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
}

.logo-box {
  margin-top: 15vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.logo {
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.title {
  margin-top: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-box {
  width: 85%;
  padding: 30px 20px;
  margin-top: 30px;
  background-color: #fff;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.input-group {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 25px;
  padding-bottom: 5px;
}

.icon-box {
  width: 40px;
  text-align: center;
}

.iconfont {
  font-size: 22px;
  color: #5677FC;
}

.input {
  flex: 1;
  height: 45px;
  font-size: 16px;
}

.login-btn {
  height: 45px;
  line-height: 45px;
  font-size: 18px;
  background: linear-gradient(135deg, #5677FC, #8EACFF);
  color: #fff;
  border-radius: 25px;
  box-shadow: 0 4px 10px rgba(86, 119, 252, 0.3);
  margin-top: 30px;
}

.links {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.register-link {
  font-size: 14px;
  color: #5677FC;
}
</style>
