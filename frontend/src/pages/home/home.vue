<template>
  <!-- <bar></bar> -->
  <view class="">
    <!-- 搜索 -->
    <view class="cu-bar search bg-white" id="TabCurTab">
      <view class="search-form round">
        <text class="cuIcon-search"></text>
        <input type="text" v-model="searchKeyword" placeholder="搜索物品" confirm-type="search" @confirm="handleSearch" />
      </view>
      <view class="cu-avatar round search_img" :style="{ 'background-image': `url(${userAvatar})` }" @tap="toUserPage">
      </view>
    </view>
    <!-- 搜索end -->

    <!--头条滚动区域-->
    <swiper class="swiperitem margin-top solid-bottom" autoplay="true" vertical="true" circular="true"
      @click="lineschange">
      <block v-for="(item, index) in Headlines" :key="index">
        <swiper-item @click="linesclick">
          <view class="cu-bar bg-white">
            <view class="action">
              <text class="cuIcon-triangledownfill text-orange"></text>
              <text>头条：{{ item.title }}</text>
            </view>
          </view>
        </swiper-item>
      </block>
    </swiper>
    <!-- end -->

    <!-- 导航条 -->
    <TopBar @click="tabSelect" :TabCur="TabCur" :dataList="tablist"></TopBar>
    <!-- 导航条 -->
 <!-- 排序选择器 -->
 <view class="sort-container bg-white">
  <view class="sort-option" :class="{'active': sortField === 'created_at'}" @tap="setSort('created_at')">
    时间 <text class="sort-icon">{{ sortField === 'created_at' ? (sortOrder === 'asc' ? '↑' : '↓') : '↓' }}</text>
  </view>
  <view class="sort-option" :class="{'active': sortField === 'price'}" @tap="setSort('price')">
    价格 <text class="sort-icon">{{ sortField === 'price' ? (sortOrder === 'asc' ? '↑' : '↓') : '↑' }}</text>
  </view>
</view>
    <!-- 点击回到顶部 -->
    <view class="goTop">
      <image src="../../static/img/top_top.png" v-if="!showTop" @click="goTop"></image>
    </view>
    <!-- end -->

    <!-- 内容 -->
    <!-- 商品列表容器 -->
    <!-- 使用v-for循环渲染products数组中的每个商品 -->
    <view class="card-menu container" v-for="item in products" :key="item.product_id">
      <!-- 商品详情页导航 -->
      <!-- <navigator url="/pages/home/home_detail/home_detail" hover-class="none"> -->
      <navigator :url="'/pages/home/home_detail/home_detail?product_id=' + item.product_id
        " hover-class="none">
        <!-- 商品图片容器 -->
        <view class="container_img">
          <!-- 动态绑定图片路径，调用方法处理图片地址 -->
          <image :src="getImageUrl(item.image)"></image>
        </view>

        <!-- 商品标题容器 -->
        <view class="container_text">
          <!-- 显示商品标题 -->
          <text>{{ item.product_title }}</text>
        </view>

        <!-- 价格和状态容器 -->
        <view class="container_price">
          <!-- 显示商品价格（建议后续添加价格格式化） -->
          <text class="container_price_text_0">￥{{ item.price }}</text>
          <!-- 动态绑定状态标签样式 -->
          <view class="cu-tag" :class="getStatusClass(item.product_status)">
            {{ item.product_status }}
          </view>
        </view>
      </navigator>
    </view>
    <!-- 内容end -->
  </view>
</template>

