<template>
    <view>
        <!-- 用户基本信息 -->
        <view class="user-header">
            <view class="user-info">
                <image :src="userInfo.avatar || 'https://s21.ax1x.com/2025/03/18/pEdfnjP.jpg'" class="avatar"></image>
                <view class="username">{{ userInfo.username || "加载中..." }}</view>
            </view>

            <!-- 统计数据 -->
            <view class="stats-row">
                <view class="stat-item">
                    <view class="stat-number">{{ userStats.likeCount }}</view>
                    <view class="stat-label">获赞</view>
                </view>

                <view class="stat-item">
                    <view class="stat-number">{{ userStats.followingCount }}</view>
                    <view class="stat-label">关注</view>
                </view>

                <view class="stat-item">
                    <view class="stat-number">{{ userStats.fansCount }}</view>
                    <view class="stat-label">粉丝</view>
                </view>
            </view>
        </view>

        <!-- 分隔线 -->
        <view class="divider"></view>

        <!-- 用户发布的商品 -->
        <view class="section-header">
            <text>Ta的发布</text>
        </view>

        <!-- 商品列表 -->
        <view class="product-container" v-if="products.length > 0">
            <view class="card-menu container" v-for="item in products" :key="item.product_id"
                @tap="goToProductDetail(item.product_id)">
                <!-- 商品图片容器 -->
                <view class="container_img">
                    <!-- 动态绑定图片路径 -->
                    <image :src="getImageUrl(item.image)" mode="aspectFill"></image>
                </view>

                <!-- 商品标题容器 -->
                <view class="container_text text-cut">
                    <text>{{ item.product_title }}</text>
                </view>

                <!-- 价格和状态容器 -->
                <view class="container_price">
                    <!-- 显示商品价格 -->
                    <text class="container_price_text_0">￥{{ item.price }}</text>
                    <!-- 动态绑定状态标签样式 -->
                    <view class="cu-tag" :class="getStatusClass(item.product_status)">
                        {{ item.product_status }}
                    </view>
                </view>

                <!-- 下架标记 -->
                <view class="status-badge" v-if="item.is_off_shelf === 1">已下架</view>
            </view>
        </view>

        <!-- 无商品时显示 -->
        <view class="empty-state" v-else>
            <text>暂无发布的商品</text>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            userId: '', // 要查看的用户ID
            userInfo: {
                username: '',
                avatar: ''
            },
            userStats: {
                likeCount: 0,
                followingCount: 0,
                fansCount: 0
            },
            products: [] // 用户发布的商品列表
        }
    },
    onLoad(options) {
        if (options.id) {
            this.userId = options.id;

            // 接收传递过来的用户名和头像
            if (options.username) {
                this.userInfo.username = decodeURIComponent(options.username);
                console.log(this.userInfo.username)
            }

            if (options.avatar) {
                this.userInfo.avatar = decodeURIComponent(options.avatar);
                console.log(this.userInfo.avatar)
            }

            this.fetchUserStats();
            this.fetchUserProducts();
        } else {
            uni.showToast({
                title: '用户ID不存在',
                icon: 'none'
            });
            setTimeout(() => {
                uni.navigateBack();
            }, 1500);
        }
    },
    methods: {

        //获取关注和粉丝数
        fetchUserStats() {
            uni.request({
                url: `http://localhost:3000/api/user/public/follow/count/${this.userId}`,
                method: 'GET',
                success: (res) => {
                    if (res.statusCode === 200) {
                        // 更新关注数和粉丝数
                        this.userStats.followingCount = res.data.followCount || 0;
                        this.userStats.fansCount = res.data.fansCount || 0;
                        // 获取完关注和粉丝数后，获取点赞数
                        this.fetchUserLikes();

                    } else {
                        console.log('获取关注统计失败');
                    }
                },
                fail: (err) => {
                    console.error('请求失败:', err);
                }
            });
        },

        // 获取用户点赞数
        fetchUserLikes() {
            uni.request({
                url: `http://localhost:3000/api/my/public/like/${this.userId}`,
                method: 'GET',
                success: (res) => {
                    if (res.statusCode === 200) {
                        this.userStats.likeCount = res.data.likeCount || 0;
                    } else {
                        console.log('获取点赞统计失败');
                    }
                },
                fail: (err) => {
                    console.error('获取点赞数失败:', err);
                }
            });
        },



        // 获取用户发布的商品
        fetchUserProducts() {
            uni.request({
                url: `http://localhost:3000/api/products/user/${this.userId}`,
                method: 'GET',
                success: (res) => {
                    if (res.statusCode === 200) {
                        this.products = res.data.products || [];
                        console.log("获取到的商品:", this.products);
                    } else {
                        console.log('获取用户商品失败');
                    }
                },
                fail: (err) => {
                    console.error('获取用户商品请求失败:', err);
                }
            });
        },

        // 处理图片路径的方法
        getImageUrl(path) {
            if (!path) return "/static/images/default.png"; // 防空

            // 如果已经是完整 URL，直接返回
            if (/^https?:\/\//.test(path)) {
                return path;
            }

            // 否则把反斜杠替换成斜杠并拼接服务器地址
            const formattedPath = path.replace(/\\/g, "/");
            return `http://localhost:3000/${formattedPath}`;
        },

        // 获取状态标签样式的动态类名
        getStatusClass(status) {
            return {
                // 全新状态使用橙色边框
                "line-orange": status === "全新",
                // 二手状态使用蓝色边框
                "line-blue": status === "二手",
                // 其他状态使用绿色边框
                "line-green": !["全新", "二手"].includes(status),
            };
        },

        // 跳转到商品详情
        goToProductDetail(productId) {
            uni.navigateTo({
                url: `/pages/home/home_detail/home_detail?product_id=${productId}`
            });
        }
    }
}
</script>

