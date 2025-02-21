<template>
    <div class="login">
      <h2>登录</h2>
      <form @submit.prevent="handleLogin">
        <div>
          <label>学生卡号:</label>
          <input type="text" v-model="student_id" required />
        </div>
        <div>
          <label>密码:</label>
          <input type="password" v-model="password" required />
        </div>
        <button type="submit">登录</button>
      </form>
    </div>
  </template>
  
  <script>
  import authService from '../../services/authService';
  import { mapActions } from 'vuex';
  
  export default {
    name: 'Login',
    data() {
      return {
        student_id: '',
        password: ''
      };
    },
    methods: {
      ...mapActions(['login']),
      handleLogin() {
        authService.login({ student_id: this.student_id, password: this.password })
          .then(response => {
            this.login(response.data);
            this.$router.push('/');
          })
          .catch(error => {
            console.error('登录失败', error);
          });
      }
    }
  };
  </script>
  
  <style scoped>
  /* 根据需要添加样式 */
  </style>
  