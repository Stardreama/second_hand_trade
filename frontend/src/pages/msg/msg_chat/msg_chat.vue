<template>
  <view>
    <cu-custom bgColor="bg-gradual-blue" :isBack="true">
      <!-- <block slot="backText">返回</block> -->
      <block slot="content">{{ otherUserName }}</block>
    </cu-custom>

    <scroll-view scroll-y="true" class="chat-container" :scroll-top="scrollTop"
      :style="{ height: `calc(100vh - ${inputBottom + 100}rpx)` }" @scrolltoupper="loadMoreMessages"
      upper-threshold="50" ref="chatScrollView">
      <!-- 加载更多指示器 -->
      <view class="loading-more" v-if="isLoading">
        <text class="cuIcon-loading2 iconfont-spin"></text>
        <text class="margin-left-xs">加载中...</text>
      </view>

      <!-- 消息列表 -->
      <view class="cu-chat">
        <view v-for="(msg, index) in messages" :key="msg.message_id"
          :class="['cu-item', msg.sender_id === userInfo.student_id ? 'self' : '']">
          <!-- 左侧用户头像 -->
          <view class="cu-avatar radius"
            :style="{ 'background-image': `url(${msg.sender_id === userInfo.student_id ? userAvatar : otherUserAvatar})` }"
            v-if="msg.sender_id !== userInfo.student_id"></view>

          <!-- 消息内容 -->
          <view class="main">
            <!-- 图片消息 -->
            <view class="content bg-img" v-if="msg.image_url" @tap="previewImage(msg.image_url)"
              :class="{ 'self-image': msg.sender_id === userInfo.student_id }">
              <image v-if="msg.localImage" :src="msg.image_url" mode="widthFix"></image>
              <image v-else :src="getFullImageUrl(msg.image_url)" mode="widthFix"></image>
            </view>

            <!-- 文本消息 -->
            <view class="content" v-else
              :style="{ 'background-color': msg.sender_id === userInfo.student_id ? '#0081ff' : '#e2e7f4' }">
              <text>{{ msg.content }}</text>

              <!-- 添加已读状态图标 - 仅对自己发送的消息显示 -->
              <view class="message-status" v-if="msg.sender_id === userInfo.student_id">
                <text v-if="msg.is_read" class="cuIcon-check text-gray"></text>
              </view>
            </view>
          </view>

          <!-- 右侧用户头像 -->
          <view class="cu-avatar radius" :style="{ 'background-image': `url(${userAvatar})` }"
            v-if="msg.sender_id === userInfo.student_id"></view>
        </view>
      </view>

    </scroll-view>

    <!-- 输入框区域 -->
    <view class="cu-bar foot input" :style="[{ bottom: InputBottom + 'px' }]">
      <view class="action">
        <text class="cuIcon-pic text-grey" @tap="chooseImage"></text>
      </view>

      <input class="solid-bottom" :adjust-position="false" :focus="false" maxlength="300" cursor-spacing="10"
        v-model="messageText" @focus="InputFocus" @blur="InputBlur" @confirm="sendMessage" confirm-type="send"></input>

      <button class="cu-btn bg-blue shadow" @tap="sendMessage">发送</button>
    </view>
  </view>
</template>

<script>
// 引入Socket.io客户端
// 需要先运行: npm install socket.io-client
import io from 'socket.io-client';