<style scoped>
.user-header {
    background-color: #fff;
    padding: 30rpx;
}

.user-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30rpx;
}

.avatar {
    width: 150rpx;
    height: 150rpx;
    border-radius: 50%;
    margin-bottom: 20rpx;
}

.username {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
}

.stats-row {
    display: flex;
    justify-content: space-around;
    margin-top: 20rpx;
}

.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 15rpx 0;
}

.stat-number {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
}

.stat-label {
    font-size: 26rpx;
    color: #999;
    margin-top: 6rpx;
}

.divider {
    height: 20rpx;
    background-color: #f5f5f5;
}

.section-header {
    padding: 30rpx;
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    background-color: #fff;
}



.empty-state {
    padding: 100rpx 0;
    text-align: center;
    color: #999;
    font-size: 28rpx;
    background-color: #fff;
}

.text-cut {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}



/* 商品容器样式 */
.product-container {
    display: flex;
    flex-wrap: wrap;
    background-color: #f6f6f6;
    padding: 10rpx;
}

.container {
    float: left;
    height: 470rpx;
    /* 稍微增加高度，让内容显示更完整 */
    width: 50%;
    background: white;
    box-sizing: border-box;
    padding: 15rpx;
    position: relative;
    margin-bottom: 10rpx;
}

.container_img {
    height: 280rpx;
    width: 100%;
    /* 确保宽度也为100% */
    overflow: hidden;
    margin-bottom: 10rpx;
    border-radius: 8rpx;
    /* 移到容器上，使整个容器有圆角 */
}

.container_img image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.container_text {
    color: black;
    padding: 10rpx;
    height: 70rpx;
    font-size: 26rpx;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
}

.container_price {
    display: flex;
    justify-content: space-between;
    padding: 0 10rpx;
    align-items: center;
}

.container_price_text_0 {
    color: #ff5722;
    font-size: 32rpx;
    font-weight: bold;
}

.cu-tag {
    font-size: 20rpx;
    padding: 4rpx 16rpx;
    border-radius: 4rpx;
}

.cu-tag.line-orange {
    color: #ff9700;
    border: 1rpx solid #ff9700;
}

.cu-tag.line-blue {
    color: #0081ff;
    border: 1rpx solid #0081ff;
}

.cu-tag.line-green {
    color: #39b54a;
    border: 1rpx solid #39b54a;
}

.status-badge {
    position: absolute;
    top: 20rpx;
    left: 20rpx;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    font-size: 24rpx;
    padding: 6rpx 12rpx;
    border-radius: 6rpx;
}
</style>