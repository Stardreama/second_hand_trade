<template>
    <view class="container">
        <!-- 有关注人时显示列表 -->
        <scroll-view v-if="followees && followees.length > 0" class="follow-list" :scroll-y="true">
            <block v-for="item in followees" :key="item.student_id">
                <view class="follow-item" @tap="navigateToUserInfo(item.student_id)">
                    <image class="avatar" :src="getImageUrl(item.avatar)" mode="aspectFill"></image>
                    <text class="nickname">{{ item.username }}</text>
                </view>
                <view class="item-divider"></view>
            </block>
        </scroll-view>

        <!-- 无关注人时显示空状态 -->
        <view v-else class="empty-state">
            <view class="icon-container">
                <text class="empty-icon">❤</text>
            </view>
            <view class="empty-text">暂无关注</view>
            <view class="empty-subtext">关注感兴趣的卖家，不错过他们的新商品</view>
            <button class="cu-btn bg-blue margin-top" @tap="goToHome">去逛逛</button>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            followees: []  // 存储关注对象的数组
        };
    },
    onShow() {
        this.fetchFollowees();
    },
    methods: {
        fetchFollowees() {
            const token = uni.getStorageSync("token");
            if (!token) return;
            uni.request({
                url: "http://localhost:3000/api/user/follow/list",
                header: {
                    Authorization: `Bearer ${token}`
                },
                success: (res) => {
                    if (res.statusCode === 200) {
                        this.followees = res.data.followees;
                        console.log(this.followees);
                    } else {
                        uni.showToast({
                            title: "获取关注列表失败",
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
        // 拼接图片完整 URL 的方法
        getImageUrl(imagePath) {
            if (!imagePath) return ""; // 防空

            // 如果已经是完整 URL，直接返回
            if (/^https?:\/\//.test(imagePath)) {
                return imagePath;
            }

            // 否则把反斜杠替换成斜杠并拼接服务器地址
            const formattedPath = imagePath.replace(/\\/g, "/");
            return `http://localhost:3000/${formattedPath}`;
        },
        // 添加跳转到用户详情页的方法
        // 添加跳转到用户详情页并传递用户信息的方法
        navigateToUserInfo(userId) {
            // 查找当前用户的完整信息对象
            const currentUser = this.followees.find(item => item.student_id === userId);

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
        },
        // 跳转到首页
        goToHome() {
            uni.switchTab({
                url: "/pages/home/home"
            });
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

.header {
    padding: 10px 0;
    align-items: center;
    justify-content: center;
}

.header-title {
    font-size: 20px;
    font-weight: bold;
    text-align: center;
}

.divider {
    height: 1px;
    background-color: #e0e0e0;
    margin-bottom: 10px;
}

.follow-list {
    flex: 1;
}

.follow-item {
    display: flex;
    align-items: center;
    padding: 10px 0;
}

.avatar {
    width: 50px;
    height: 50px;
    border-radius: 25px;
    margin-right: 10px;
}

.nickname {
    font-size: 16px;
    color: #333;
}

.item-divider {
    height: 1px;
    background-color: #f0f0f0;
    margin: 0 0 10px 60px;
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

.margin-top {
    margin-top: 20rpx;
}
</style>
