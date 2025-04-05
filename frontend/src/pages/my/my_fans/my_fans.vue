<template>
    <view class="container">
        <scroll-view class="fans-list" :scroll-y="true">
            <block v-for="item in fans" :key="item.student_id">
                <view class="fans-item" @tap="navigateToUserInfo(item.student_id)">
                    <image class="avatar" :src="getImageUrl(item.avatar)" mode="aspectFill"></image>
                    <text class="username">{{ item.username }}</text>
                </view>
                <view class="item-divider"></view>
            </block>
        </scroll-view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            fans: [] // 存储粉丝对象的数组
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
                        this.fans = res.data.fans;
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
    padding: 10px 0;
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
</style>
