<template>
    <header class="header">
      <h1>校园二手交易平台</h1>
      <nav>
        <router-link to="/">首页</router-link>
        <router-link to="/login">登录</router-link>
        <router-link to="/register">注册</router-link>
      </nav>
    </header>
  </template>
  
  <script>
  export default {
    name: 'Header'
  };
  </script>
  
  <style scoped>
  .header {
    background-color: #f5f5f5;
    padding: 10px;
  }
  nav a {
    margin: 0 10px;
    text-decoration: none;
    color: #333;
  }
  </style>
  