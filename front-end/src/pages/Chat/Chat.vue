<template>
    <div class="chat">
      <h2>聊天</h2>
      <div class="messages">
        <div v-for="(msg, index) in messages" :key="index" class="message">
          <strong>{{ msg.sender }}:</strong> {{ msg.content }}
        </div>
      </div>
      <form @submit.prevent="sendMessage">
        <input type="text" v-model="newMessage" placeholder="输入消息..." required />
        <button type="submit">发送</button>
      </form>
    </div>
  </template>
  
  <script>
  export default {
    name: 'Chat',
    data() {
      return {
        messages: [],
        newMessage: '',
        socket: null
      };
    },
    created() {
      this.socket = new WebSocket('ws://localhost:8080');
      this.socket.onmessage = event => {
        const data = JSON.parse(event.data);
        this.messages.push(data);
      };
    },
    methods: {
      sendMessage() {
        const message = {
          sender: '当前用户', // 此处应替换为实际登录用户信息
          content: this.newMessage
        };
        this.socket.send(JSON.stringify(message));
        this.newMessage = '';
      }
    }
  };
  </script>
  
  <style scoped>
  .messages {
    height: 300px;
    overflow-y: auto;
    border: 1px solid #ccc;
    padding: 10px;
  }
  .message {
    margin-bottom: 5px;
  }
  </style>
  