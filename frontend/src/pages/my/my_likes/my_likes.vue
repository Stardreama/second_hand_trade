<template>
    <view class="container">
        <!-- 热门商品列表 -->
        <view class="pa">
            <!-- 有商品时显示商品列表 -->
            <view v-if="products && products.length > 0">
                <view class="contianer shadow-warp bg-white padding-sm" v-for="(item, index) in products"
                    :key="item.product_id" :class="{ 'off-shelf-item': item.is_off_shelf === 1 }">

                    <!-- 添加下架标识 -->
                    <view class="off-shelf-badge" v-if="item.is_off_shelf === 1">已下架</view>
                    <view class="contianer-title">
                        <view class="contianer-title_1 text-cut">
                            <text class="text-cut">{{ item.product_title }}</text>
                        </view>
                    </view>

                    <view class="item-inline-1_1">
                        <text decode="true">&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;</text>
                    </view>

                    <scroll-view scroll-x="true" style="white-space: nowrap; display: flex" class="top-20">
                        <block v-for="(img, imgIndex) in getProductImages(item)" :key="imgIndex">
                            <view class="item-inlines">
                                <view class="item-inline bg-img padding-top-xl flex align-end"
                                    :style="'background-image: url(' + img + ');'">
                                </view>
                            </view>
                        </block>
                    </scroll-view>

                    <view class="container-price_desc">
                        <view class="cu-capsule round view-width">
                            <view class="cu-tag bg-red"> 价钱 </view>
                            <view class="cu-tag line-red"> {{ item.price }} </view>
                        </view>

                        <view class="cu-capsule radius">
                            <view class="cu-tag bg-orange sm">
                                <uni-icons type="hand-up-filled" size="12" color="#ffffff"></uni-icons>
                            </view>
                            <view class="cu-tag line-orange sm"> {{ item.like_amount || 0 }} </view>
                        </view>

                        <view class="cu-capsule radius margin-left" v-if="item.product_status">
                            <view class="cu-tag bg-blue sm">
                                状态
                            </view>
                            <view class="cu-tag line-blue sm"> {{ item.product_status }} </view>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 无商品时显示空状态 -->
            <view v-else-if="!loading" class="empty-state">
                <view class="icon-container">
                    <uni-icons type="shop" size="48" color="#1890ff"></uni-icons>
                </view>
                <view class="empty-text">暂无热门商品</view>
                <view class="empty-subtext">目前还没有受欢迎的商品，稍后再来看看吧</view>
            </view>

            <!-- 加载状态 -->
            <view v-if="loading" class="loading-state">
                <uni-icons type="spinner-cycle" size="30" color="#666666"></uni-icons>
                <text class="loading-text">加载中...</text>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            products: [], // 存储商品的数组
            loading: true, // 加载状态
            baseUrl: "http://localhost:3000/" // 后端基础地址
        };
    },

    onLoad() {
        this.loadPopularProducts();
    },

    methods: {
        // 获取热门商品数据 - 使用与my_issue.vue相同的API端点
        async loadPopularProducts() {
            try {
                const token = uni.getStorageSync("token");
                if (!token) {
                    uni.showToast({
                        title: "请先登录",
                        icon: "none"
                    });
                    return;
                }

                this.loading = true;

                const { data: res } = await uni.request({
                    url: "http://localhost:3000/api/my/sale",
                    method: "GET",
                    header: {
                        Authorization: "Bearer " + token
                    }
                });

                if (res.code === 200) {
                    // 处理返回的商品数据并按点赞数降序排序
                    const sortedProducts = res.data
                        .map((item) => {
                            // 处理图片路径
                            const processedImages = Array.isArray(item.images)
                                ? item.images.map((img) => {
                                    // 如果已经是完整URL，直接返回
                                    if (img.startsWith("http")) {
                                        return img;
                                    }
                                    // 否则拼接完整URL
                                    return `${this.baseUrl}${img.replace(/\\/g, "/")}`;
                                })
                                : [];

                            return {
                                ...item,
                                images: processedImages,
                            };
                        })
                        .sort((a, b) => (b.like_amount || 0) - (a.like_amount || 0)); // 按点赞数降序排序

                    this.products = sortedProducts;
                    console.log("热门商品列表:", this.products);
                } else {
                    uni.showToast({
                        title: res.message || "获取热门商品失败",
                        icon: "none"
                    });
                }
            } catch (error) {
                console.error("获取热门商品失败:", error);
                uni.showToast({
                    title: "网络错误，请稍后重试",
                    icon: "none"
                });
            } finally {
                this.loading = false;
            }
        },

        // 处理商品图片数组
        getProductImages(item) {
            // 如果没有图片，返回空数组
            if (!item.images) return [];

            // 如果images是字符串（JSON字符串），尝试解析
            if (typeof item.images === 'string') {
                try {
                    return JSON.parse(item.images);
                } catch (e) {
                    return [item.images]; // 如果解析失败，将其作为单个图片处理
                }
            }

            // 如果已经是数组，直接返回
            if (Array.isArray(item.images)) {
                return item.images;
            }

            // 如果有单个image字段且images为空，使用image
            if (item.image && (!item.images || item.images.length === 0)) {
                return [item.image];
            }

            return [];
        },

    }
};
</script>

<style scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: #f8f8f8;
}

.pa {
    padding: 20rpx;
}

/* 内容 */
.contianer {
    width: 100%;
    height: auto;
    margin-bottom: 20rpx;
    position: relative;
    border-radius: 12rpx;
}

.contianer-title {
    display: flex;
}

.contianer-title_1 {
    font-size: 32rpx;
    color: black;
    width: 75%;
    margin-left: 20rpx;
}

.item-inline-1_1 {
    width: 300rpx;
}

.item-inlines {
    display: inline-block;
}

.item-inline {
    display: inline-block;
    margin-right: 10rpx;
    height: 150rpx;
    width: 230rpx;
    background-size: cover;
    background-position: center;
    border-radius: 8rpx;
}

.container-price_desc {
    display: flex;
    margin-top: 20rpx;
    align-items: center;
}

.view-width {
    width: 70%;
}

.margin-left {
    margin-left: 20rpx;
}

/* 已下架商品样式 */
.off-shelf-item {
    background-color: #f0f0f0;
}

.off-shelf-badge {
    position: absolute;
    top: 15rpx;
    right: 15rpx;
    background-color: rgba(49, 47, 47, 0.8);
    color: white;
    padding: 6rpx 16rpx;
    border-radius: 10rpx;
    font-size: 24rpx;
    z-index: 1;
    box-shadow: 0 2rpx 4rpx rgba(0, 0, 0, 0.1);
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
}

/* 加载状态 */
.loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 0;
}

.loading-text {
    margin-top: 20rpx;
    color: #666;
    font-size: 28rpx;
}
</style>