<script>
import bar from "../component/bar.vue";
import TopBar from "../component/topTab.vue";
// import axios from "axios";
export default {
  data() {
    return {
      // 导航条
      TabCur: "0",
      scrollLeft: 0,
      // 导航条end
      scrollTop: 0, //屏幕位置
      TabCurTab: 0, //吸附置顶的偏差值
      ceil_top: "", //导航条置顶高度
      showTop: false, //异常
      products: [], // 初始化商品数据为空数组,
      sortField: 'created_at', // 默认按时间排序
      sortOrder: 'desc', // 默认降序（最新的在前面）
      iconList: [
        {
          icon: "cardboardfill",
          color: "red",
          badge: 120,
          name: "手机",
        },
        {
          icon: "recordfill",
          color: "orange",
          badge: 1,
          name: "图书",
        },
        {
          icon: "picfill",
          color: "yellow",
          badge: 0,
          name: "游戏交易",
        },
        {
          icon: "noticefill",
          color: "olive",
          badge: 22,
          name: "服装鞋帽",
        },
        {
          icon: "upstagefill",
          color: "cyan",
          badge: 0,
          name: "数码",
        },
        {
          icon: "clothesfill",
          color: "blue",
          badge: 0,
          name: "二手车",
        },
        {
          icon: "discoverfill",
          color: "purple",
          badge: 0,
          name: "电脑",
        },
        {
          icon: "questionfill",
          color: "mauve",
          badge: 0,
          name: "毕业季",
        },
        {
          icon: "commandfill",
          color: "purple",
          badge: 0,
          name: "寝室用品",
        },
        {
          icon: "brandfill",
          color: "美妆捡漏",
          badge: 0,
          name: "全部分类",
        },
      ],
      gridCol: 5,
      // 宫格列表end
      // 滚动title
      Headlines: [
        {
          id: 1,
          title: "测试标题1",
          type: 1,
        },
        {
          id: 2,
          title: "测试标题2",
          type: 2,
        },
        {
          id: 3,
          title: "测试标题3",
          type: 3,
        },
        {
          id: 4,
          title: "测试标题4",
          type: 4,
        },
      ],
      searchKeyword: "", // 搜索关键字
      userAvatar: "../../static/img/avatar.jpg", // 默认头像，稍后会更新
      showTop: false, //异常
      products: [], // 初始化商品数据为空数组,
    };
  },
  components: {
    bar,
    TopBar,
  },
  onLoad: function () {
    //搜索框的高度
    // this.selectTab();
    // var view = uni.createSelectorQuery().select("#navTab");
    // view.boundingClientRect(data => {
    // console.log("节点离页面顶部的距离为" + data);
    // }).exec();
  },
  onShow() {
    // 获取token
    console.log("首页页面显示");

    const token = uni.getStorageSync("token");
    if (!token) return;
    // 每次页面显示时从服务器获取最新用户信息
    uni.request({
      url: "http://localhost:3000/api/user/profile",
      header: {
        Authorization: `Bearer ${token}`,
      },
      success: (res) => {
        if (res.statusCode === 200) {
          const userInfo = res.data.user;
          // 更新本地存储
          uni.setStorageSync("userInfo", userInfo);
          console.log("用户信息已更新:", userInfo);

          // 设置头像(确保使用完整URL)
          if (userInfo.avatar) {
            // 检查是否已经是完整URL
            if (userInfo.avatar.startsWith("http")) {
              this.userAvatar = userInfo.avatar;
            } else {
              // 拼接完整URL
              this.userAvatar = `http://localhost:3000/${userInfo.avatar.replace(
                /\\/g,
                "/"
              )}`;
            }
            console.log("设置的头像URL:", this.userAvatar);

          }
        }
      },
      fail: () => {
        console.log("获取用户信息失败");
      },
    });
    // 每次显示页面时重新获取最新商品数据
    this.fetchProducts()
      .then(() => {
        console.log("首页商品数据已更新");
      })
      .catch((err) => {
        console.error("获取商品数据失败:", err);
      });
  },
  //下拉刷新
  onPullDownRefresh: function () {
    // 重新获取商品列表
    this.fetchProducts()
      .then(() => {
        // 停止下拉刷新动画
        uni.stopPullDownRefresh();
      })
      .catch((err) => {
        console.error("刷新数据失败:", err);
        uni.stopPullDownRefresh();
      });
  },
  //上拉刷新
  onReachBottom: function () {
    console.log("出发上拉刷新事件");
  },
  // 生命周期钩子：组件挂载完成后自动执行
  mounted() {
    this.fetchProducts();
  },

  methods: {
    // 获取商品数据的方法
    fetchProducts() {
  return new Promise((resolve, reject) => {
    // 使用 uni.request 替代 axios 获取商品数据
    uni.request({
      url: "http://localhost:3000/api/products", // API endpoint
      method: "GET", // HTTP method
      success: (res) => {
        if (res.statusCode === 200) {
          // 使用与详情页一致的判断标准过滤下架商品
          this.products = res.data.filter(item => item.is_off_shelf !== 1);
          console.log("商品数据已更新", this.products);
          resolve(this.products); // 解析Promise
        } else {
          console.error("请求失败", res);
          reject(new Error(res.errMsg || "请求失败")); // 拒绝Promise
        }
      },
      fail: (err) => {
        console.error("获取商品数据失败:", err);
        reject(err); // 拒绝Promise
      }
    });
  });
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
      if (!this.products || this.products.length === 0) return;
      
      const sortedProducts = [...this.products];
      
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
      this.products = sortedProducts;
    },
    /**
     * 处理图片路径的方法
     * @param {string} path - 后端返回的图片路径
     * @returns {string} 完整的图片URL地址
     */
    getImageUrl(path) {
      // 将Windows路径分隔符转换为URL标准分隔符
      // 如果已经是完整 URL，直接返回
      if (/^https?:\/\//.test(path)) {
        return path;
      }
      const formattedPath = path.replace(/\\/g, "/");
      // 拼接完整的图片访问地址（假设服务器运行在3000端口）
      return `http://localhost:3000/${formattedPath}`;
    },

    /**
     * 获取状态标签样式的动态类名
     * @param {string} status - 商品状态
     * @returns {Object} 包含样式类名的对象
     */
    getStatusClass(status) {
      return {
        // 全新状态使用橙色边框
        "line-orange": status === "全新",
        // 二手状态使用蓝色边框（需要定义对应的CSS类）
        "line-blue": status === "二手",
        // 其他状态使用绿色边框（需要定义对应的CSS类）
        "line-green": !["全新", "二手"].includes(status),
      };
    },

    // 处理搜索
    handleSearch() {
      if (!this.searchKeyword.trim()) {
        uni.showToast({
          title: "请输入搜索关键词",
          icon: "none",
        });
        return;
      }

      // 跳转到搜索结果页面，携带关键词参数
      uni.navigateTo({
        url: `/pages/search/search?keyword=${encodeURIComponent(
          this.searchKeyword
        )}`,
      });
    },
    // 点击头像跳转到个人页面
    toUserPage() {
      const token = uni.getStorageSync("token");
      if (!token) {
        // 未登录，跳转到登录页
        uni.navigateTo({
          url: "/pages/auth/login",
        });
      } else {
        // 已登录，跳转到我的页面
        uni.switchTab({
          url: "/pages/my/my",
        });
      }
    },
    // 导航条点击
    tabSelect(e) {
      // console.log(e) ;

      this.TabCur = e.currentTarget.dataset.id;
    },
    //  导航条点击end
    // 点击回到顶部
    onPageScroll: function (e) {
      // console.log(e)
      // this.setData({
      //   scrollTop: e.scrollTop
      // })
      this.scrollTop = e.scrollTop;

      if (e.scrollTop > 500) {
        this.showTop = false;
      } else {
        this.showTop = true;
      }
    },
    goTop: function () {
      uni.pageScrollTo({
        scrollTop: 0,
        duration: 300,
      });
    },
    //end

    // 吸附自顶的高度
    SelectorQuery: function () {
      var that = this;
      const query = wx.createSelectorQuery();
      query.select("#navTab").boundingClientRect();
      query.selectViewport().scrollOffset();
      query.exec(function (res) {
        console.log(res);
        // ceil_top: res[0].top - res[0].height - res[0].height
      });
    },

    //搜索框的高度
    selectTab: function () {
      var that = this;
      const query = wx.createSelectorQuery();
      query.select("#TabCurTab").boundingClientRect();
      query.selectViewport().scrollOffset();
      query.exec(function (res) {
        console.log(res);
        this.TabCurTab = res[0].bottom - res[0].height - 4;
      });
    },
  },
};
</script>

