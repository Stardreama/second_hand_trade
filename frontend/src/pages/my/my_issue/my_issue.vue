<template>
  <view>
    <!-- 内容 -->
    <view class="pa">
      <!-- 有商品时显示商品列表 -->
      <view v-if="productList && productList.length > 0">
        <view
          class="contianer shadow-warp bg-white padding-sm"
          v-for="(item, index) in productList"
          :key="item.product_id"
        >
          <view class="contianer-title">
            <view class="contianer-title_1 text-cut"
              ><text class="text-cut">{{ item.product_title }}</text></view
            >
          </view>

          <view class="item-inline-1_1"
            ><text decode="true"
              >&ensp;&ensp;&ensp;&ensp;&ensp;&ensp;</text
            ></view
          >
          <scroll-view
            scroll-x="true"
            style="white-space: nowrap; display: flex"
            class="top-20"
          >
            <block
              v-for="(img, imgIndex) in item.images.slice(0, 3)"
              :key="imgIndex"
            >
              <view class="item-inlines">
                <navigator url="" hover-class="none">
                  <view
                    class="item-inline bg-img padding-top-xl flex align-end"
                    :style="'background-image: url(' + img + ');'"
                  >
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
              <view class="cu-tag bg-brown sm">
                <text class="cuIcon-footprint"></text>
              </view>
              <view class="cu-tag line-brown sm"> 168 </view>
            </view>

            <view class="cu-capsule radius margin-left">
              <view class="cu-tag bg-brown sm">
                <text class="cuIcon-message"></text>
              </view>
              <view class="cu-tag line-brown sm"> 23 </view>
            </view>
          </view>

          <view class="container-compile">
            <view class="cu-tag line-yellow" @tap="show_model(item)">降价</view>
            <view class="cu-tag line-yellow" @tap="toIssue(item)">编辑</view>
            <view class="cu-tag line-yellow" @tap="actionSheetTap">更多</view>
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
    <view
      class="showModel bg-white"
      @touchmove.stop="pageModel"
      v-if="show_model_state"
    >
      <view class="model" @touchmove.stop="model_page">
        <view class="model-close" @tap="close_Model">
          <text class="cuIcon-roundclose text-df text-gray"></text>
        </view>

        <view class="model-title_desc">
          <view class="model-title_desc-1">
            <image
            :src="currentProduct && currentProduct.images && currentProduct.images.length > 0 
          ? currentProduct.images[0] 
          : 'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg'"
            ></image>
          </view>
          <view class="model-title_desc-2">
            <view class="model-title_desc-2_1">
                <text class="model-title_desc-2_1_text">现价</text>
                <text class="text-price text-red" style="font-weight: 600">
                      {{ currentProduct ? currentProduct.price : 0 }}
                </text>
            </view>
            <view class="model-title_desc-2_2"
              ><text class="model-title_desc-2_2_1_text">降价至</text
              ><text class="text-price model-title_desc-2_2_text">{{
                dep_price
              }}</text></view
            >
          </view>
        </view>

        <view class="slect_model">
          <view
            class="modle-select"
            :class="item.checked ? 'select_state' : ''"
            v-for="(item, index) in re_price"
            :key="index"
            @tap="select_price"
            :data-price="item.price"
            :data-id="index"
          >
            <view class="modle-select-1">
              <view class="cu-tag bg-red">{{ item.price }}元</view>
            </view>
            <view class="modle-select-2">
              <text>{{ item.desc }}</text>
            </view>
          </view>

          <button class="cu-btn bg-green button-confirm" @tap="confirmPriceChange">确定</button>
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
      url: "https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg",
      //降价Model状态
      show_model_state: false,
      currentProduct: null, // 添加当前操作的商品
      // 降价选择数据
      re_price: [
        { id: 0, price: 0, desc: "打1折极速卖" ,discount: 0.1 },
        { id: 1, price: 0, desc: "打3折出手快" ,discount: 0.3 },
        { id: 2, price: 0, desc: "打5折有竞争力" ,discount: 0.5},
        { id: 3, price: 0, desc: "打8折" ,discount: 0.8},
      ],
      dep_price: "",
    };
  },
  methods: {
    async loadSalesData() {
      try {
        const token = uni.getStorageSync("token");
        const { data: res } = await uni.request({
          url: "http://localhost:3000/api/my/sale",
          method: "GET",
          header: { Authorization: "Bearer " + token },
        });
        if (res.code === 200) {
      this.productList = res.data.map((item) => {
        // 确保每个商品对象有图片数组
        const processedItem = {
          ...item,
          images: Array.isArray(item.image) 
            ? item.image.map(img => `${this.baseUrl}${img.replace(/\\/g, "/")}`) 
            : []
        };
        
        // 如果处理后的images为空，但商品有封面图，则使用封面图
        if (processedItem.images.length === 0 && item.image) {
          processedItem.images.push(`${this.baseUrl}${item.image.replace(/\\/g, "/")}`);
        }
        
        console.log("处理后的商品图片:", processedItem.images);
        return processedItem;
      });
    }
  } catch (error) {
    console.error("数据加载失败:", error);
    uni.showToast({ title: "数据加载失败", icon: "none" });
  }
},
 // 跳转到编辑页面
 toIssue: function (item) {
      console.log("编辑商品:", item.product_id);
      uni.navigateTo({
        url: `/pages/issue/issue_edit/issue_edit?product_id=${item.product_id}`,
      });
    },
    // 新增方法 - 跳转到发布页面
    toPublish() {
      uni.switchTab({
        url: "/pages/issue/issue",
      });
    },

    // 拦截弹窗 滚动
    pageModel: function (e) {},
    // 拦截弹窗 滚动
    model_page: function (e) {},

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
      console.log("当前商品图片:", item.images); // 添加调试信息
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
    actionSheetTap() {
      uni.showActionSheet({
        itemList: ["分享", "下架", "删除"],
        success(e) {
          console.log(e.tapIndex);
        },
      });
    },
    
    // 确认价格修改
    async confirmPriceChange() {
  if (!this.currentProduct || !this.dep_price) {
    uni.showToast({
      title: '请选择一个价格',
      icon: 'none'
    });
    return;
  }
  
  try {
    const token = uni.getStorageSync('token');
    const { data: res } = await uni.request({
      url: `${this.baseUrl}api/products/updatePrice`, // 路径是正确的，保持products而不是product
      method: 'POST',
      header: { 
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json' 
      },
      data: {
        productId: this.currentProduct.product_id,
        newPrice: this.dep_price
      }
    });
    
    if (res.code === 200) {
      uni.showToast({
        title: '价格修改成功',
        icon: 'success'
      });
      
      // 关闭弹窗
      this.close_Model();
      
      // 重新加载数据
      this.loadSalesData();
    } else {
      uni.showToast({
        title: res.message || '价格修改失败',
        icon: 'none'
      });
    }
  } catch (error) {
    console.error('价格修改失败:', error);
    uni.showToast({
      title: '价格修改失败，请稍后重试',
      icon: 'none'
    });
  }
}
  },
  
  onLoad(optins) {
    this.loadSalesData();
    var that = this;
    //降价选择第一个
    that.re_price[0].checked = true;
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
</style>
