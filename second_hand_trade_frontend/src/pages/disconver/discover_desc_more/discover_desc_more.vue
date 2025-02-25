<template>
	<view>
		<!-- 头部 -->
		
		<view class='pg'>
		  <!-- 评论内容 -->
		  <view class='padding shadow-warp  bg-white comment-content' v-for="(item,index) in 1" :key="index">
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
		        <image class='comment-content-2_1_img' src='../../../static/img/hot_evaluate1.png'></image>
		        <text class='text-black text-df text-weight'> 阿斯顿发顺丰撒阿斯顿发顺丰撒阿斯顿发顺丰撒阿斯顿发顺丰撒阿斯顿发顺丰撒</text>
		      </view>
		      <view class='comment-content-2_2 margin-top-sm'>
		        <text class='text-sm'>1分钟前</text>
		      </view>
		    </view>
		  </view>
		  
		  <!-- 评论标题 -->
		  <view class='comment  padding-sm bg-white'>
		    <text>全部评论 * 16</text>
		  </view>
		  <!-- end -->
		  
		  <!-- 评论内容 -->
		    <view class='padding shadow-warp  bg-white comment-content' v-for="(item,index) in 6" :key="item">
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
		  
		      </view>
		    </view>
		    <!--评论内容 end -->
			
		  
		  </view>
		  <!-- end -->
		  
		 <!--  -->
		 <view class='lines'></view>
		 <!--  -->
		 
		 <!-- 底部操作卡 -->
		 <view class=' bg-white'>
		 
		   <view class='msg_bottom bg-white'>
		     <view class='msg_bottom-1'>
		       <input @input='textChange' name='msg' placeholder='觉得不错说两句~~' cursor-spacing="10"></input>
		     </view>
		 
		     <view class='msg_bottom-2'>
		     <button class="cu-btn round  bg-green" role="button" aria-disabled="false" :disabled='sendState' >发送</button>
		     </view>
		       
		   </view>
		   </view>
		   <!-- 底部操作卡end -->
		 
		 

	</view>
</template>

<script>
	export default {
		data() {
			return {
				   // 发送按钮状态
				    sendState:true,//默认不能点击
			}
		},
		methods: {
			  // 监听文字改变 发送按钮样式
			  textChange:function(e){
			    var len = e.detail.value;
			    if(len == null || len == '' || len == undefined){
			          this.sendState = true
			    }else{
			        this.sendState = false
			    }
			  },
		}
	}
</script>

<style>
.pg{
  padding:20rpx 20rpx 20rpx 20rpx;
}
.radius-sm{
  border-radius: 20rpx;
}


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
  /* margin-top: 20rpx; */

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
  margin-right: 20rpx;
}
.lines_msg{
  display: flex;
  height: 10rpx;
}
.msg_bottom-1{
  width: 80%;
  background: #f1f1f1;
  border-radius: 40rpx;
  padding: 10rpx 20rpx 10rpx 20rpx;
  display: flex;
  align-items: center;
}
.msg_bottom-1 input{
    width: 100%;
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
