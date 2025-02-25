<template>
	<view>
		<!-- 头部 -->
		<view class='pg'>
		
		  <view class='user-top  padding-sm bg-white '>
		
		    <view class='user-top-1'>
		      <image src='https://image.weilanwl.com/color2.0/plugin/sylb2244.jpg'></image>
		    </view>
		    <view class='user-top-2'>
		      <view class='user-top-2_1'>
		        <text class='text-df text-black text-weight'>Amibition</text>
		      </view>
		      <view>
		        <text class='text-xs text-grey'>1小时前来过</text>
		      </view>
		    </view>
		    <view class='user-top-3'>
		      <button bindtap='attention' class="cu-btn round line-black" role="button" aria-disabled="false">+关注</button>
		    </view>
		  </view>
		
		  <!-- 文字内容 -->
		  <view class='character  padding-sm bg-white'>
		    <text>123123123123123123123</text>
		  </view>
		  <!-- end -->
		
		  <!-- 九宫图 -->
		  <view class='container-grid padding-sm bg-white'>
		    <view @tap='previewImg' :data-index="index" :class=" index == 2 || index == 5 || index == 8  ? '' : imgArr.length == 4 ?'' : imgArr.length == 1 ? 'container-grid_image-1':'container-grid_image' " :style="imgArr.length == 4 ? 'width:32%;margin-right: 15rpx;' : '' "
		      v-for = "(item,index) in imgArr" :key="index">
		      <image :src='item' :style=" imgArr.length == 1 ? 'width:100%;' :'' " :class=" imgArr.length == 1 ? 'container-grid_img' : 'container-grid__image' "></image>
		      <!-- style=width:32% container-grid_image-->
		    </view>
		  </view>
		  <!-- end -->
		
		  <!-- 流量数量 -->
		  <view class='browse shadow-warp  padding-sm bg-white'>
		    <view class="cu-avatar-group">
		      <view class="cu-avatar img-size round lg" v-for="(item,index) in 3" :key="item" :style=" 'background-image:url(https://ossweb-img.qq.com/images/lol/web201310/skin/big1000' + [index+1] +'.jpg);' "></view>
		    </view>
		    <view class='browse-2'>
		      <text>2人赞过</text>
		    </view>
		
		    <view>
		      <text>15天前发布*浏览12</text>
		    </view>
		  </view>
		  
		  <!-- 评论标题 -->
		    <view class='comment  padding-sm bg-white'>
		      <text>热门评论 * 16</text>
		    </view>
		    <!-- end -->
		  
		  
		  <!-- 仅在小程序上面出现 -->
		  <!-- #ifdef MP  -->
		  <!-- 热门评论内容 -->
		    <view class='padding shadow-warp  bg-white comment-content' v-for="(item,index) in discuss" :key="index">
		      <view class='comment-content-1'>
		        <view class='comment-content-1_image'>
		          <image :src='item.image'></image>
		        </view>
		        <view class='comment-content-1_2'>
		          <text class='text-black'>{{item.name}}</text>
		        </view>
		        <view>
		          <text class='cuIcon-appreciate lg text-gray'></text>{{item.cook}}</view>
		      </view>
		  
		      <view class='comment-content-2'>
		        <view class='comment-content-2_1'>
		          <image class='comment-content-2_1_img' :src='item.hotImg'></image>
		          <text class='text-black text-df text-weight'> {{item.center}}</text>
		        </view>
		        <view class='comment-content-2_2 margin-top-sm'>
		          <text class='text-sm'>{{item.time}}</text>
		        </view>
		  
		        <view class='leave '>
		          <view class='leave-item' v-for="(item,index) in 2" :key="index">
		            <text>黑色天空中的月亮：1231231231212312312312123123123121231231231212312312312</text>
		          </view>
		          <view class='margin-top-sm' @tap='toDiscover_desc'>
		            <text class='text-blue'>查看186条回复 ></text>
		          </view>
		        </view>
		  
		      </view>
		  
		  <!-- 热门评论end -->
		  </view>
		  
		   <!-- #endif -->
		   
		   
		   <!-- h5 原生Android上面显示 -->
		   <!-- #ifndef APP-PLUS  -->
		   <!-- 热门评论内容 -->
		     <view class='padding shadow-warp  bg-white comment-content' v-for="(item,index) in discuss" :key=" 'idA' + index">
		       <view class='comment-content-1'>
		         <view class='comment-content-1_image'>
		           <image :src='item.image'></image>
		         </view>
		         <view class='comment-content-1_2'>
		           <text class='text-black'>{{item.name}}</text>
		         </view>
		         <view>
		           <text class='cuIcon-appreciate lg text-gray'></text>{{item.cook}}</view>
		       </view>
		   
		       <view class='comment-content-2'>
		         <view class='comment-content-2_1'>
		           <image class='comment-content-2_1_img' :src='item.hotImg'></image>
		           <text class='text-black text-df text-weight'> {{item.center}}</text>
		         </view>
		         <view class='comment-content-2_2 margin-top-sm'>
		           <text class='text-sm'>{{item.time}}</text>
		         </view>
		   
		         <view class='leave '>
		           <view class='leave-item' v-for="(item,index) in 2" :key=" 'idB' + index">
		             <text>黑色天空中的月亮：1231231231212312312312123123123121231231231212312312312</text>
		           </view>
		           <view class='margin-top-sm' @tap='toDiscover_desc'>
		             <text class='text-blue'>查看186条回复 ></text>
		           </view>
		         </view>
		   
		       </view>
		   
		   <!-- 热门评论end -->
		   </view>
		   <!-- #endif -->
		   
		  
		  <!-- 评论标题 -->
		    <view class='comment  padding-sm bg-white'>
		      <text>全部评论 * 16</text>
		    </view>
		    <!-- end -->
			
			
			<!-- 评论内容 -->
			  <view class='padding shadow-warp  bg-white comment-content' v-for="(item,index) in 6" :key="index">
			    <view class='comment-content-1'>
			      <view class='comment-content-1_image'>
			        <image src='https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg'></image>
			      </view>
			      <view class='comment-content-1_2'>
			        <text class='text-black'>Amibition</text>
			      </view>
			      <view>
			        <text class='cuIcon-appreciate lg text-gray'></text> 1</view>
			    </view>
			
			    <view class='comment-content-2'>
			      <view class='comment-content-2_1'>
			        <text class='text-black text-df text-weight'>阿斯顿发顺丰撒</text>
			      </view>
			      <view class='comment-content-2_2 margin-top-sm'>
			        <text class='text-sm'>1分钟前</text>
			      </view>
			
			      <view class='leave'>
			        <view class='leave-item' v-for="(item,index) in 2" :key="item">
			          <text>黑色天空中的月亮：1231231231212312312312123123123121231231231212312312312</text>
			        </view>
			        <view class='margin-top-sm'>
			          <text class='text-blue'>查看186条回复 ></text>
			        </view>
			      </view>
			    </view>
			  </view>
			  <!-- end -->
			
			
			<!-- padding30 margin30 end -->
		  </view>
		  
		  <!--  -->
		  <view class='lines'></view>
		  <!--  -->
		  <!-- 底部操作卡 -->
		  <view class=' bg-white'>
		  
		    <view class='msg_bottom bg-white'>
		      <view class='msg_bottom-1'>
		        <input name='msg' placeholder='觉得不错说两句~~' cursor-spacing='10'></input>
		      </view>
		      <view class='msg_bottom-2'>
		        <text class='cuIcon-message text-icon  lg text-black'></text>
		        <text class='text-char'> 166</text>
		      </view>
		      <view class='msg_bottom-3'>
		        <text class='cuIcon-appreciate text-icon lg text-black'></text>
		        <text class='text-char'> 1688</text>
		      </view>
		    </view>
			
		  
		  </view>
		
		  
		 
		  
	</view>
