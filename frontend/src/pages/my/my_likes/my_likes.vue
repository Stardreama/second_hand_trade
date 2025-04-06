<template>
    <view>
      <!-- 排序控制器 -->
      <view class="sort-container">
        <view class="sort-item" :class="{ active: sortBy === 'newest' }" @tap="changeSort('newest')">
          <text>最新收藏</text>
        </view>
        <view class="sort-item" :class="{ active: sortBy === 'price_asc' }" @tap="changeSort('price_asc')">
          <text>价格</text>
          <text class="sort-icon" v-if="sortBy === 'price_asc'">↑</text>
          <text class="sort-icon" v-else-if="sortBy === 'price_desc'">↓</text>
        </view>
      </view>
  
      <!-- 内容区域 -->
      <view class="pa">
        <!-- 有商品时显示列表 -->
        <view v-if="products && products.length > 0">
          <view class="contianer shadow-warp bg-white padding-sm" v-for="(item, index) in sortedList"
            :key="item.product_id" :class="{ 'off-shelf-item': item.is_off_shelf === 1 }">
            
            <!-- 添加下架标识 -->
            <view class="off-shelf-badge" v-if="item.is_off_shelf === 1">已下架</view>
            
            <!-- 商品标题 -->
            <view class="contianer-title">
              <view class="contianer-title_1 text-cut"><text class="text-cut">{{ item.product_title }}</text></view>
            </view>
  
            <!-- 商品图片 -->
            <view class="item-inline-1_1"><text decode="true">&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;</text></view>
            <scroll-view scroll-x="true" style="white-space: nowrap; display: flex" class="top-20">
              <block v-for="(img, imgIndex) in item.images ? item.images.slice(0, 3) : []" :key="imgIndex">
                <view class="item-inlines">
                  <navigator :url="`/pages/home/home_detail/home_detail?product_id=${item.product_id}`" hover-class="none">
                    <view class="item-inline bg-img padding-top-xl flex align-end"
                      :style="'background-image: url(' + img + ');'">
                    </view>
                  </navigator>
                </view>
              </block>
            </scroll-view>
  
            <!-- 价格和点赞信息 -->
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
            </view>
  
            <!-- 操作按钮 -->
            <view class="container-compile">
              <view class="cu-tag line-blue" @tap="viewDetail(item.product_id)">查看详情</view>
              <view class="cu-tag line-red" @tap="removeFavorite(item.product_id)">取消收藏</view>
            </view>
  
            <view class="container-line"></view>
          </view>
        </view>
  
        <!-- 无收藏商品时显示空状态 -->
        <view v-else-if="!loading" class="empty-state">
          <view class="icon-container">
            <view class="empty-icon">❤</view>
          </view>
          <view class="empty-text">暂无收藏商品</view>
          <view class="empty-subtext">喜欢的商品，一键收藏</view>
          <button class="cu-btn bg-blue margin-top" @tap="goToHome">去逛逛</button>
        </view>
  
        <!-- 加载中状态 -->
        <view v-else class="loading-state">
          <view class="cu-load loading"></view>
          <text>加载中...</text>
        </view>
      </view>
    </view>
  </template>
  
  <script>
  export default {
    data() {
      return {
        baseUrl: "http://localhost:3000/", // 后端基础地址
        products: [], // 收藏的商品列表
        loading: false, // 加载状态
        sortBy: "newest", // 默认排序方式
      };
    },
  
    computed: {
      // 计算属性：根据当前排序方式返回排序后的商品列表
      sortedList() {
        if (!this.products || this.products.length === 0) {
          return [];
        }
  
        const list = [...this.products];
  
        switch (this.sortBy) {
          case "price_asc":
            return list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
          case "price_desc":
            return list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
          case "newest":
          default:
            return list.sort((a, b) => {
              const dateA = new Date(a.created_at || 0);
              const dateB = new Date(b.created_at || 0);
              return dateB - dateA;
            });
        }
      },
    },
  
    methods: {
      // 更改排序方式
      changeSort(sort) {
        if (sort === "price_asc" && this.sortBy === "price_asc") {
          // 如果当前是价格升序，点击后切换为价格降序
          this.sortBy = "price_desc";
        } else {
          this.sortBy = sort;
        }
      },
  
      // 加载收藏商品数据
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
    
    const { data: res } = await uni.request({
        url: `${this.baseUrl.replace(/\/$/, '')}/api/products/favorite`,
  method: "GET",
  header: { Authorization: "Bearer " + token }
    });

    console.log("收藏商品返回数据:", res);

    if (res.code === 200 && Array.isArray(res.data)) {
      // 处理图片路径和其他数据
      this.products = res.data.map((item) => {
        // 处理图片路径
        const processedImages = Array.isArray(item.images) 
          ? item.images 
          : (typeof item.images === 'string' && item.images ? JSON.parse(item.images) : []);
          
        const imageUrls = Array.isArray(processedImages) 
          ? processedImages.map((img) => {
              if (img && img.startsWith("http")) {
                return img;
              }
              return img ? `${this.baseUrl}${img.replace(/\\/g, "/")}` : "";
            })
          : [];

        return {
          ...item,
          images: imageUrls,
        };
      });

      console.log("处理后的收藏商品列表:", this.products);
    } else {
      uni.showToast({
        title: res.message || "获取收藏列表失败",
        icon: "none",
      });
    }
  } catch (error) {
    console.error("收藏数据加载失败:", error);
    uni.showToast({ title: "收藏数据加载失败", icon: "none" });
  } finally {
    this.loading = false;
  }
},
  
      // 查看商品详情
      viewDetail(productId) {
        uni.navigateTo({
          url: `/pages/home/home_detail/home_detail?product_id=${productId}`
        });
      },
  
      // 取消收藏
      async removeFavorite(productId) {
        try {
          const token = uni.getStorageSync("token");
          if (!token) {
            uni.showToast({
              title: "请先登录",
              icon: "none",
            });
            return;
          }
  
          const { data: res } = await uni.request({
            url: `${this.baseUrl}api/products/favorite`,
            method: "POST",
            header: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json"
            },
            data: {
              productId
            }
          });
  
          if (res.favorited === false) {
            uni.showToast({
              title: "已取消收藏",
              icon: "success",
            });
            // 重新加载收藏列表
            this.loadFavoriteProducts();
          } else {
            uni.showToast({
              title: res.message || "操作失败",
              icon: "none",
            });
          }
        } catch (error) {
          console.error("取消收藏失败:", error);
          uni.showToast({
            title: "操作失败，请稍后重试",
            icon: "none",
          });
        }
      },
  
      // 跳转到首页
      goToHome() {
        uni.switchTab({
          url: "/pages/home/home"
        });
      }
    },
  
    onShow() {
      // 每次页面显示时重新加载收藏数据
      this.loadFavoriteProducts();
    },
  
    onPullDownRefresh() {
      // 下拉刷新
      this.loadFavoriteProducts();
      setTimeout(() => {
        uni.stopPullDownRefresh();
      }, 1000);
    }
  };
  </script>
  
  <style scoped>
  .pa {
    padding: 20rpx;
  }
  
  /* 内容 */
  .contianer {
    width: 100%;
    height: 400rpx;
    margin-bottom: 20rpx;
    position: relative;
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
  }
  
  .container-price_desc {
    display: flex;
    margin-top: 20rpx;
    align-items: center;
  }
  
  .view-width {
    width: 70%;
  }
  
  .container-compile {
    display: flex;
    margin-top: 20rpx;
    justify-content: flex-end;
    gap: 20rpx;
  }
  
  /* 排序控制器样式 */
  .sort-container {
    display: flex;
    background-color: #fff;
    padding: 20rpx;
    margin: 20rpx;
    border-radius: 12rpx;
    box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  }
  
  .sort-item {
    flex: 1;
    text-align: center;
    font-size: 28rpx;
    color: #666;
    padding: 12rpx 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .sort-item.active {
    color: #1890ff;
    font-weight: bold;
  }
  
  .sort-item.active::after {
    content: '';
    position: absolute;
    bottom: -6rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 40rpx;
    height: 4rpx;
    background-color: #1890ff;
  }
  
  .sort-icon {
    margin-left: 6rpx;
    font-size: 24rpx;
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
  
  .empty-icon {
    font-size: 80rpx;
    color: #ff4d4f;
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
  
  /* 加载状态样式 */
  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx 0;
  }
  
  /* 下架商品样式 */
  .off-shelf-item {
    background-color: #f5f5f5;
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
  </style>