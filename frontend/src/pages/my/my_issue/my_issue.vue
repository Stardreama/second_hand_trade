<template>
  <view>
    <!-- 排序控制器 -->
    <view class="sort-container">
      <view class="sort-item" :class="{ active: sortBy === 'newest' }" @tap="changeSort('newest')">
        <text>最新发布</text>
      </view>
      <view class="sort-item" :class="{ active: sortBy === 'likes' }" @tap="changeSort('likes')">
        <text>点赞最多</text>
        <text class="sort-icon" v-if="sortBy === 'likes'">↓</text>
      </view>
      <view class="sort-item" :class="{ active: sortBy === 'price_asc' }" @tap="changeSort('price_asc')">
        <text>价格</text>
        <text class="sort-icon" v-if="sortBy === 'price_asc'">↑</text>
        <text class="sort-icon" v-else-if="sortBy === 'price_desc'">↓</text>
      </view>
    </view>

    <!-- 内容 -->
    <view class="pa">
      <!-- 有商品时显示商品列表 -->
      <view v-if="productList && productList.length > 0">
        <view class="contianer shadow-warp bg-white padding-sm" v-for="(item, index) in sortedList"
          :key="item.product_id" :class="{ 'off-shelf-item': item.is_off_shelf === 1 }">

          <!-- 添加下架标识 -->
          <view class="off-shelf-badge" v-if="item.is_off_shelf === 1">已下架</view>
          <view class="contianer-title">
            <view class="contianer-title_1 text-cut"><text class="text-cut">{{ item.product_title }}</text></view>
          </view>

          <view class="item-inline-1_1"><text decode="true">&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;</text></view>
          <scroll-view scroll-x="true" style="white-space: nowrap; display: flex" class="top-20">
            <block v-for="(img, imgIndex) in item.images.slice(0, 3)" :key="imgIndex">
              <view class="item-inlines">
                <navigator url="" hover-class="none">
                  <view class="item-inline bg-img padding-top-xl flex align-end"
                    :style="'background-image: url(' + img + ');'">
                  </view>
                </navigator>
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

            <view class="cu-capsule radius margin-left">
              <view class="cu-tag bg-brown sm">
                <text class="cuIcon-message"></text>
              </view>
              <view class="cu-tag line-brown sm"> 23 </view>
            </view>
          </view>
          <view class="container-compile">
            <!-- 根据下架状态显示不同的操作按钮 -->
            <block v-if="item.is_off_shelf === 1">
              <view class="cu-tag line-blue" @tap="onShelfProduct(item.product_id)">重新上架</view>
              <view class="cu-tag line-yellow" @tap="actionSheetTap(item)">更多</view>
            </block>
            <block v-else>
              <view class="cu-tag line-yellow" @tap="show_model(item)">降价</view>
              <view class="cu-tag line-yellow" @tap="toIssue(item)">编辑</view>
              <view class="cu-tag line-yellow" @tap="actionSheetTap(item)">更多</view>
            </block>
          </view>

          <view class="container-line"></view>
        </view>
      </view>

      <!-- 无商品时显示空状态 -->
      <view v-else class="empty-state">
        <view class="icon-container">
          <InboxOutlined class="empty-icon" />
        </view>
        <view class="empty-text">暂未发布任何商品</view>
        <view class="empty-subtext">分享闲置，让物品找到新主人</view>
        <button class="cu-btn bg-blue margin-top" @tap="toPublish">
          去发布
        </button>
      </view>
    </view>

    <!-- 自定义弹窗 -->
    <view class="showModel bg-white" @touchmove.stop="pageModel" v-if="show_model_state">
      <view class="model" @touchmove.stop="model_page">
        <view class="model-close" @tap="close_Model">
          <text class="cuIcon-roundclose text-df text-gray"></text>
        </view>

        <view class="model-title_desc">
          <view class="model-title_desc-1">
            <image :src="currentProduct &&
              currentProduct.images &&
              currentProduct.images.length > 0
              ? currentProduct.images[0]
              : 'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg'
              "></image>
          </view>
          <view class="model-title_desc-2">
            <view class="model-title_desc-2_1">
              <text class="model-title_desc-2_1_text">现价</text>
              <text class="text-price text-red" style="font-weight: 600">
                {{ currentProduct ? currentProduct.price : 0 }}
              </text>
            </view>
            <view class="model-title_desc-2_2"><text class="model-title_desc-2_2_1_text">降价至</text><text
                class="text-price model-title_desc-2_2_text">{{
                  dep_price
                }}</text></view>
          </view>
        </view>

        <view class="slect_model">
          <view class="modle-select" :class="item.checked ? 'select_state' : ''" v-for="(item, index) in re_price"
            :key="index" @tap="select_price" :data-price="item.price" :data-id="index">
            <view class="modle-select-1">
              <view class="cu-tag bg-red">{{ item.price }}元</view>
            </view>
            <view class="modle-select-2">
              <text>{{ item.desc }}</text>
            </view>
          </view>

          <button class="cu-btn bg-green button-confirm" @tap="confirmPriceChange">
            确定
          </button>
        </view>
      </view>
      <!-- end -->
    </view>
  </view>