<style>
/* 吸附置顶 */
.navTab {
  position: fixed;
  z-index: 9999;
  top: 0;
}

/* end */

/* 搜索 */

.search_img {
  margin-right: 30rpx;
}

.locaWidth {
  width: 21%;
}

/* end */

/* 内容 */

.container {
  /* margin-left: 29rpx;
	margin-right: 20rpx; */
  float: left;
  height: 480rpx;
  width: 50%;
  background: white;
  /* margin-bottom: 20rpx; */
}

.container_img {
  display: flex;
  justify-content: center;
  /* 水平方向居中 */
  align-items: center;
  /* 垂直方向居中 */
}

.container_img image {
  height: 280rpx;
  /* 设置图片的高度为150rpx */
  width: 280rpx;
  /* 设置图片的宽度为150rpx，使其成为正方形 */
  object-fit: cover;
  /* 确保图片在容器内保持比例且不被拉伸 */
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

.container_price_text_1 {
  font-size: 22rpx;
}

.container_line {
  width: 100%;
  background: gainsboro;
  height: 1rpx;
  margin-top: 10rpx;
}

.container_user {
  margin-top: 20rpx;
  display: flex;
  line-height: 50rpx;
}

.container_user image {
  margin-left: 10rpx;
  margin-right: 50rpx;
  height: 50rpx;
  width: 50rpx;
}

/* end */

/* 滚动的title */

.swiperitem {
  background: #fff;
  height: 40px;
  margin-left: 30rpx;
  margin-right: 30rpx;
}

/* end */

.cu-list.grid.no-border {
  border-radius: 0rpx;
}

/* 3布局 */

.canui-xzwz {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.canui-duotu {
  padding: 20rpx 30rpx;
  padding-left: 380rpx;
  padding-bottom: 30rpx;
  position: relative;
  display: flex;
}

.canui-dtimg-a {
  position: absolute;
  left: 30rpx;
  width: 344rpx;
  height: 348rpx;
}

.canui-dtimg-b {
  height: 348rpx;
  width: 100%;
}

.canui-dtimg-ba,
.canui-dtimg-bb {
  height: 172rpx;
}

.canui-dtimg-bb {
  margin-top: 5rpx;
}

.canui-dtimg-content {
  position: relative;
}

.canui-dtimg-content,
.canui-duotu image {
  width: 100%;
  height: 100%;
}

.canui-dtimg-text {
  position: absolute;
  bottom: 0px;
  background: rgba(0, 0, 0, 0.4);
  height: 60rpx;
  line-height: 60rpx;
  padding: 0 15rpx;
}

.canui-dtimg-text .text-white {
  float: left;
  width: auto;
  max-width: 210rpx;
  margin-right: 10rpx;
  color: #aaa;
}

.canui-dtimg-text .text-price {
  float: right;
}

.canui-dtimg-a .canui-dtimg-text {
  border-radius: 0 0 0 10rpx;
}

.canui-dtimg-b .canui-dtimg-text .text-white {
  max-width: 150rpx;
}

.cu-card>.cu-item {
  margin-top: 0rpx;
}

.cu-card>.margin-top {
  margin-top: 30rpx;
}

/* end */

/* 点击回到顶部 */

.goTop image {
  height: 60rpx;
  width: 60rpx;
  border-radius: 100%;
  position: fixed;
  bottom: 150rpx;
  right: 60rpx;
  z-index: 10000;
}

/* end */

/* 撑高线条 */
.lines {
  display: flex;
  width: 100%;
  height: 150rpx;
}

/* end */

/* 页脚 */
.foot {
  display: flex;
  padding: 10rpx;
  align-items: center;
  justify-content: space-between;
}

.foot-1 {
  width: 35%;
  height: 1rpx;
  background: gainsboro;
}

/* end */

/* 登陆按钮 */
.loginButton {
  width: 100%;
}
/* end */
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
/* 页脚 */
</style>