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
export default {
  data() {
    return {
      conversations: [],
      refreshing: false,
      refreshTimer: null,
    };
  },
  onShow() {
    console.log("消息页面显示，加载会话");
    this.loadConversations();

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
  },

  onUnload() {
    // 页面卸载时清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  },
  methods: {
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
          }&user_id=${item.otherUser.id}&product_id=${item.product_id || ""}&otherUserName=${item.otherUser.name}`,
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
