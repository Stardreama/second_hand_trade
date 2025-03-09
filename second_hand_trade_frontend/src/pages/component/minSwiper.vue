<template name="minSeiper">
	<view >
		<!-- 轮播图 -->
		    <view class=" shadow-blur bg-red  bg-img place"></view>
		    <view class=" swiper">
		      <view class=" swiper-box">
		        <swiper circular="true" autoplay="true" @change="swiperChange" >
		          <swiper-item :key="item.id"  v-for="(item,index) in swiperList" >
		            <image :src="item.img" @click="toSwiper"   ></image>
		          </swiper-item>
		        </swiper>
		     <!-- [currentSwiper >= index ? 'on' : ''] -->
		        <view class=" indicator">
		          <view class=" dots" :class=" currentSwiper >= index ? 'on' : '' " :key="index"  v-for="(item,index) in swiperList" ></view>
		        </view>
		      </view>
		    </view>
		    <!-- end -->
	</view>
</template>

<script>
	// name = "minSeiper";
	export default{
		data(){
			return{
				    // 轮播图片
				      currentSwiper: 0,
				      swiperList: [
				        { id: 1, src: 'url1', img: '../../static/img/1.jpg' },
				        { id: 2, src: 'url2', img: '../../static/img/2.jpg' },
				        { id: 3, src: 'url3', img: '../../static/img/3.jpg' }],
				        //end
			}
		},
		props:{
			
		},
		created(){
			
		},
		methods:{
			  //轮播图指示器
			  swiperChange: function (event) {
			    // console.log(event.detail.current)
			      this.currentSwiper = event.detail.current
			  },
			    //轮播图跳转
			    toSwiper: function (e) {
			  
			      uni.showToast({ title: e.src, icon: 'none' });
			    }
		},
	
		
	}
</script>

