<template>
  <view>
    <!-- 商家信息 -->

    <view class="bg-white">
      <view class="cf padding-sm">
        <view class="radius fl padding-sm">
          <image
            src="http://k.zol-img.com.cn/sjbbs/7692/a7691515_s.jpg"
          ></image>
          <view class="fr padding-name">
            <view>Amibition</view>
            <view>
              <text>发布于毕节</text>
            </view>
          </view>
        </view>
        <view class="fr padding-time">
          <text>35分钟前来过</text>
        </view>
      </view>
    </view>

    <!-- 商家信息end -->

    <!-- 商品内容 -->
    <view class="contanier bg-white padding-sm top-20">
      <view class="price">
        <text class="price-symbol">￥</text>
        <text class="price-size">2500</text>
        <text class="price-ori">￥1221</text>
        <view class="cu-tag">不讲价</view>
      </view>

      <view class="bg-white top-20 font-size">
        <text>
          123百度图片-发现多彩世界百度图片 - 百度快照 -
          745条评价先锋图片百度图片使用世界前沿的人工智能技术，为用户甄选海量的高清美图，用更流畅、更快捷、更精准的搜索体验，带你去发现多彩的世界。
        </text>
      </view>

      <!-- 交易方式 -->
      <view class="hint">
        <text>本交易仅支持自提、当面交易、邮寄</text>
      </view>
      <!-- end -->

      <!-- 图片位置 -->
      <block v-for="(item, index) in 6" :key="index">
        <image class="img" src="../../../static/img/qiu.jpeg"></image>
      </block>
      <!--图片位置end  -->

      <view class="browse">
        <view>
          <text></text>
          <!-- <text>担保交易</text> -->
        </view>
        <view class="text-gray text-sm text-right padding-browse">
          <text class="cuIcon-attentionfill margin-lr-xs"></text> 10
          <text class="cuIcon-appreciatefill margin-lr-xs"></text> 20
          <text class="cuIcon-messagefill margin-lr-xs"></text> 30
        </view>
      </view>
    </view>
    <!-- 商品内容end -->

    <!-- 商家信息 -->
    <view class="bg-white top-20 padding-sm">
      <view class="in_regard_to">
        <!-- <view>
		      <image src='../img/tiao.png'></image>
		    </view> -->
        <view>
          <text class="in_regard_to_text">关于卖家</text>
        </view>
      </view>

      <view @tap="toUserDetail">
        <view class="cu-list menu-avatar">
          <view class="cu-item arrow">
            <view
              class="cu-avatar round lg"
              style="
                background-image: url(https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg);
              "
            ></view>
            <view class="content">
              <view class="text-grey">Amibition</view>
              <view class="text-gray text-sm flex">
                <text class="text-cut">
                  <text class="cuIcon-infofill text-red margin-right-xs"></text>
                  我已天理为凭，踏入这片荒芜，不再受凡人的枷锁遏制。我已天理为凭，踏入这片荒芜，不再受凡人的枷锁遏制。
                </text>
              </view>
            </view>
            <view class="action arrow">
              <view class="cuIcon-right"></view>
            </view>
          </view>
        </view>
      </view>

      <view class="bg-gray top-30 information">
        <view class="Business_information">
          <view>5</view>
          <view>
            <text>在售宝贝</text>
          </view>
        </view>

        <view class="Business_information">
          <view>5</view>
          <view>
            <text>累计交易</text>
          </view>
        </view>

        <view class="Business_information">
          <view>5</view>
          <view>
            <text>在线宝贝</text>
          </view>
        </view>
      </view>

      <scroll-view
        scroll-x="true"
        style="white-space: nowrap; display: flex"
        class="top-20"
      >
        <block v-for="(item, index) in 10" :key="index">
          <view class="item-inline">
            <navigator url="" hover-class="none">
              <view
                class="item-inline bg-img padding-top-xl flex align-end"
                :style="'background-image: url(' + url + ');'"
              >
                <view class="bg-shadeBottom padding-top-xl flex-sub">
                  ￥200
                </view>
              </view>
            </navigator>
          </view>
        </block>
      </scroll-view>
    </view>

    <!-- end -->

    <!-- 消息 -->
    <!-- <view class='bg-white top-20 padding-sm '>
		  <view class='in_regard_to'>
		    <view>
		      <image src='../img/tiao.png'></image>
		    </view>
		    <view>
		      <text class='in_regard_to_text'>消息（10）</text>
		    </view>
		  </view>
		
		  <view class='msg padding-sm' v-for="(item,index) in 3" wx:key="id">
		
		    <view class="cu-avatar round lg" style="background-image:url(https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg);"></view>
		
		    <view class='msg-conetent'>
		      <view>Amibition
		        <text class="cuIcon-timefill text-green msg-timer  margin-right-xs"></text>
		        <text class='msg-timers'>2018-6-11</text>
		      </view>
		      <view>发射点撒旦点发射点撒旦发生发射点射点</view>
		
		    </view>
		
		  </view>
		</view> -->

    <!-- end -->

    <!-- 相识商品 -->
    <view class="bg-white top-20">
      <!-- <view class='in_regard_to'>
		    <view>
		      <image src='../img/tiao.png'></image>
		    </view>
		    <view>
		      <text class='in_regard_to_text'>相似商品</text>
		    </view>
		  </view> -->

      <!-- 内容 -->
      <!-- <view class='container-flex '>
		  <view class='card-menu container margin-top' v-for="(item,index) in 10" :key="index">
		    <navigator url='/pages/home/home_detail/home_detail' hover-class='none'>
		  <view class='container_img'><image src='http://pic25.nipic.com/20121205/10197997_003647426000_2.jpg'></image></view>
		  <view class='container_text'><text class=''>Huawei/华为Mate 20 Pro运气真好双卡双待全网通</text></view>
		  <view class='container_price'>
		  <text class='container_price_text_0'>￥980</text>
		  
		   <view class="cu-tag line-orange">全新</view>
		  </view>
		  <view class='container_line'></view>
		  <view class='container_user'>
		  <image src='http://pic25.nipic.com/20121205/10197997_003647426000_2.jpg'></image>
		  <text>Amibition</text>
		  </view>
		  </navigator>
		  </view>
		</view> -->
      <!-- 内容end -->
    </view>

    <!-- end -->

    <!-- 操作选项卡 -->
    <view class="cu-bar bg-white tabbar border shop fixation">
      <button class="action" @tap="toChat">
        <view class="cuIcon-service text-green">
          <view class="cu-tag badge"></view>
        </view>
        聊一聊
      </button>
      <!-- <view class="action">
		      <view class=" cuIcon-shop">
		       <view class="cu-tag badge">99</view>
		      </view>
		       店铺
		    </view> -->
      <view class="action">
        <view class="cuIcon-appreciatefill text-orange">
          <!-- <view class="cu-tag badge">99</view> -->
        </view>
        点赞
      </view>

      <view class="bg-red submit margin-rigth-20" @tap="buy">立即购买</view>
    </view>
    <!-- end -->
  </view>
