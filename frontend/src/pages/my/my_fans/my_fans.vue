<template>
    <view class="container">
        <scroll-view v-if="fans && fans.length > 0" class="fans-list" :scroll-y="true">
            <block v-for="item in fans" :key="item.student_id">
                <view class="fans-item">
                    <!-- 用户信息部分（点击跳转到用户详情） -->
                    <view class="user-info" @tap="navigateToUserInfo(item.student_id)">
                        <image class="avatar" :src="getImageUrl(item.avatar)" mode="aspectFill"></image>
                        <text class="username">{{ item.username }}</text>
                    </view>

                    <!-- 回关按钮 -->
                    <view class="follow-btn" :class="{ 'follow-btn-active': item.isFollowed }"
                        @tap="toggleFollow(item)">
                        <text>{{ item.isFollowed ? "已关注" : "回关" }}</text>
                    </view>

                    <!-- 新增：动画容器 -->
                    <view v-if="item.showFollowAnimation" class="follow-animation-container">
                        <text class="follow-heart follow-center-heart">❤</text>
                        <text class="follow-item follow-item-1">❤</text>
                        <text class="follow-item follow-item-2">★</text>
                        <text class="follow-item follow-item-3">♥</text>
                        <text class="follow-item follow-item-4">✿</text>
                        <text class="follow-item follow-item-5">♡</text>
                        <text class="follow-item follow-item-6">✧</text>
                        <text class="follow-item follow-item-7">❀</text>
                        <text class="follow-item follow-item-8">✩</text>
                        <text class="follow-item follow-item-9">❥</text>
                        <text class="follow-item follow-item-10">✮</text>
                        <text class="follow-item follow-item-11">♬</text>
                        <text class="follow-item follow-item-12">✿</text>
                        <text class="follow-item follow-item-13">❋</text>
                        <text class="follow-item follow-item-14">♪</text>
                        <text class="follow-item follow-item-15">✺</text>
                    </view>
                </view>



                <view class="item-divider"></view>
            </block>
        </scroll-view>
        <!-- 无粉丝时显示空状态 -->
        <view v-else class="empty-state">
            <view class="icon-container">
                <text class="empty-icon">👤</text>
            </view>
            <view class="empty-text">暂无粉丝</view>
            <view class="empty-subtext">发布优质商品，吸引更多粉丝关注</view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            fans: [], // 存储粉丝对象的数组
            // showFollowAnimation: false, // 控制关注动画显示
            // buttonBouncing: false,      // 控制按钮弹跳效果
        };
    },
    onShow() {
        this.fetchFans();
    },
    methods: {
        fetchFans() {
            const token = uni.getStorageSync("token");
            if (!token) return;
            uni.request({
                url: "http://localhost:3000/api/user/fans/list",
                header: {
                    Authorization: `Bearer ${token}`
                },
                success: (res) => {
                    if (res.statusCode === 200) {
                        // 为每个粉丝添加动画状态属性
                        this.fans = res.data.fans.map(fan => ({
                            ...fan,
                            buttonBouncing: false,
                            showFollowAnimation: false
                        }));

                        // 检查每个粉丝的关注状态
                        this.fans.forEach(fan => {
                            this.checkFollowStatus(fan);
                        });

                        console.log(this.fans);
                    } else {
                        uni.showToast({
                            title: "获取粉丝列表失败",
                            icon: "none"
                        });
                    }
                },
                fail: () => {
                    uni.showToast({
                        title: "网络错误，请重试",
                        icon: "none"
                    });
                }
            });
        },


        // 检查是否已关注粉丝
        checkFollowStatus(fan) {
            const token = uni.getStorageSync("token");
            uni.request({
                url: `http://localhost:3000/api/user/follow/status`,
                method: "GET",
                header: {
                    Authorization: `Bearer ${token}`,
                },
                data: {
                    followee_id: fan.student_id,
                },
                success: (res) => {
                    if (res.statusCode === 200) {
                        // 使用Vue.set来确保响应性
                        this.$set(fan, 'isFollowed', res.data.followed);
                    }
                }
            });
        },







        // 关注/取消关注
        // 关注/取消关注
        toggleFollow(fan) {
            const token = uni.getStorageSync("token");
            if (!token) {
                uni.showToast({
                    title: "请先登录",
                    icon: "none"
                });
                return;
            }

            if (fan.isFollowed) {
                // 取消关注逻辑
                uni.request({
                    url: `http://localhost:3000/api/user/follow`,
                    method: "DELETE",
                    header: {
                        Authorization: `Bearer ${token}`,
                    },
                    data: {
                        followee_id: fan.student_id,
                    },
                    success: (res) => {
                        if (res.statusCode === 200) {
                            uni.showToast({ title: "已取消关注", icon: "none" });
                            this.$set(fan, 'isFollowed', false);

                            // 添加取消关注时的按钮动画
                            this.$set(fan, 'buttonBouncing', true);
                            setTimeout(() => {
                                this.$set(fan, 'buttonBouncing', false);
                            }, 500);
                        } else {
                            uni.showToast({ title: "取消关注失败", icon: "none" });
                        }
                    }
                });
            } else {
                // 关注逻辑
                uni.request({
                    url: `http://localhost:3000/api/user/follow`,
                    method: "POST",
                    header: {
                        Authorization: `Bearer ${token}`,
                    },
                    data: {
                        followee_id: fan.student_id,
                    },
                    success: (res) => {
                        if (res.statusCode === 201) {
                            uni.showToast({ title: "关注成功", icon: "none" });
                            this.$set(fan, 'isFollowed', true);

                            // 添加关注成功时的动画效果
                            this.$set(fan, 'buttonBouncing', true);
                            this.$set(fan, 'showFollowAnimation', true);

                            setTimeout(() => {
                                this.$set(fan, 'buttonBouncing', false);
                                this.$set(fan, 'showFollowAnimation', false);
                            }, 1500);
                        } else {
                            uni.showToast({ title: "关注失败", icon: "none" });
                        }
                    }
                });
            }
        },

        // 拼接图片完整 URL 的方法
        getImageUrl(imagePath) {
            if (!imagePath) return ""; // 防空
            // 如果已经是完整 URL，直接返回
            if (/^https?:\/\//.test(imagePath)) {
                return imagePath;
            }
            // 否则替换反斜杠并拼接服务器地址
            const formattedPath = imagePath.replace(/\\/g, "/");
            return `http://localhost:3000/${formattedPath}`;
        },
        // 添加跳转到用户详情页并传递用户信息的方法
        navigateToUserInfo(userId) {
            // 查找当前用户的完整信息对象
            const currentUser = this.fans.find(item => item.student_id === userId);

            if (currentUser) {
                // 将用户名和头像作为URL参数传递
                const url = `/pages/my/user_info/user_info?id=${userId}&username=${encodeURIComponent(currentUser.username)}&avatar=${encodeURIComponent(this.getImageUrl(currentUser.avatar))}`;

                uni.navigateTo({
                    url: url
                });
            } else {
                // 如果找不到用户数据，只传ID
                uni.navigateTo({
                    url: `/pages/my/user_info/user_info?id=${userId}`
                });
            }
        }
    }
};
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: #ffffff;
    padding: 10px;
}

