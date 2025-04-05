<template>
    <view class="container">
        <!-- 标题区域 -->
        <!-- <view class="header">
            <text class="header-title">我的关注</text>
        </view> -->
        <!-- 分割线 -->
        <!-- <view class="divider"></view> -->
        <!-- 关注列表 -->
        <scroll-view class="follow-list" :scroll-y="true">
            <block v-for="item in followees" :key="item.student_id">
                <view class="follow-item">
                    <image class="avatar" :src="getImageUrl(item.avatar)" mode="aspectFill"></image>
                    <text class="nickname">{{ item.username }}</text>
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
</style>
