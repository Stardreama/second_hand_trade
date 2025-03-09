<template>
	<view>
		<!-- 内容 -->
		<view class='pa'>
		
		<view class='container bg-white shadow-warp'  v-for="(item,index) in 6" :key="index">
		
		<view class='container-top'>
		<view class='container-top-1'><image src='../../../static/img/shoop_heart.jpeg'></image></view>
		<view class='container-top-2'>
		<view class='container-top-2_1 text-cut'><text>99新毕节本99新毕节本99新毕节本99新毕节本99新毕节本99新毕节本99新毕节本99新毕节本99新毕节本99新毕节本99新毕节本99新毕节本</text></view>
		<view class='container-top-2_2'><text class='text-price text-sm text-red'>168</text></view>
		<view><text class='cuIcon-time lg text-gray'></text><text class='text-xxm'>等待卖家发货</text></view>
		</view>
		</view>
		
		<view class='container-line'></view>
		
		<view class='container-under'>
		<view class='container-under-1'><text class='cuIcon-message font-size-lg text-black '></text><text class='text-sm text-black'>联系买家</text></view>
		<view class='container-under-2' ><view class="cu-tag line-black padding" bindtap="send_out">去发货</view></view>
		<view><view class="cu-tag line-black padding">…</view></view>
		</view>
		
		</view>
		
		</view>
		
		<!-- end -->

	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			}
		},
		methods: {
			
		}
	}
</script>

<style scoped>
/* pages/my/my_sale/my_sale.wxss */

.pa{
  padding: 20rpx;
}

/* 内容 */
.container{
  padding: 20rpx;
  height: 300rpx;
  width: 100%;
  margin-bottom: 20rpx;
}
.container-top-2 {
  margin-left: 20rpx;
  width: 120%;

}
.container-top-1 image{
  width: 150rpx;
  height: 150rpx;
}
.container-top{
  display: flex;
  align-items: center;

}
.container-top-2_1{
  margin-bottom: 20rpx;
  width: 50%;
}
.container-top-2_1 text{
  font-weight: 600;
}
.container-top-2_2{
  margin-bottom: 20rpx;
}
.container-top-2_2 text{
  font-size: 25rpx;
  font-weight: 750;
}
.text-xxm{
  font-size: 22rpx;
  color: gray;
  padding-left: 10rpx;
}
.container-line{
  width: 95%;
  height: 3rpx;
  background: gainsboro;
  margin-top: 25rpx;
}
.container-under{
  display: flex;
  margin-top: 25rpx;
  align-items: center;
}
.font-size-lg{
  font-size: 35rpx;
  padding-right: 10rpx;

}
.container-under-1{
width: 65%;
}
.container-under-2{
  margin-right: 20rpx;
}
/* end */
</style>