.fans-list {
    flex: 1;
}

.fans-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    position: relative;
    /* 添加这行，让动画容器能相对于它定位 */
}

.avatar {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    margin-right: 10px;
}

.username {
    font-size: 16px;
    color: #333;
}

.item-divider {
    height: 1px;
    background-color: #f0f0f0;
    margin: 0 0 10px 60px;
}


/* 关注按钮样式 */
.follow-btn {
    margin-right: 10rpx;
    /* 添加这一行，给按钮右侧一点间距 */
    padding: 6rpx 20rpx;
    font-size: 24rpx;
    border: 2rpx solid #ccc;
    border-radius: 30rpx;
    background-color: #fff;
    color: #333;
}

.follow-btn-active {
    background: linear-gradient(to right, #36d1dc, #5b86e5);
    color: white;
    border: 2rpx solid transparent;
}


.user-info {
    display: flex;
    align-items: center;
}







/* 弹跳动画 */
@keyframes bounce {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }
}

.bounce-animation {
    animation: bounce 0.5s ease;
}

/* 关注动画容器 */
.follow-animation-container {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 999;
    overflow: hidden;
}

/* 中心爱心 */
.follow-center-heart {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0);
    font-size: 100rpx;
    color: #ff4757;
    text-shadow: 0 0 30rpx rgba(255, 71, 87, 0.8);
    animation: pulseHeart 1.5s ease-in-out forwards;
    opacity: 0;
}

