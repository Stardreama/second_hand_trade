<template>
    <view class="container">
        <!-- 我的收藏列表 -->
        <view class="pa">
            <!-- 有商品时显示商品列表 -->
            <view v-if="products && products.length > 0">
                <view class="contianer shadow-warp bg-white padding-sm" v-for="(item, index) in products"
                    :key="item.product_id" :class="{ 'off-shelf-item': item.is_off_shelf === 1 }" 
                    @tap="navigateToDetail(item.product_id)">

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
                    
                    <!-- 添加取消收藏按钮 -->
                    <view class="unfavorite-btn" @tap.stop="removeFavorite(item.product_id)">
                        <uni-icons type="star-filled" size="16" color="#ff3333"></uni-icons>
                        <text>取消收藏</text>
                    </view>
                </view>
            </view>

            <!-- 无商品时显示空状态 -->
            <view v-else-if="!loading" class="empty-state">
                <view class="icon-container">
                    <uni-icons type="star" size="48" color="#1890ff"></uni-icons>
                </view>
                <view class="empty-text">暂无收藏商品</view>
                <view class="empty-subtext">您还没有收藏任何商品，快去逛逛吧</view>
                <button class="cu-btn bg-blue margin-top" @tap="navigateToHome">去逛逛</button>
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
        uni.setNavigationBarTitle({
            title: "我的收藏"
        });
        this.loadFavoriteProducts();
    },
      
    onShow() {
        // 页面每次显示时重新加载数据
        this.loadFavoriteProducts();
    },

    methods: {
     // 优化加载方法
     async loadFavoriteProducts() {
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
                
                // 使用 Promise 方式处理请求
                const res = await new Promise((resolve, reject) => {
                    uni.request({
                        url: "http://localhost:3000/api/products/favorite",
                        method: "GET",
                        header: {
                            Authorization: "Bearer " + token
                        },
                        success: (result) => {
                            resolve(result.data);
                        },
                        fail: (err) => {
                            reject(err);
                        }
                    });
                });
                
                // 打印返回数据，帮助调试
                console.log("收藏商品数据:", res);
                
                if (res.code === 200 && Array.isArray(res.data)) {
                    // 处理返回的商品数据
                    this.products = res.data.map(item => {
                        // 确保 product_title 存在
                        if (!item.product_title && item.title) {
                            item.product_title = item.title;
                        }
                        
                        // 处理 images 字段，确保它可用
                        if (item.images) {
                            // 如果是字符串，尝试解析成数组
                            if (typeof item.images === 'string') {
                                try {
                                    item.images = JSON.parse(item.images);
                                } catch (e) {
                                    console.error('解析图片 JSON 失败:', e);
                                    item.images = item.images ? [item.images] : [];
                                }
                            }
                        } else {
                            item.images = [];
                        }
                        
                        return item;
                    });
                    
                    console.log("处理后的商品数据:", this.products);
                } else {
                    console.error("获取收藏商品返回格式错误:", res);
                    uni.showToast({
                        title: res.message || "获取收藏商品失败",
                        icon: "none"
                    });
                }
            } catch (error) {
                console.error("获取收藏商品失败:", error);
                uni.showToast({
                    title: "网络错误，请稍后重试",
                    icon: "none"
                });
            } finally {
                this.loading = false;
            }
        },

        // 改进图片处理方法
        getProductImages(item) {
            // 如果没有图片，返回空数组
            if (!item.images) return [];
            
            // 打印当前项的图片数据，帮助调试
            console.log(`商品 ${item.product_id} 的图片数据:`, item.images);

            // 如果images是字符串（JSON字符串），尝试解析
            if (typeof item.images === 'string') {
                try {
                    const parsedImages = JSON.parse(item.images);
                    return this.processImageUrls(parsedImages);
                } catch (e) {
                    console.error('解析图片JSON失败:', e);
                    return this.processImageUrls([item.images]);
                }
            }

            // 如果已经是数组
            if (Array.isArray(item.images)) {
                return this.processImageUrls(item.images);
            }

            // 如果有单个image字段
            if (item.image) {
                return this.processImageUrls([item.image]);
            }

            return [];
        },
        
        // 新增方法：处理图片URL
        processImageUrls(images) {
            return images.map(img => {
                if (!img) return '';
                
                // 如果已经是完整URL
                if (img.startsWith('http')) {
                    return img;
                }
                
                // 处理路径并拼接基础URL
                const formattedPath = img.replace(/\\/g, '/');
                return `${this.baseUrl}${formattedPath}`;
            }).filter(url => url); // 过滤掉空URL
        },
        
        navigateToDetail(productId) {
            uni.navigateTo({
                url: `/pages/home/home_detail/home_detail?product_id=${productId}`
            });
        },
        
        // 添加移除收藏的方法
        removeFavorite(productId) {
            const token = uni.getStorageSync("token");
            if (!token) {
                uni.showToast({ 
                    title: "请先登录", 
                    icon: "none" 
                });
                return;
            }
            
            uni.showLoading({ title: "处理中..." });
            
            uni.request({
                url: "http://localhost:3000/api/products/favorite",
                method: "POST",
                data: {
                    productId: productId,
                },
                header: {
                    Authorization: `Bearer ${token}`,
                },
                success: (res) => {
                    uni.hideLoading();
                    if (res.statusCode === 200 && res.data.favorited === false) {
                        // 取消收藏成功后，从列表中移除该商品
                        this.products = this.products.filter(item => item.product_id !== productId);
                        uni.showToast({
                            title: "已取消收藏",
                            icon: "success"
                        });
                    } else {
                        console.error("取消收藏失败:", res.data);
                        uni.showToast({
                            title: res.data.message || "操作失败，请重试",
                            icon: "none"
                        });
                    }
                },
                fail: (err) => {
                    uni.hideLoading();
                    console.error("取消收藏操作失败:", err);
                    uni.showToast({
                        title: "网络错误，请稍后再试",
                        icon: "none"
                    });
                },
            });
        },
        
        // 添加返回首页的方法
        navigateToHome() {
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
    margin-bottom: 20rpx;
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

/* 取消收藏按钮 */
.unfavorite-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20rpx;
    padding: 10rpx 0;
    background-color: #f8f8f8;
    border-radius: 8rpx;
    font-size: 24rpx;
    color: #ff3333;
}

.unfavorite-btn text {
    margin-left: 10rpx;
}
</style>