export default {
  data() {
    return {
      socket: null,
      conversationId: '',
      otherUserId: '',
      productId: '',
      messages: [],
      messageText: '',
      InputBottom: 0,
      scrollTop: 0,
      userInfo: {},
      userAvatar: '../../static/img/default-avatar.png',
      otherUserAvatar: '../../static/img/default-avatar.png',
      otherUserName: '',
      webSocket: null,
      isLoading: false,
      page: 1,
      hasMoreMessages: true,
      currentPageId: null,
      readCheckTimer: null,
      lastReadCheckTime: 0
    };
  },

  onLoad(options) {
    this.conversationId = options.conversation_id;
    this.otherUserId = options.user_id;
    this.productId = options.product_id || '';
    this.loadOtherUserInfo();
    console.log("555554444545");
    console.log(this.otherUserName);
    console.log("2222222222222");

    //this.otherUserName = options.otherUserName || "未知用户";
    // 设置导航栏标题为对方的用户名
    if (this.otherUserName) {
      uni.setNavigationBarTitle({
        title: this.otherUserName
      });
    }
    //获取用户信息
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo) {
      this.userInfo = userInfo;
      this.userAvatar = this.getFullImageUrl(userInfo.avatar);
    }

    // 获取对方用户信息


    // 加载历史消息
    this.loadMessages();

    // 连接Socket.io
    this.connectSocket();

    // 标记现有消息为已读
    this.markMessagesAsRead();

    // 设置自动检查已读状态
    this.setupReadStatusCheck();
  },

  onShow() {
    if (this.otherUserName) {
      // 动态设置导航栏标题
      uni.setNavigationBarTitle({
        title: this.otherUserName
      });
    }
    console.log('msg_chat页面显示，当前会话ID:', this.conversationId);
    console.log('当前Socket.io状态:', this.socket ? (this.socket.connected ? '已连接' : '未连接') : '未初始化');

    // 每次显示页面时标记消息为已读
    if (this.socket && this.socket.connected) {
      this.markMessagesAsRead();
    }

    // 设置自动检查已读状态
    //this.setupReadStatusCheck();

    // 通知服务器用户正在查看会话
    if (this.socket && this.socket.connected) {
      this.socket.emit('viewing_conversation', {
        conversationId: this.conversationId
      });
    }
  },


  onUnload() {
    console.log('页面卸载');

    // 清除计时器
    if (this.readCheckTimer) {
      clearInterval(this.readCheckTimer);
      this.readCheckTimer = null;
    }

    // 关闭Socket.io连接
    if (this.socket) {
      this.socket.disconnect();
    }
  },
  onHide() {
    // 清除计时器
    if (this.readCheckTimer) {
      clearInterval(this.readCheckTimer);
      this.readCheckTimer = null;
    }
  },

  methods: {
    // 加载对方用户信息
    loadOtherUserInfo() {
      console.log("加载对方用户信息:", this.otherUserId);
      uni.request({
        url: `http://localhost:3000/api/user/${this.otherUserId}/info`,
        header: {
          'Authorization': `Bearer ${uni.getStorageSync('token')}`
        },
        success: (res) => {
          console.log("获取用户信息响应:", res);
          if (res.statusCode === 200) {
            this.otherUserName = res.data.username || '对方';
            this.otherUserAvatar = this.getFullImageUrl(res.data.avatar);
            // 成功获取用户信息后，立即设置导航栏标题
            uni.setNavigationBarTitle({
              title: this.otherUserName
            });
          } else {
            this.otherUserName = '对方';
            console.error("获取用户信息失败:", res.data);
          }
        },
        fail: (err) => {
          console.error("获取用户信息请求失败:", err);
          this.otherUserName = '对方';
        }
      });
    },

    // 加载历史消息
    loadMessages() {
      const token = uni.getStorageSync('token');
      if (!token) return;

      console.log("加载会话消息:", this.conversationId);

      uni.showLoading({ title: '加载中...' });
      uni.request({
        url: `http://localhost:3000/api/conversations/${this.conversationId}/messages`,
        header: {
          'Authorization': `Bearer ${token}`
        },
        success: (res) => {
          console.log("获取消息结果:", res);
          if (res.statusCode === 200) {
            this.messages = res.data;
            this.$nextTick(() => {
              this.scrollToBottom();
              // 标记消息为已读
              this.markMessagesAsRead();
            });
          } else {
            uni.showToast({
              title: '获取消息失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error("获取消息失败:", err);
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          });
        },
        complete: () => {
          uni.hideLoading();
        }
      });
    },

    // 加载更多历史消息
    loadMoreMessages() {
      if (!this.hasMoreMessages || this.isLoading) return;

      this.isLoading = true;
      this.page++;

      uni.request({
        url: `http://localhost:3000/api/conversations/${this.conversationId}/messages?page=${this.page}`,
        header: {
          'Authorization': `Bearer ${uni.getStorageSync('token')}`
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.length > 0) {
            // 将新消息添加到顶部
            this.messages = [...res.data, ...this.messages];
          } else {
            // 没有更多消息了
            this.hasMoreMessages = false;
          }
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    },

    // 发送消息
    sendMessage() {
      if (!this.messageText.trim()) {
        return; // 不发送空消息
      }

      if (!this.socket || !this.socket.connected) {
        uni.showToast({
          title: '连接已断开，请重试',
          icon: 'none'
        });
        return;
      }

      // 添加临时消息到UI
      const tempMessage = {
        message_id: 'temp_' + Date.now(),
        conversation_id: this.conversationId,
        sender_id: this.userInfo.student_id,
        content: this.messageText,
        created_at: new Date().toISOString(),
        is_read: false,
        temp: true
      };

      this.messages.push(tempMessage);

      // 通过Socket.io发送消息
      this.socket.emit('send_message', {
        conversationId: this.conversationId,
        content: this.messageText
      });

      // 清空输入框
      this.messageText = '';

      this.scrollToBottom();
    },

    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          console.log('选择的图片:', tempFilePath);

          // 生成一个唯一的临时ID
          const tempId = Date.now().toString();

          // 添加临时图片消息 - 使用本地文件路径而不是blob URL
          const tempMessage = {
            message_id: 'temp_' + tempId,
            conversation_id: this.conversationId,
            sender_id: this.userInfo.student_id,
            image_url: tempFilePath, // 使用本地文件路径显示临时图片
            created_at: new Date().toISOString(),
            is_read: false,
            temp: true,
            localImage: true // 标记为本地图片
          };
          console.log('临时图片消息:', tempMessage);

          this.messages.push(tempMessage);

          // 滚动到底部
          this.$nextTick(() => {
            this.scrollToBottom();
          });

          // 上传图片
          uni.uploadFile({
            url: 'http://localhost:3000/api/upload/chat',
            filePath: tempFilePath,
            name: 'image',
            header: {
              'Authorization': `Bearer ${uni.getStorageSync('token')}`
            },
            success: (uploadRes) => {
              try {
                const data = JSON.parse(uploadRes.data);
                if (uploadRes.statusCode === 200) {
                  console.log('图片上传成功，服务器返回:', data);

                  // 使用Socket.io发送图片消息
                  this.socket.emit('send_message', {
                    conversationId: this.conversationId,
                    image_url: data.imageUrl,
                    tempId: tempId
                  });

                  // 立即更新临时消息中的图片URL为服务器URL
                  const msgIndex = this.messages.findIndex(msg => msg.message_id === 'temp_' + tempId);
                  if (msgIndex !== -1) {
                    // 创建新对象以确保Vue检测到变化
                    const updatedMsg = { ...this.messages[msgIndex] };
                    updatedMsg.image_url = data.imageUrl;
                    updatedMsg.localImage = false; // 不再是本地图片
                    this.messages.splice(msgIndex, 1, updatedMsg);
                    console.log('已更新临时图片URL为服务器URL:', data.imageUrl);
                  }
                } else {
                  this.markMessageAsFailed('temp_' + tempId);
                  console.error('图片上传失败:', data);
                }
              } catch (e) {
                console.error('解析上传响应失败:', e, uploadRes.data);
                this.markMessageAsFailed('temp_' + tempId);
              }
            },
            fail: (err) => {
              console.error('图片上传请求失败:', err);
              this.markMessageAsFailed('temp_' + tempId);
            }
          });
        }
      });
    },

    // 标记消息发送失败
    markMessageAsFailed(messageId) {
      const messageIndex = this.messages.findIndex(m => m.message_id === messageId);
      if (messageIndex !== -1) {
        this.messages[messageIndex].failed = true;
      }

      uni.showToast({
        title: '图片发送失败',
        icon: 'none'
      });
    },

    // 预览图片
    previewImage(imageUrl) {
      uni.previewImage({
        urls: [this.getFullImageUrl(imageUrl)]
      });
    },

    // 获取完整图片URL
    getFullImageUrl(url) {
      if (!url) return '../../static/img/default-avatar.png';

      // 处理不同类型的URL
      if (url.startsWith('http')) return url;
      if (url.startsWith('blob:')) return url; // Blob URL直接返回
      if (url.startsWith('/')) return `http://localhost:3000${url}`; // 处理以/开头的路径

      // 处理相对路径
      return `http://localhost:3000/${url.replace(/\\/g, '/')}`;
    },

    // 连接Socket.io
    connectSocket() {
      const token = uni.getStorageSync('token');
      if (!token) return;

      // 断开任何现有连接
      if (this.socket) {
        console.log('断开旧的Socket.io连接');
        // 先移除所有事件监听器，避免事件重复
        this.socket.off('receive_message');
        this.socket.off('message_sent');
        this.socket.off('error');
        this.socket.disconnect();
      }

      console.log(`创建新的Socket.io连接，会话ID: ${this.conversationId}`);

      // 创建Socket.io连接
      this.socket = io('http://localhost:3000', {
        auth: {
          token: token
        },
        // 添加重连选项，提高稳定性
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // 连接事件
      this.socket.on('connect', () => {
        console.log('Socket.io连接成功');

        // 加入特定会话房间
        this.socket.emit('join_conversation', {
          conversationId: this.conversationId
        });
      });

      // 接收消息 - 使用箭头函数确保正确的this上下文
      this.socket.on('receive_message', (data) => {
        console.log('收到Socket.io消息:', JSON.stringify(data));
        console.log('当前会话ID:', this.conversationId);
        console.log('消息所属会话ID:', data.message?.conversation_id);

        // 确保消息属于当前会话
        if (data.type === 'message' &&
          data.message &&
          String(data.message.conversation_id) === String(this.conversationId)) {

          // 关键修改：检查该消息是否是自己发出的，如果是，则不添加
          if (data.message.sender_id === this.userInfo.student_id) {
            console.log('这是自己发送的消息，不重复添加');

            // 更新临时消息
            const tempIndex = this.messages.findIndex(msg =>
              msg.temp && msg.content === data.message.content);

            if (tempIndex !== -1) {
              console.log('更新临时消息');
              this.messages.splice(tempIndex, 1, data.message);
            }
            return;
          }

          // 关键修改：检查消息是否已存在，避免重复添加
          const messageExists = this.messages.some(msg =>
            msg.message_id === data.message.message_id ||
            (msg.content === data.message.content &&
              Math.abs(new Date(msg.created_at) - new Date(data.message.created_at)) < 3000)
          );

          if (messageExists) {
            console.log('消息已存在，不重复添加:', data.message);
            return;
          }

          console.log('添加新消息到聊天:', data.message);

          // 使用Vue的变更检测确保UI更新
          this.$nextTick(() => {
            // 显式复制数组以确保Vue检测到变更
            this.messages = [...this.messages, data.message];
            // 滚动到底部
            this.scrollToBottom();
          });
        }
      });

      // 接收消息发送确认
      this.socket.on('message_sent', (data) => {
        console.log('消息发送确认:', data);
        const tempIndex = this.messages.findIndex(msg => msg.message_id === 'temp_' + data.tempId);
        if (tempIndex !== -1) {
          // 更新临时消息ID，标记为已确认
          this.messages[tempIndex].message_id = data.messageId;
          this.messages[tempIndex].temp = false;
        }
      });

      // 添加消息已读事件监听
      this.socket.on('messages_read', (data) => {
        console.log('消息已读通知:', data);

        // 更新消息的已读状态
        if (data.conversationId === this.conversationId) {
          data.messageIds.forEach(messageId => {
            const msgIndex = this.messages.findIndex(msg => msg.message_id === messageId);
            if (msgIndex !== -1) {
              // Vue不能直接修改对象属性，需要创建新对象或使用Vue.set
              this.messages[msgIndex] = { ...this.messages[msgIndex], is_read: true };
            }
          });
        }
      });

    },

    // 添加标记消息已读的方法
    markMessagesAsRead() {
      if (this.socket && this.socket.connected && this.conversationId) {
        console.log('标记消息为已读');
        this.socket.emit('mark_messages_read', {
          conversationId: this.conversationId
        });

        // 发送消息查看事件
        this.socket.emit('viewing_conversation', {
          conversationId: this.conversationId
        });
      }
    },

    // 添加自动检查已读状态的方法
    setupReadStatusCheck() {
      console.log('自动检查已读状态的方法');

      setInterval(() => {
        const currentTime = Date.now();
        if (currentTime - this.lastReadCheckTime > 5000) {
          this.markMessagesAsRead();
          this.lastReadCheckTime = currentTime;
        }
      }, 1000);
    },
    scrollToBottom() {
      setTimeout(() => {
        const systemInfo = uni.getSystemInfoSync();
        const scrollHeight = systemInfo.windowHeight + document.body.scrollHeight;
        uni.pageScrollTo({
          scrollTop: scrollHeight,
          duration: 100,
        });
      }, 200);
    },

    // 处理输入框焦点
    InputFocus(e) {
      this.InputBottom = e.detail.height;
    },

    // 处理输入框失去焦点
    InputBlur() {
      this.InputBottom = 0;
    }
  }
};
</script>