/* 花朵元素 */
.follow-item {
    position: absolute;
    bottom: -100rpx;
    font-size: 40rpx;
    text-shadow: 0 0 15rpx rgba(255, 255, 255, 0.8);
    animation-duration: 2s;
    animation-fill-mode: forwards;
    animation-timing-function: ease-out;
}

/* 不同花朵的颜色和位置 */
.follow-item-1 {
    left: calc(50% - 90rpx);
    color: #ff4757;
    animation-name: flyItem1;
}

.follow-item-2 {
    left: calc(50% - 45rpx);
    color: #ffa502;
    animation-name: flyItem2;
    animation-delay: 0.1s;
}

.follow-item-3 {
    left: calc(50%);
    color: #ff6b81;
    animation-name: flyItem3;
    animation-delay: 0.15s;
}

.follow-item-4 {
    left: calc(50% + 45rpx);
    color: #7bed9f;
    animation-name: flyItem4;
    animation-delay: 0.2s;
}

.follow-item-5 {
    left: calc(50% + 90rpx);
    color: #70a1ff;
    animation-name: flyItem5;
    animation-delay: 0.25s;
}

/* 中心爱心动画 */
@keyframes pulseHeart {
    0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 0;
    }

    50% {
        transform: translate(-50%, -50%) scale(2.0);
        opacity: 1;
    }

    85% {
        transform: translate(-50%, -50%) scale(1.5);
        opacity: 0.8;
    }

    100% {
        transform: translate(-50%, -50%) scale(1.8);
        opacity: 0;
    }
}

/* 花朵飞舞动画 */
@keyframes flyItem1 {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
    }

    20% {
        opacity: 1;
    }

    60% {
        transform: translateY(-250rpx) translateX(35rpx) rotate(20deg) scale(1.2);
        opacity: 0.9;
    }

    100% {
        transform: translateY(-400rpx) translateX(50rpx) rotate(45deg) scale(0);
        opacity: 0;
    }
}

@keyframes flyItem2 {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
    }

    20% {
        opacity: 1;
    }

    60% {
        transform: translateY(-225rpx) translateX(20rpx) rotate(-15deg) scale(1.3);
        opacity: 0.9;
    }

    100% {
        transform: translateY(-375rpx) translateX(30rpx) rotate(-30deg) scale(0);
        opacity: 0;
    }
}

@keyframes flyItem3 {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
    }

    20% {
        opacity: 1;
    }

    60% {
        transform: translateY(-275rpx) translateX(10rpx) rotate(30deg) scale(1.1);
        opacity: 0.9;
    }

    100% {
        transform: translateY(-425rpx) translateX(15rpx) rotate(60deg) scale(0);
        opacity: 0;
    }
}

@keyframes flyItem4 {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
    }

    20% {
        opacity: 1;
    }

    60% {
        transform: translateY(-300rpx) translateX(0rpx) rotate(-20deg) scale(1.4);
        opacity: 0.9;
    }

    100% {
        transform: translateY(-450rpx) translateX(0rpx) rotate(-40deg) scale(0);
        opacity: 0;
    }
}

@keyframes flyItem5 {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0;
    }

    20% {
        opacity: 1;
    }

    60% {
        transform: translateY(-275rpx) translateX(-20rpx) rotate(10deg) scale(1.2);
        opacity: 0.9;
    }

    100% {
        transform: translateY(-425rpx) translateX(-30rpx) rotate(20deg) scale(0);
        opacity: 0;
    }
}





/* 空状态样式 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60rpx 0;
    background-color: #fff;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
    margin: 30rpx;
    height: 60vh;
}

.icon-container {
    background-color: #f5f5f5;
    border-radius: 50%;
    width: 160rpx;
    height: 160rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 30rpx;
}

.empty-icon {
    font-size: 80rpx;
    color: #1890ff;
}

.empty-text {
    font-size: 32rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 20rpx;
}

.empty-subtext {
    font-size: 28rpx;
    color: #999;
    margin-bottom: 40rpx;
    text-align: center;
    padding: 0 30rpx;
}
</style>