<style>



	
	.margin-top-60{
	margin-top: 80rpx;
	width: 100%;
	}
	
	.DrawerPage {
	  position: fixed;
	  width: 100vw;
	  height: 100vh;
	  left: 0vw;
	  background-color: #f1f1f1;
	  transition: all 0.4s;
	}
	
	.DrawerPage.show {
	  transform: scale(0.9, 0.9);
	  left: 85vw;
	  box-shadow: 0 0 60rpx rgba(0, 0, 0, 0.2);
	  transform-origin: 0;
	}
	
	.DrawerWindow {
	  position: absolute;
	  width: 85vw;
	  height: 100vh;
	  left: 0;
	  top: 0;
	  transform: scale(0.9, 0.9) translateX(-100%);
	  opacity: 0;
	  pointer-events: none;
	  transition: all 0.4s;
	}
	
	.DrawerWindow.show {
	  transform: scale(1, 1) translateX(0%);
	  opacity: 1;
	  pointer-events: all;
	}
	
	.DrawerClose {
	  position: absolute;
	  width: 40vw;
	  height: 100vh;
	  right: 0;
	  top: 0;
	  color: transparent;
	  padding-bottom: 30rpx;
	  display: flex;
	  align-items: flex-end;
	  justify-content: center;
	  background-image: linear-gradient(90deg, rgba(0, 0, 0, 0.01), rgba(0, 0, 0, 0.6));
	  letter-spacing: 5px;
	  font-size: 50rpx;
	  opacity: 0;
	  pointer-events: none;
	  transition: all 0.4s;
	}
	
	.DrawerClose.show {
	  opacity: 1;
	  pointer-events: all;
	  width: 15vw;
	  color: #fff;
	}
	
	.DrawerPage .cu-bar.tabbar .action button.icon {
	  width: 64rpx;
	  height: 64rpx;
	  line-height: 64rpx;
	  margin: 0;
	  display: inline-block;
	}
	
	.DrawerPage .cu-bar.tabbar .action .cu-avatar {
	  margin: 0;
	}
	
	.DrawerPage .nav {
	  flex: 1;
	}
	
	.DrawerPage .nav .cu-item.cur {
	  border-bottom: 0;
	  position: relative;
	}
	
	.DrawerPage .nav .cu-item.cur::after {
	  content: "";
	  width: 10rpx;
	  height: 10rpx;
	  background-color: currentColor;
	  position: absolute;
	  bottom: 10rpx;
	  border-radius: 10rpx;
	  left: 0;
	  right: 0;
	  margin: auto;
	}
	
	.DrawerPage .cu-bar.tabbar .action {
	  flex: initial;
	}
	
	
	/* -------------------------------------------------- */
	
	
	/* pages/classify/discover/discover.wxss */
	pg {
	  padding: 20rpx;
	
	}
	/* 导航栏 */
	.nav-item{
	  position: fixed;
	  width: 100%;
	  /* height: 200rpx; */
	  top: 1;
	  z-index: 2;
	}
	/* end */
	
	/* 内容 */
	.contianer{
	  height: auto;
	  width: 100%;
	  padding: 20rpx;
	  border-radius: 20rpx;
	  margin-bottom: 20rpx;
	  margin-top: 20rpx;
	}
	.contianer-title{
	  display: flex;
	  align-items: center;
	}
	.contianer-title_image image{
	  height: 50rpx;
	  width: 50rpx;
	  border-radius: 100%;
	}
	.contianer-name{
	  margin-left: 20rpx;
	  font-size: 25rpx;
	  color: black;
	}
	.contianer-content{
	  margin-top: 10rpx;
	  width: 100%;
	  display: -webkit-box;
	  overflow: hidden;
	  -webkit-line-clamp: 6;
	  -webkit-box-orient: vertical;
	}
	.contianer-content text{
	  font-size: 30rpx;
	  color: black;
	}
	.container-grid{
	  display: flex;
	  flex-wrap: wrap;
	  margin-top: 20rpx;
	  width: 100%;
	}
	.container-grid__image{
	  height: 210rpx;
	  width: 215rpx;
	  border-radius: 10rpx;
	}
	.container-grid_img{
	  width: 223rpx;
	  border-radius: 10rpx; 
	}
	.container-grid_image{
	  margin-right: 10rpx;
	  width: 32%;
	}
	.container-grid_image-1{
	   margin-right: 10rpx;
	  width: 100%;
	}
	.container-evaluate{
	  margin-top: 20rpx;
	  width: 100%;
	  height: auto;
	  border-radius: 20rpx;
	  padding: 20rpx;
	}
	.container-evaluate-top_1 image{
	  width: 75rpx;
	  height: 40rpx;
	}
	.container-evaluate-top{
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	}
	.container-evaluate-desc{
	  width: 100%;
	  display: -webkit-box;
	  overflow: hidden;
	  -webkit-line-clamp: 2;
	  -webkit-box-orient: vertical;
	
	}
	.container-comment{
	  margin-top: 20rpx;
	}
	.container-comment{
	  padding: 20rpx;
	  display: flex;
	  justify-content: space-between;
	}
	/* end */
	
	
	
	
	/* 线 */
	.line{
	  display: flex;
	  height: 90rpx;
	}
	/* end */
	
	
	/* 轮播图 */
	.place {
	  width: 100%;
	  height: auto;
	  padding-top: 0rpx;
	    margin-bottom: 20rpx;
	}
	.swiper {
	  width: 100%;
	  margin-top: 10rpx;
	  display: -webkit-box;
	  display: -webkit-flex;
	  display: -ms-flexbox;
	  display: flex;
	  -webkit-box-pack: center;
	  -webkit-justify-content: center;
	      -ms-flex-pack: center;
	          justify-content: center;
	}
	.swiper .swiper-box {
	    width: 95%;
	    height: 30.7vw;
	    overflow: hidden;
	    -webkit-border-radius: 15rpx;
	            border-radius: 15rpx;
	    -webkit-box-shadow: 0rpx 8rpx 25rpx rgba(0, 0, 0, 0.2);
	            box-shadow: 0rpx 8rpx 25rpx rgba(0, 0, 0, 0.2);
	    position: relative;
	    z-index: 1;
	}
	.swiper .swiper-box swiper {
	      width: 100%;
	      height: 30.7vw;
	}
	.swiper .swiper-box swiper swiper-item image {
	        width: 100%;
	        height: 30.7vw;
	}
	.swiper .swiper-box .indicator {
	
	      position: absolute;
	      bottom: 20rpx;
	      left: 20rpx;
	      background-color: rgba(255, 255, 255, 0.4);
	      width: 150rpx;
	      height: 5rpx;
	      -webkit-border-radius: 3rpx;
	              border-radius: 3rpx;
	      overflow: hidden;
	      display: -webkit-box;
	      display: -webkit-flex;
	      display: -ms-flexbox;
	      display: flex;
	}
	.swiper .swiper-box .indicator .dots {
	        width: 100%;
	}
	.swiper .swiper-box .indicator .dots.on {
	          background-color: white;
	}
	/* 轮播图 */
	
	/* 线条 */
	.line{
	  display:flex;
	  height: 40rpx;
	  width: 100%;
	  /* border: 1rpx solid black; */
	}
	
	/* 线条end */
	
	/* 发帖 */
	.postMsg image{
	height: 100rpx;
	width: 100rpx;
	border-radius: 100%;
	position: fixed;
	bottom: 150rpx;
	right: 60rpx;
	z-index: 999;
	}
	/* end */
	
	/* 发布贴{添加居中线} */
	.drawerLine{
	 display: flex;
	 height: 310rpx; 
	}
	.cu-form-group textarea {
		margin: 32rpx 0 30rpx;
		height: 10.6em;
		width: 100%;
		line-height: 1.2em;
		flex: 1;
		font-size: 28rpx;
		padding: 0;
	}
	.confirm-bottom{
	  width: 100%;
	  height: 90rpx;
	}
	.NumChange{
	  padding-top: 50rpx;
	}
	.text-more text{
	  /* direction: rtl; */
	  text-align: right;
	  width: 95%;
	  font-size: 25rpx;
	}
	/* end */
	
	
	
	
	
	
	

</style>
