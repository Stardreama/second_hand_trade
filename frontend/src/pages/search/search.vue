<template>
    <view>
      <!-- 顶部搜索框 -->
      <view class="cu-bar search bg-white">
        <view class="search-form round">
          <text class="cuIcon-search"></text>
          <input type="text" v-model="keyword" placeholder="搜索物品" confirm-type="search" @confirm="searchProducts" />
        </view>
        <view class="action">
          <button class="cu-btn bg-blue shadow-blur round" @tap="searchProducts">搜索</button>
        </view>
      </view>
      
      <!-- 搜索结果 -->
      <view class="result-info padding-sm text-grey" v-if="searchDone">
        搜索结果：共 {{ searchResults.length }} 个商品
      </view>
      
      <!-- 搜索结果列表，复用首页的商品卡片样式 -->
      <view class="card-menu container" v-for="item in searchResults" :key="item.product_id">
        <navigator :url="`/pages/home/home_detail/home_detail?product_id=${item.product_id}`" hover-class="none">
          <view class="container_img">
            <image :src="getImageUrl(item.image)"></image>
          </view>
          <view class="container_text">
            <text>{{ item.product_title || item.description }}</text>
          </view>
          <view class="container_price">
            <text class="container_price_text_0">￥{{ item.price }}</text>
            <view class="cu-tag" :class="getStatusClass(item.product_status)">
              {{ item.product_status || '二手' }}
            </view>
          </view>
        </navigator>
      </view>
      
      <!-- 无结果提示 -->
      <view class="no-result" v-if="searchDone && searchResults.length === 0">
        <text class="cuIcon-searchlist text-gray"></text>
        <text class="text-gray">暂无相关商品</text>
      </view>
    </view>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        keyword: '',
        searchResults: [],
        searchDone: false
      };
    },
    onLoad(options) {
      if (options.keyword) {
        this.keyword = decodeURIComponent(options.keyword);
        this.searchProducts();
      }
    },
    methods: {
      // 搜索商品
      async searchProducts() {
        if (!this.keyword.trim()) {
          uni.showToast({
            title: '请输入搜索关键词',
            icon: 'none'
          });
          return;
        }
        
        uni.showLoading({ title: '正在搜索...' });
        
        try {
          const response = await axios.get(`http://localhost:3000/api/products/search?keyword=${encodeURIComponent(this.keyword)}`);
          this.searchResults = response.data;
          this.searchDone = true;
          
          uni.hideLoading();
        } catch (error) {
          console.error('搜索失败:', error);
          uni.hideLoading();
          uni.showToast({
            title: '搜索失败，请重试',
            icon: 'none'
          });
        }
      },
      
      // 处理图片路径
      getImageUrl(path) {
        if (!path) return '../../static/img/no-image.png';
        const formattedPath = path.replace(/\\/g, "/");
        return `http://localhost:3000/${formattedPath}`;
      },
      
      // 获取状态标签样式
      getStatusClass(status) {
        return {
          "line-orange": status === "全新",
          "line-blue": status === "二手",
          "line-green": !["全新", "二手"].includes(status),
        };
      }
    }
  };
  </script>
  
  <style>
  .result-info {
    padding: 20rpx 30rpx;
    font-size: 24rpx;
  }
  
  .no-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 200rpx;
  }
  
  .no-result .cuIcon-searchlist {
    font-size: 100rpx;
    margin-bottom: 30rpx;
  }
  
  .container {
    float: left;
    height: 480rpx;
    width: 50%;
    background: white;
  }
  
  .container_img image {
    height: 300rpx;
    width: 100%;
  }
  
  .container_text {
    color: black;
    padding: 10rpx;
    height: 50rpx;
    font-size: 23rpx;
  }
  
  .container_price {
    display: flex;
    justify-content: space-between;
    padding-left: 8rpx;
    padding-right: 8rpx;
  }
  
  .container_price_text_0 {
    color: red;
    font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
  }
  </style>