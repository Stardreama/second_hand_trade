<template>
  <view>
    <cu-custom bgColor="bg-gradual-blue" :isBack="true">
      <!-- <block slot="backText">返回</block> -->
      <!-- <block slot="content">{{ otherUserName }}</block> -->
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
              <image :src="getFullImageUrl(msg.image_url)" mode="widthFix"></image>
            </view>

            <!-- 文本消息 -->
            <view class="content" v-else
              :style="{ 'background-color': msg.sender_id === userInfo.student_id ? '#0081ff' : '' }">
              <text>{{ msg.content }}</text>
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
      currentPageId: null
    };
  },

  onLoad(options) {
    this.conversationId = options.conversation_id;
    this.otherUserId = options.user_id;
    this.productId = options.product_id || '';
    this.otherUserName = options.otherUserName || "未知用户";
    // 设置导航栏标题为对方的用户名
    if (this.otherUserName) {
      uni.setNavigationBarTitle({
        title: this.otherUserName
      });
    }
    // 获取用户信息
    const userInfo = uni.getStorageSync('userInfo');
    if (userInfo) {
      this.userInfo = userInfo;
      this.userAvatar = this.getFullImageUrl(userInfo.avatar);
    }

    // 获取对方用户信息
    this.loadOtherUserInfo();

    // 加载历史消息
    this.loadMessages();

    // 连接Socket.io
    this.connectSocket();
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
  },


  onUnload() {
    console.log('页面卸载');
    // 关闭Socket.io连接
    if (this.socket) {
      this.socket.disconnect();
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

      // 滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });
    },

    // 选择图片
    chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];

          // 添加临时图片消息
          const tempId = Date.now().toString();
          const tempMessage = {
            message_id: tempId,
            conversation_id: this.conversationId,
            sender_id: this.userInfo.student_id,
            image_url: tempFilePath,
            created_at: new Date().toISOString(),
            is_read: false,
            temp: true
          };

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
              const data = JSON.parse(uploadRes.data);
              if (uploadRes.statusCode === 200) {
                // 发送图片消息
                uni.request({
                  url: `http://localhost:3000/api/conversations/${this.conversationId}/messages`,
                  method: 'POST',
                  data: {
                    image_url: data.imageUrl
                  },
                  header: {
                    'Authorization': `Bearer ${uni.getStorageSync('token')}`
                  },
                  success: (res) => {
                    if (res.statusCode === 201) {
                      // 替换临时消息
                      const messageIndex = this.messages.findIndex(m => m.message_id === tempId);
                      if (messageIndex !== -1) {
                        this.messages.splice(messageIndex, 1, res.data);
                      }
                    } else {
                      this.markMessageAsFailed(tempId);
                    }
                  },
                  fail: () => {
                    this.markMessageAsFailed(tempId);
                  }
                });
              } else {
                this.markMessageAsFailed(tempId);
              }
            },
            fail: () => {
              this.markMessageAsFailed(tempId);
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
      if (url.startsWith('http')) return url;
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
        console.log(data.type === 'message' &&
          data.message &&
          data.message.conversation_id === this.conversationId);
        console.log(data.type === 'message' ? '是消息' : '不是消息');
        console.log(data.message ? '有消息' : '没有消息');
        console.log(data.message.conversation_id === this.conversationId ? '是当前会话' : '不是当前会话');
        console.log(typeof data.message.conversation_id);
        
        // 确保消息属于当前会话
        if (data.type === 'message' &&
          data.message &&
          String(data.message.conversation_id) === String(this.conversationId)) {

          console.log('添加新消息到聊天:', data.message);

          // 使用Vue的变更检测确保UI更新
          this.$nextTick(() => {
            // 显式复制数组以确保Vue检测到变更
            const updatedMessages = [...this.messages];
            updatedMessages.push(data.message);
            this.messages = updatedMessages;
            // 滚动到底部
            this.scrollToBottom();
          });
        }
      });


    },

    // 滚动到底部
    scrollToBottom() {
      this.$nextTick(() => {
        let query = uni.createSelectorQuery().in(this);
        query.select('.chat-container').boundingClientRect(data => {
          if (data) {
            this.scrollTop = 9999999;
          }
        }).exec();
      });
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
</style>
