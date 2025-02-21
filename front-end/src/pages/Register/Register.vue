<template>
    <div class="register">
      <h2>注册</h2>
      <form @submit.prevent="handleRegister">
        <div>
          <label>学生卡号:</label>
          <input type="text" v-model="student_id" required />
        </div>
        <div>
          <label>用户名:</label>
          <input type="text" v-model="username" required />
        </div>
        <div>
          <label>密码:</label>
          <input type="password" v-model="password" required />
        </div>
        <div>
          <label>学生卡照片:</label>
          <input type="file" @change="handleFileUpload" accept="image/*" required />
        </div>
        <button type="submit">注册</button>
      </form>
    </div>
  </template>
  
  <script>
  import authService from '../../services/authService';
  
  export default {
    name: 'Register',
    data() {
      return {
        student_id: '',
        username: '',
        password: '',
        student_card: null
      };
    },
    methods: {
      handleFileUpload(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = e => {
          this.student_card = e.target.result;
        };
        reader.readAsDataURL(file);
      },
      handleRegister() {
        const data = {
          student_id: this.student_id,
          username: this.username,
          password: this.password,
          student_card: this.student_card
        };
        authService.register(data)
          .then(response => {
            alert('注册成功');
            this.$router.push('/login');
          })
          .catch(error => {
            console.error('注册失败', error);
          });
      }
    }
  };
  </script>
  
  <style scoped>
  /* 根据需要添加样式 */
  </style>
  