</template>

<script>
	export default {
		data() {
			return {
				    //图片
				    imgArr: [
				     "https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg",
				      "https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg",
				      "https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg",
				   
				    ],
				    // end
					// 评论内容
					discuss:[
						{id:1,image:"https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg",name:"Amibition",cook:"1008",hotImg:"../../../static/img/hot_evaluate1.png",center:" 阿斯顿发顺丰撒阿斯顿发顺丰撒阿斯顿发顺丰撒阿斯顿发顺丰撒阿斯顿发顺丰撒",time:"1分钟前"},
						{id:2,image:"https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg",name:"Amibition",cook:"1008",hotImg:"../../../static/img/hot_evaluate1.png",center:" 阿斯顿发顺丰撒阿斯顿发顺丰撒阿斯顿发顺丰撒阿斯顿发顺丰撒阿斯顿发顺丰撒",time:"1分钟前"},
						{id:3,image:"https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg",name:"Amibition",cook:"1008",hotImg:"../../../static/img/hot_evaluate1.png",center:" 阿斯顿发顺丰撒阿斯顿发顺丰撒阿斯顿发顺丰撒阿斯顿发顺丰撒阿斯顿发顺丰撒",time:"1分钟前"},
						]
			}
		},
		methods: {
			  // 点击图片打开详细
			  previewImg: function (e) {
			    // console.log(e.currentTarget.dataset.index);
			    var index = e.currentTarget.dataset.index;
			    var imgArr = this.data.imgArr;
			    uni.previewImage({
			      current: imgArr[index],     //当前图片地址
			      urls: imgArr,               //所有要预览的图片的地址集合 数组形式
			      success: function (res) { },
			      fail: function (res) { },
			      complete: function (res) { },
			    })
			  },
			  
			  
			  // 跳转回复留言详细
			  toDiscover_desc:function(){
				  uni.navigateTo({
				  	url:"/pages/disconver/discover_desc_more/discover_desc_more"
				  })
			  }
			  
		}
	}