</template>

<script>
// 导入 Ant Design Vue 图标
import { InboxOutlined } from "@ant-design/icons-vue";

export default {
  // 注册图标组件
  components: {
    InboxOutlined,
  },

  data() {
    return {
      baseUrl: "http://localhost:3000/", // 后端基础地址
      productList: [], // 商品列表数据
      sortBy: 'newest', // 默认按最新排序
      url: "https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg",
      //降价Model状态
      show_model_state: false,
      currentProduct: null, // 添加当前操作的商品
      // 降价选择数据
      re_price: [
        { id: 0, price: 0, desc: "打1折极速卖", discount: 0.1 },
        { id: 1, price: 0, desc: "打3折出手快", discount: 0.3 },
        { id: 2, price: 0, desc: "打5折有竞争力", discount: 0.5 },
        { id: 3, price: 0, desc: "打8折", discount: 0.8 },
      ],
      dep_price: "",
    };
  },

  computed: {
    // 计算属性：根据当前排序方式返回排序后的商品列表
    sortedList() {
      if (!this.productList || this.productList.length === 0) {
        return [];
      }

      const list = [...this.productList];

      switch (this.sortBy) {
        case 'likes':
          return list.sort((a, b) => (b.like_amount || 0) - (a.like_amount || 0));
        case 'price_asc':
          return list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        case 'price_desc':
          return list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        case 'newest':
        default:
          return list.sort((a, b) => {
            const dateA = new Date(a.created_at || 0);
            const dateB = new Date(b.created_at || 0);
            return dateB - dateA;
          });
      }
    }
  },


  methods: {

    // 更改排序方式
    changeSort(sort) {
      if (sort === 'price_asc' && this.sortBy === 'price_asc') {
        // 如果当前是价格升序，点击后切换为价格降序
        this.sortBy = 'price_desc';
      } else {
        this.sortBy = sort;
      }
    },
    async loadSalesData() {
      try {
        const token = uni.getStorageSync("token");
        const { data: res } = await uni.request({
          url: "http://localhost:3000/api/my/sale",
          method: "GET",
          header: { Authorization: "Bearer " + token },
        });

        if (res.code === 200) {
          // 后端已经处理好了图片数组，直接使用即可
          this.productList = res.data.map((item) => {
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
          });

          console.log("处理后的商品列表:", this.productList);
        } else {
          uni.showToast({
            title: res.message || "获取商品列表失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("数据加载失败:", error);
        uni.showToast({ title: "数据加载失败", icon: "none" });
      }
    },

    toIssue(item) {
      if (!item || !item.product_id) {
        uni.showToast({
          title: '商品信息不完整',
          icon: 'none'
        });
        return;
      }

      // 跳转到编辑页面
      uni.navigateTo({
        url: `/pages/issue/issue_edit/issue_edit?product_id=${item.product_id}`
      });
    },

    // 新增方法 - 跳转到发布页面
    toPublish() {
      uni.switchTab({
        url: "/pages/issue/issue",
      });
    },

    // 拦截弹窗 滚动
    pageModel: function (e) { },
    // 拦截弹窗 滚动
    model_page: function (e) { },

    // 点击选择
    select_price: function (e) {
      var that = this;
      var id = e.currentTarget.dataset.id;
      var re_priceList = that.re_price;
      for (var i = 0; i < re_priceList.length; i++) {
        if (re_priceList[i].id == id) {
          re_priceList[i].checked = true;
          // 设置选中的价格
          this.dep_price = re_priceList[i].price;
        } else {
          re_priceList[i].checked = false;
        }
      }
      this.re_price = re_priceList;
    },

    // 关闭降价Model
    close_Model: function (e) {
      var that = this;
      this.show_model_state = false;

      var re_priceList = that.re_price;
      for (var i = 0; i < re_priceList.length; i++) {
        if (0 == i) {
          re_priceList[0].checked = true;
        } else {
          re_priceList[i].checked = false;
        }
      }

      this.re_price = re_priceList;
    },

    // 点击显示 降价弹窗
    show_model: function (item) {
      var that = this;
      console.log("当前商品:", item);

      // 保存当前操作的商品
      this.currentProduct = item;

      // 根据商品的当前价格计算不同折扣的价格
      const originalPrice = item.price;
      for (let i = 0; i < that.re_price.length; i++) {
        that.re_price[i].price = parseFloat((originalPrice * that.re_price[i].discount).toFixed(2));

        // 默认选中第一个
        if (i === 0) {
          that.re_price[i].checked = true;
        } else {
          that.re_price[i].checked = false;
        }
      }

      // 设置默认选中价格
      this.dep_price = that.re_price[0].price;

      // 显示弹窗
      this.show_model_state = true;
    },

    // 显示编辑
    actionSheetTap(item) {
      this.currentProduct = item; // 保存当前操作的商品
      uni.showActionSheet({
        itemList: ["标记为已卖出", "下架", "删除"], // 将"分享"改为"标记为已卖出"
        success: (e) => {
          console.log(e.tapIndex);
          if (e.tapIndex === 0) { // 标记为已卖出
            this.markAsSold(item);
          } else if (e.tapIndex === 1) { // 下架操作
            this.offShelfProduct(item.product_id);
          } else if (e.tapIndex === 2) {
            // 删除功能
            this.deleteProduct(item.product_id);
          }
        },
      });
    },

    // 下架商品方法
    async offShelfProduct(productId) {
      try {
        const token = uni.getStorageSync("token");
        const { data: res } = await uni.request({
          url: "http://localhost:3000/api/products/status",
          method: "POST",
          header: {
            Authorization: "Bearer " + token,
          },
          data: {
            productId: productId,
            status: "off_shelf" // 设置为下架状态
          }
        });

        if (res.code === 200) {
          uni.showToast({
            title: "商品已下架",
            icon: "success"
          });
          // 刷新数据
          this.loadSalesData();
        } else {
          uni.showToast({
            title: res.message || "操作失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("下架商品失败:", error);
        uni.showToast({
          title: "操作失败，请稍后重试",
          icon: "none"
        });
      }
    },

    // 重新上架商品方法
    async onShelfProduct(productId) {
      try {
        const token = uni.getStorageSync("token");
        const { data: res } = await uni.request({
          url: "http://localhost:3000/api/products/status",
          method: "POST",
          header: {
            Authorization: "Bearer " + token,
          },
          data: {
            productId: productId,
            status: "on_sale" // 设置为在售状态
          }
        });

        if (res.code === 200) {
          uni.showToast({
            title: "商品已上架",
            icon: "success"
          });
          // 刷新数据
          this.loadSalesData();
        } else {
          uni.showToast({
            title: res.message || "操作失败",
            icon: "none"
          });
        }
      } catch (error) {
        console.error("上架商品失败:", error);
        uni.showToast({
          title: "操作失败，请稍后重试",
          icon: "none"
        });
      }
    },

    // 删除商品方法
    async deleteProduct(productId) {
      try {
        uni.showModal({
          title: '确认删除',
          content: '确定要删除这个商品吗？此操作不可恢复。',
          success: async (res) => {
            if (res.confirm) {
              const token = uni.getStorageSync("token");
              const { data: res } = await uni.request({
                url: `http://localhost:3000/api/products/${productId}`,
                method: "DELETE",
                header: {
                  Authorization: "Bearer " + token,
                }
              });

              if (res.code === 200) {
                uni.showToast({
                  title: "删除成功",
                  icon: "success"
                });
                // 刷新数据
                this.loadSalesData();
              } else {
                uni.showToast({
                  title: res.message || "删除失败",
                  icon: "none"
                });
              }
            }
          }
        });
      } catch (error) {
        console.error("删除商品失败:", error);
        uni.showToast({
          title: "删除失败，请稍后重试",
          icon: "none"
        });
      }
    },

    // 确认价格修改
    async confirmPriceChange() {
      if (!this.currentProduct || !this.dep_price) {
        uni.showToast({
          title: "请选择一个价格",
          icon: "none",
        });
        return;
      }

      try {
        const token = uni.getStorageSync("token");
        const { data: res } = await uni.request({
          url: `${this.baseUrl}api/products/updatePrice`, // 路径是正确的，保持products而不是product
          method: "POST",
          header: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          data: {
            productId: this.currentProduct.product_id,
            newPrice: this.dep_price,
          },
        });

        if (res.code === 200) {
          uni.showToast({
            title: "价格修改成功",
            icon: "success",
          });

          // 关闭弹窗
          this.close_Model();

          // 重新加载数据
          this.loadSalesData();
        } else {
          uni.showToast({
            title: res.message || "价格修改失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("价格修改失败:", error);
        uni.showToast({
          title: "价格修改失败，请稍后重试",
          icon: "none",
        });
      }
    },
    // 新增标记为已卖出方法
    async markAsSold(item) {
      try {
        uni.showModal({
          title: '确认操作',
          content: '确定要将此商品标记为已卖出吗？这将同时下架商品',
          success: async (res) => {
            if (res.confirm) {
              const token = uni.getStorageSync("token");
              const { data: res } = await uni.request({
                url: "http://localhost:3000/api/orders/mark-as-sold",
                method: "POST",
                header: {
                  Authorization: "Bearer " + token,
                },
                data: {
                  productId: item.product_id
                }
              });

              if (res.code === 200) {
                uni.showToast({
                  title: "已标记为售出",
                  icon: "success"
                });
                // 刷新数据
                this.loadSalesData();
              } else {
                uni.showToast({
                  title: res.message || "操作失败",
                  icon: "none"
                });
              }
            }
          }
        });
      } catch (error) {
        console.error("标记为已卖出失败:", error);
        uni.showToast({
          title: "操作失败，请稍后重试",
          icon: "none"
        });
      }
    },
    // 获取图片URL的辅助方法
    getImageUrl(url) {
      if (!url) return "";

      // 如果已经是完整URL，直接返回
      if (url.startsWith("http")) {
        return url;
      }

      // 否则拼接完整URL
      return `${this.baseUrl}${url.replace(/\\/g, "/")}`;
    },
  },

  onLoad(optins) {
    this.loadSalesData();
    var that = this;
    //降价选择第一个
    that.re_price[0].checked = true;
  },
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
}

.contianer-title {
  display: flex;
}

.contianer-title_2 {
  margin-right: 20rpx;
}

.contianer-title_2 text {
  font-size: 25rpx;
  color: gray;
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

.container-compile {
  display: flex;
  margin-top: 20rpx;
  justify-content: flex-end;
}

/* .container-line{
  margin-top: 20rpx;
  width: 93%;
  height: 3rpx;
  background-color: gainsboro;
  margin-left: 20rpx
} */
/* end */

/* <!-- 自定义弹窗 --> */
.showModel {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 10;
  /* display: none; */
}

.model {
  padding: 30rpx;
  position: fixed;
  top: 500rpx;
  margin-left: 7%;
  border-radius: 20rpx;
  height: 650rpx;
  width: 650rpx;
  background: white;
}

.model-close {
  margin-top: 20rpx;
  display: flex;
  justify-content: flex-end;
  margin-right: 30rpx;
}

.model-title_desc {
  display: flex;
  align-items: center;
}

.model-title_desc-1 image {
  height: 130rpx;
  width: 130rpx;
}

.model-title_desc-2 {
  margin-left: 30rpx;
}

.model-title_desc-2_1 {
  margin-bottom: 40rpx;
  color: black;
  display: flex;
  align-items: center;
}

.model-title_desc-2_2 {
  color: black;
}

.model-title_desc-2_1_text {
  width: 100rpx;
}

.model-title_desc-2_2 {
  display: flex;
  align-items: center;
}

.model-title_desc-2_2_text {
  color: black;
  padding: 20rpx;
  background: gainsboro;
  border-radius: 10rpx;
}

.model-title_desc-2_2_1_text {
  width: 100rpx;
}

.modle-select {
  margin-top: 20rpx;
  height: 130rpx;
  width: 43%;
  background: gainsboro;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10rpx;
  margin: 20rpx;
}

.modle-select-1 text {
  font-size: 32rpx;
  font-weight: 600;
}

.modle-select-2 text {
  font-size: 20rpx;
}

.modle-select-1 {
  margin-bottom: 20rpx;
}

.slect_model {
  display: flex;
  flex-wrap: wrap;
}

.button-confirm {
  width: 98%;
}

/* end */

/* 选择样式 */
.select_state {
  background: #fef2ce;
}

/* 添加空状态样式 */
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
}

.off-shelf-item {
  background-color: #f0f0f0;
  /* 柔和的灰色背景 */
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
</style>