<style>
page {
  padding-bottom: 100rpx;
}

.chat-container {
  padding-bottom: 20rpx;
  box-sizing: border-box;
}

.loading-more {
  text-align: center;
  color: #999;
  padding: 20rpx 0;
}

.cu-chat .cu-item {
  margin-bottom: 10rpx;
  /* 减小上下间距 */
  padding: 5rpx 10rpx;
  /* 缩小内边距 */
}


.cu-chat .cu-item .main .content {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  position: relative;
  /* 添加相对定位，让已读图标可以绝对定位 */
  padding-right: 30rpx;
  /* 为已读图标留出空间 */
}

.cu-chat .cu-item .main .content.bg-img {
  padding: 0;
  max-width: 50%;
  overflow: hidden;
}

.cu-chat .cu-item .main .content.bg-img image {
  max-width: 100%;
  border-radius: 10rpx;
}

.cu-chat .cu-item .main .content.bg-img.self-image {
  max-width: 50%;
  margin-left: auto;
  margin-right: 10rpx;
}

/* 添加消息状态样式 */
.message-status {
  display: inline-block;
  font-size: 24rpx;
  margin-left: 10rpx;
  position: absolute;
  right: -30rpx;
  bottom: 2rpx;
}

/* 针对不同类型消息的已读状态图标位置调整 */
.cu-chat .cu-item.self .message-status {
  right: -30rpx;
}

/* 消息图标颜色 */
.message-status .cuIcon-check {
  color: #8a8a8a;
  font-size: 24rpx;
}
</style>
