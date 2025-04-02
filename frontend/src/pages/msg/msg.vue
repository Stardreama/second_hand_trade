<template>
  <view>
    <!-- 自定义导航栏 -->
    <cu-custom bgColor="bg-gradual-blue" :isBack="true">
      <!-- <block slot="backText">返回</block>
      <block slot="content">毕节职业技术学院</block> -->
    </cu-custom>
    <!-- end -->

    <!-- 添加下拉刷新 -->
    <scroll-view scroll-y="true" style="height: calc(100vh - 100rpx)" :refresher-enabled="true"
      :refresher-triggered="refreshing" @refresherpulling="onPulling" @refresherrefresh="onRefresh"
      @refresherrestore="onRestore">
      <!-- 聊天消息列表 -->
      <view class="cu-list menu-avatar card-menu martop" v-if="conversations.length > 0">
        <view class="cu-item" v-for="(item, index) in conversations" :key="index" @tap="toMsgChat(item)">
          <view class="cu-avatar round lg" :style="{
            'background-image': `url(${getAvatarUrl(item.otherUser.avatar)})`,
          }"></view>
          <view class="content">
            <view class="text-grey">{{ item.otherUser.name }}</view>
            <view class="text-gray text-sm flex">
              <text class="text-cut">
                <text v-if="item.unreadCount > 0" class="cuIcon-infofill text-red margin-right-xs"></text>
                {{ item.latest_message || "暂无消息" }}
              </text>
            </view>
          </view>
          <view class="action">
            <view class="text-grey text-xs">{{
              formatTime(item.latest_message_time)
            }}</view>
            <view class="cu-tag round bg-red sm" v-if="item.unreadCount > 0">{{
              item.unreadCount
            }}</view>
          </view>
        </view>
      </view>

      <view class="empty-tip" v-else>
        <text>暂无聊天记录</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
// 引入Socket.io客户端
import io from "socket.io-client";

export default {
  data() {
    return {
      conversations: [],
      refreshing: false,
      refreshTimer: null,
      socket: null, // 添加socket变量
    };
  },

  onLoad() {
    // 连接Socket.io
    this.connectSocket();
  },

  onShow() {
    console.log("消息页面显示，加载会话");
    this.loadConversations();

    // 检查并重新连接Socket (如果断开)
    if (!this.socket || !this.socket.connected) {
      this.connectSocket();
    }

    // 设置定时刷新会话列表
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }

    this.refreshTimer = setInterval(() => {
      this.loadConversations();
    }, 30000); // 每30秒刷新一次
  },

  onHide() {
    // 页面隐藏时清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    // 不要在onHide中断开Socket连接，保持消息接收
  },

  onUnload() {
    // 页面卸载时清除定时器和Socket连接
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    // 断开Socket连接
    if (this.socket) {
      this.socket.disconnect();
    }
  },

  methods: {
    // 添加Socket.io连接方法
    connectSocket() {
      const token = uni.getStorageSync("token");
      if (!token) return;

      // 如果已有连接，先断开
      if (this.socket) {
        this.socket.disconnect();
      }

      // 创建Socket.io连接
      this.socket = io("http://localhost:3000", {
        auth: {
          token: token,
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      // 连接成功事件
      this.socket.on("connect", () => {
        console.log("msg页面: Socket.io连接成功");
      });

      // 接收消息事件 - 关键部分！
      this.socket.on('receive_message', (data) => {
        console.log('msg页面: 收到新消息通知:', data);

        // 立即更新会话列表
        this.loadConversations();

        // 添加提示音效
        const innerAudioContext = uni.createInnerAudioContext();
        innerAudioContext.autoplay = true;
        innerAudioContext.src = '/static/sound/message.mp3'; // 添加提示音文件

        // 震动提示
        uni.vibrateShort({
          success: function () {
            console.log('震动成功');
          }
        });

        // 显示消息提示
        uni.showToast({
          title: '收到新消息',
          icon: 'none',
          position: 'top'
        });
      });

      // 断开连接事件
      this.socket.on("disconnect", () => {
        console.log("msg页面: Socket.io断开连接");
      });
    },

    loadConversations() {
      return new Promise((resolve) => {
        const token = uni.getStorageSync("token");
        if (!token) {
          resolve();
          return;
        }

        console.log("开始加载会话列表");
        uni.showLoading({ title: "加载中..." });

        uni.request({
          url: "http://localhost:3000/api/conversations",
          header: {
            Authorization: `Bearer ${token}`,
          },
          success: (res) => {
            console.log("会话列表结果:", res);
            if (res.statusCode === 200) {
              this.conversations = res.data;
            } else {
              uni.showToast({
                title: "获取会话失败",
                icon: "none",
              });
            }
          },
          fail: (err) => {
            console.error("获取会话失败:", err);
            uni.showToast({
              title: "网络错误",
              icon: "none",
            });
          },
          complete: () => {
            uni.hideLoading();
            resolve();
          },
        });
      });
    },
    toMsgChat(item) {
      console.log("item", item);
      uni.navigateTo({
        url: `/pages/msg/msg_chat/msg_chat?conversation_id=${item.conversation_id
          }&user_id=${item.otherUser.id}&product_id=${item.product_id || ""
          }&otherUserName=${item.otherUser.name}`,
      });
    },
    getAvatarUrl(avatar) {
      if (!avatar) return "../../static/img/default-avatar.png";
      if (avatar.startsWith("http")) return avatar;
      return `http://localhost:3000/${avatar.replace(/\\/g, "/")}`;
    },
    formatTime(timestamp) {
      if (!timestamp) return "";

      const now = new Date();
      const messageDate = new Date(timestamp);

      // 今天的消息只显示时间
      if (now.toDateString() === messageDate.toDateString()) {
        return messageDate.toTimeString().substr(0, 5); // HH:MM
      }

      // 一周内显示周几
      const dayDiff = Math.floor((now - messageDate) / (24 * 60 * 60 * 1000));
      if (dayDiff < 7) {
        const days = ["日", "一", "二", "三", "四", "五", "六"];
        return `星期${days[messageDate.getDay()]}`;
      }

      // 其他显示日期
      return `${messageDate.getMonth() + 1}月${messageDate.getDate()}日`;
    },
    onPulling() {
      console.log("下拉刷新触发");
    },

    onRefresh() {
      console.log("刷新中");
      this.refreshing = true;
      this.loadConversations().then(() => {
        setTimeout(() => {
          this.refreshing = false;
        }, 1000);
      });
    },

    onRestore() {
      console.log("刷新完成");
    },
  },
};
</script>

<style>
.empty-tip {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}
</style>
