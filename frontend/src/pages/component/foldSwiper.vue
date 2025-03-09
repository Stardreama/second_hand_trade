<template>
	<view class="">
		<!-- 轮播 -->
		<swiper class="card-swiper square-dot" :indicator-dots="true" circular="true" :autoplay="true" interval="5000" duration="500" @change="cardSwiper" indicator-color="#8799a3" indicator-active-color="#0081ff">
		  <swiper-item @click="toDescPage" v-for="(item,index) in swiperList" :key="index" :class="cardCur==index?'cur':'' ">
			  <!-- :class="cardCur==index?'cur':'' " -->
		    <view class="swiper-item">
		      <image :src="item.url" mode="aspectFill" v-if="item.type=='image'"></image>
		      <video :src="item.url" autoplay loop muted show-play-btn="false" controls="false" objectFit="cover" v-if="item.type=='video'"></video>
		    </view>
		  </swiper-item>
		</swiper>
		<!-- end -->
	</view>
</template>

<script>
	export default{
		data(){
			return{
				cardCur: 0,
			 // 轮播
			    swiperList:this.swiperlist
			    // end	
			}
		},
		created() {
			
		},
		props:{
			swiperlist:{
			},
		},
		methods:{
			//cardSwiper
			cardSwiper(e) {
				this.cardCur = e.detail.current;
			},
			//跳转详细页面
			toDescPage(e){
				this.$emit('click',e);
			}
		}
	}
</script>

<style>
	
	/* 轮播图 */
	.magrith-0{
	  margin-top: 0rpx;
	  padding-top: 0rpx;
	}
	.card-swiper swiper-item{
	  padding: 25rpx 0rpx 50rpx;
	}
	/* end */
	
	
</style>
