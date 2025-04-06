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
  <!-- 排序选择器 -->
  <view class="sort-container bg-white">
  <view class="sort-option" :class="{'active': sortField === 'created_at'}" @tap="setSort('created_at')">
    时间 <text class="sort-icon">{{ sortField === 'created_at' ? (sortOrder === 'asc' ? '↑' : '↓') : '↓' }}</text>
  </view>
  <view class="sort-option" :class="{'active': sortField === 'price'}" @tap="setSort('price')">
    价格 <text class="sort-icon">{{ sortField === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : '↑' }}</text>
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
      searchDone: false,
      sortField: 'created_at', // 默认按时间排序
      sortOrder: 'desc' // 默认降序（最新的在前面）
    };
  },
  onLoad(options) {
    if (options.keyword) {
      this.keyword = decodeURIComponent(options.keyword);
      this.searchProducts();
    }
  },
  methods: {
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
    // 过滤掉下架的商品，与首页保持一致的判断标准
    this.searchResults = response.data.filter(item => item.is_off_shelf !== 1);
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

// 设置排序方式
setSort(field) {
  // 如果点击当前已选择的排序字段，则切换排序顺序
  if (this.sortField === field) {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    // 切换排序字段
    this.sortField = field;
    // 时间默认降序（最新的在前），价格默认升序（便宜的在前）
    this.sortOrder = field === 'created_at' ? 'desc' : 'asc';
  }
  
  // 应用排序
  this.applySorting();
},
// 应用排序逻辑
applySorting() {
  // 如果没有商品数据，直接返回
  if (!this.searchResults || this.searchResults.length === 0) return;
  
  const sortedProducts = [...this.searchResults];
  
  sortedProducts.sort((a, b) => {
    let valueA, valueB;
    
    if (this.sortField === 'price') {
      // 价格排序 - 数值比较
      valueA = parseFloat(a.price) || 0;
      valueB = parseFloat(b.price) || 0;
    } else {
      // 时间排序 - 使用post_time或其他可用的时间字段
      const timeFieldA = a.created_at || a.post_time || a.update_time || 0;
      const timeFieldB = b.created_at || b.post_time || b.update_time || 0;
      
      valueA = timeFieldA ? new Date(timeFieldA).getTime() : 0;
      valueB = timeFieldB ? new Date(timeFieldB).getTime() : 0;
    }
    
    // 根据排序顺序返回比较结果
    return this.sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
  });
  
  // 更新排序后的商品列表
  this.searchResults = sortedProducts;
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
.container_price_text_0 {
  color: red;
  font-family: "Franklin Gothic Medium", "Arial Narrow", Arial, sans-serif;
}

/* 排序选择器样式 */
.sort-container {
  display: flex;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.sort-option {
  margin-right: 40rpx;
  font-size: 26rpx;
  color: #666;
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  border: 1rpx solid #e0e0e0;  /* 添加灰色边框 */
}

.sort-option.active {
  color: #ffffff;
  background-color: #f37b1d;
  font-weight: bold;
  border: 1rpx solid #f37b1d;  /* 活跃状态边框色与背景色一致 */
}

.sort-icon {
  margin-left: 4rpx;
  display: inline-block;  /* 确保箭头总是显示 */
}
</style>