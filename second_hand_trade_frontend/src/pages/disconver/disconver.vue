<template>
	<!-- <bar></bar> -->
<view class="">
	
	<!-- 导航条 -->
	<TopBar @click="tabSelect" :TabCur="TabCur" :dataList ="tablist"></TopBar>
	<!-- 导航条 -->

	<!-- 轮播图 -->
	<!-- <min-swiper></min-swiper> -->
	<!-- end -->

   <!-- 内容 -->
   <view class="margin-right-sm margin-left-sm">
	   
	<view class='contianer shadow-warp bg-white' v-for="(item,index) in 10" :key="index">
	<view class='contianer-title'>
	<view class='contianer-title_image'> <image src='https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg'></image></view>
	<view class='contianer-name'>Amibition</view>
	</view>

	<view class='contianer-content'>
	<text>士大夫撒旦发射点发萨法沙发及时发送附件撒地方撒旦飞洒发生发生发生发生士大夫撒旦发射点发萨法沙发及时发送附件撒地方撒旦飞洒发生发生发生发生士大夫撒旦发射点发萨法沙发及时发送附件撒地方撒旦飞洒发生发生发生发生士大夫撒旦发射点发萨法沙发及时发送附件撒地方撒旦飞洒发生发生发生发生士大夫撒旦发射点发萨法沙发及时发送附件撒地方撒旦飞洒发生发生发生发生士大夫撒旦发射点发萨法沙发及时发送附件撒地方撒旦飞洒发生发生发生发生士大夫撒旦发射点发萨法沙发及时发送附件撒地方撒旦飞洒发生发生发生发生士大夫撒旦发射点发萨法沙发及时发送附件撒地方撒旦飞洒发生发生发生发生士大夫撒旦发射点发萨法沙发及时发送附件撒地方撒旦飞洒发生发生发生发生士大夫撒旦发射点发萨法沙发及时发送附件撒地方撒旦飞洒发生发生发生发生</text>
	</view>

	<view class='container-grid'>
	<view @tap='previewImg' :data-index='index' :class=" index == 2 || index == 5 || index == 8  ? '' : imgArr.length == 4 ?'' : imgArr.length == 1 ? 'container-grid_image-1':'container-grid_image' "  :style="imgArr.length == 4 ? 'width:32%;margin-right: 15rpx;' : '' " v-for="(item,index) in imgArr" :key="item">
	<image :src='item' :style="imgArr.length == 1 ? 'width:100%;' :'' " :class="imgArr.length == 1 ? 'container-grid_img' : 'container-grid__image' " ></image>
	<!-- width:100%; -->
	</view>
	</view>

	<view class='container-evaluate bg-gray'>
	<view class='container-evaluate-top'>
	<view class='container-evaluate-top_1'> <image src='../../static/img/hot_evaluate1.png'></image></view>
	<view>300 <text class='text-sm'>赞</text></view>
	</view>
	<view class='container-evaluate-desc'><text class='text-sm text-weight '>啊手动阀:按实际发生,分解凯撒就打发士大夫萨芬就是垃圾地方就是咖啡碱撒扩大啊手动阀按实际发生分解凯撒就打发士大夫萨芬就是垃圾地方就是咖啡碱撒扩大</text></view>
	</view>

	<view class='container-comment '>
	<view><text class='cuIcon-share lg text-black'> 分享</text></view>
	<view @tap='toDiscover_desc'><text class='cuIcon-message lg text-black'> 168</text></view>
	<view><text class='cuIcon-appreciatefill lg text-red'></text><text> 768</text></view>
	</view>

	</view>

	</view>
<!-- end -->

</view>



</template>

<script>
	import bar from "../component/bar.vue";
	import TopBar from "../component/topTab.vue";
	import minSwiper from "../component/minSwiper.vue";
	export default {
		data() {
			return {
				//图片
				     imgArr: [
				    'http://bpic.588ku.com/element_origin_min_pic/16/10/30/528aa13209e86d5d9839890967a6b9c1.jpg',
				  ],
				  // end 
				  
				  // 导航条
				    TabCur: '0',
				    scrollLeft: 0,
				  // 导航条end
				  
				//   //导航条
				//   tablist:[
				//   {id:1,name:'导航条888'},
				//   {id:2,name:'导航条2'},
				//   {id:3,name:'导航条3'},
				//   {id:4,name:'导航条4'}, 
				//   {id:5,name:'导航条5'},
				//   {id:6,name:'导航条6'},
				//   	],
				//   //end
			}
		},
		components:{ 
			bar,
			TopBar,
			minSwiper
		},
		onLoad:function(){
		

		},
		onShow:function(){
			
			//导航条的高度
			// this.SelectorQuery()
			
		},
		//上拉刷新
		onPullDownRefresh:function() {
			//模拟加载完成
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 2000);
		},
		//上拉刷新
		onReachBottom:function(){
			console.log("出发上拉刷新事件");
			
		},
		methods: {
			// 点击图片打开详细
			  previewImg: function (e) {
			    // console.log(e.currentTarget.dataset.index);
			    var index = e.currentTarget.dataset.index;
			    var imgArr = this.imgArr;
			    uni.previewImage({
			      current: imgArr[index],     //当前图片地址
			      urls: imgArr,               //所有要预览的图片的地址集合 数组形式
			      success: function (res) { },
			      fail: function (res) { },
			      complete: function (res) { },
			    })
			  },
			  toDiscover_desc:function(e){
				  uni.navigateTo({
				  	url:"/pages/disconver/discover_desc/discover_desc"
				  })
			  },
			  // 导航条点击
			    tabSelect(e) {
			  	  // console.log(e) ;
			  	 
			        this.TabCur = e.currentTarget.dataset.id
			      
			    },
			}
			
	}
</script>

<style>
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
	
	
	/* 页脚 */
	.foot{
	  display: flex;
	  padding: 10rpx;
	  align-items: center;
	  justify-content:space-between;
	}
	.foot-1{
	  width: 35%;
	  height: 1rpx;
	  background: gainsboro;
	}
	/* end */

</style>