</template>

<script>
export default {
  data() {
    return {
      url: "https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg",
    };
  },
  methods: {
    // 点击跳转订单详细页面
    buy: function (e) {
      console.log(e);
      uni.navigateTo({
        url: "/pages/home/confirm_order/confirm_order",
      });
    },
    // 跳转到聊天页面
    toChat() {
      uni.navigateTo({
        url: "/pages/msg/msg_chat/msg_chat",
      });
    },

    // 跳转到用户详情页面
    toUserDetail() {
      uni.navigateTo({
        url: "/pages/my/my_detail/my_detail",
      });
    },
  },
};
</script>

<style>
/* 商家信息 */

.padding-name {
  padding-top: 25rpx;
  padding-left: 20rpx;
}
.padding-name text {
  color: gray;
  font-size: 20rpx;
}
.fl image {
  width: 100rpx;
  height: 100rpx;
  border-radius: 100%;
}
.padding-time {
  padding-top: 45rpx;
}
text-title-size {
  font-size: 50rpx;
  color: gray;
}
/* 商家信息end */

/* 商品内容 */
.top-20 {
  margin-top: 20rpx;
}

.price-size {
  font-size: 50rpx;
  color: red;
}
.price-symbol {
  font-size: 20rpx;
  color: red;
}
.price-ori {
  margin-left: 25rpx;
  text-decoration: line-through;
}
.font-size text {
  font-size: 35rpx;
  color: black;
}
.hint {
  margin-top: 20rpx;
  color: black;
  font-size: 35rpx;
}
.img {
  margin-top: 10rpx;
  width: 100%;
  height: 800rpx;
}
.cu-tag {
  margin-left: 20rpx;
  /* padding: 0rpx; */
  font-size: 22rpx;
}
.browse {
  display: flex;
  justify-content: space-between;
}
.browse-tiem {
  font-size: 23rpx;
  color: gray;
}
.padding-browse {
  padding: 10rpx;
}
/* 商品内容end */

/* 商家信息 */
.in_regard_to {
  display: flex;
  align-items: center;
}
.in_regard_to image {
  width: 50rpx;
  height: 65rpx;
}
.in_regard_to_text {
  font-size: 35rpx;
  color: black;
  font-family: inherit;
}
.top-30 {
  margin-top: 30rpx;
}
.Business_information {
  /* width: 30%; */
  padding: 5rpx;
  display: flex;
  flex-direction: column;
  align-content: center;
  align-items: center;
}
.information {
  /* border-top-left-radius: 5%;
  border-top-right-radius: 5%; */
  border-radius: 20rpx;
  padding: 10rpx;
  display: flex;
  justify-content: space-around;
}
.item-inline {
  display: inline-block;
  margin-right: 10rpx;
  height: 150rpx;
  width: 230rpx;
}

/* end */

/* 消息 */
.msg {
  display: flex;
}
.msg-conetent {
  margin-left: 30rpx;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  margin-top: 10rpx;
  width: 80%;
}
.msg-timer {
  padding-left: 20rpx;
}
.msg-timers {
  color: gray;
  font-size: 22rpx;
}
/* end */

/* 相似商品 */
.container {
  margin-left: 29rpx;
  margin-right: 20rpx;
  /* float: left; */
  height: 530rpx;
  width: 43%;
  background: white;
  margin-bottom: 20rpx;
}
.container_img image {
  height: 300rpx;
  width: 100%;
}
.container_text {
  color: black;
  padding: 10rpx;
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
.container-flex {
  display: flex;
  flex-wrap: wrap;
}
/* end */

/* 底部操作选项卡 */
.fixation {
  position: fixed;
  bottom: 0rpx;
  width: 100%;
}
.margin-rigth-20 {
  margin-right: 20rpx;
}
/* end */
</style>