</script>

<style>
.pg{
  padding:5rpx 20rpx 20rpx 20rpx;
}
.radius-sm{
  border-radius: 20rpx;
}
/* 头部 */
.user-top{
  width: 100%;
  height: 100rpx;
  display: flex;
  align-items: center;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  margin-top: 20rpx;
  
}
.user-top-1 image{
height: 80rpx;
width: 80rpx;
border-radius: 100%;
}
.user-top-2{
  margin-left: 20rpx;
  width: 65%;
}

/* end */

/* 文字 */
.character{
  width: 100%;
  height: auto;
  padding-top: 20rpx;
  display: flex;
}
.character text{
  font-weight: 550;
  font-size: 30rpx;
  width: 100%;
   word-wrap: break-word;
    word-break: normal;
    line-height: 40rpx;
}
/* end */


/* 九宫图 */
.container-grid{
  display: flex;
  flex-wrap: wrap;
  width: 100%;

}
.container-grid__image{
  height: 210rpx;
  width: 220rpx;
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
/* end */

/* 底部浏览量 */
.browse{
  width: 100%;
  height: 100rpx;
  padding-top: 20rpx;
  display: flex;
  align-items: center;
  mask-border: 20rpx;
  border-bottom-left-radius: 20rpx;
  border-bottom-right-radius: 20rpx;
}
.browse text{
  font-size: 25rpx;
}
.img-size{
  height: 80rpx;
  width: 80rpx;
}
.cu-avatar.lg{
  width: 60rpx;
  height: 60rpx;
}
.browse-2{
  width: 46%;
}
/* end */

/* 评论 */
.comment{
  margin-top: 20rpx;
  width: 100%;
  height: 100rpx;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
}
.comment{
  color:black;
  font-size: 32rpx;
  display: flex;
  align-items: center;
  /* justify-content: center; */
}
/* end */


/* 评论内容 */
.comment-content{
  width: 100%;
  height: auto;

}
.comment-content-2_1_img{
  height: 36rpx;
  width: 65rpx;
  line-height: 40rpx;
}
.comment-content-1{
  display: flex;
  align-items: center;
}
.comment-content-1_image image{
  height: 50rpx;
  width: 50rpx;
  border-radius: 100%;
}
.comment-content-1_2{
  margin-left: 20rpx;
  width: 80%;
}
.comment-content-2{
  margin-left: 10%;
}
/* end */

/* 评论留言 */
.leave{
  padding: 20rpx;
  height: auto;
  width: 100%;
  background:#f1f1f1;
  margin-top: 20rpx;
  border-radius: 20rpx;
     word-wrap: break-word;
    word-break: normal;
    line-height: 40rpx;
}
.leave-item{
  margin-top: 20rpx;
  color: black;
}
/* end */


/* line */
.line{
  width: 100%;
  height: 0.5rpx;
  background: gainsboro;
  margin-top: 20rpx;
}
/* end */


/* 底部选项卡 */
.msg_bottom{
  padding: 20rpx;
  width: 100%;
  height: 100rpx;
  position: fixed;
  bottom: 0;
  z-index: 99;
  display: flex;
  align-items: center;
}
.lines_msg{
  display: flex;
  height: 10rpx;
}
.msg_bottom-1{
  width: 55%;
  background: #f1f1f1;
  border-radius: 40rpx;
  padding: 10rpx 20rpx 10rpx 20rpx;
  display: flex;
  align-items: center;
}
.msg_bottom-2{
  width: 20%;
  margin-left: 20rpx;
}
.text-icon{
  font-size: 45rpx;
}
.text-char {
  font-size: 35rpx;
}
/* end */

.lines{
  display: flex;
  height: 150rpx;
}



</style>
