<template>
	<view>
		<!-- 内容 -->
		<view class='pa'>
		<view class='container shadow-warp bg-white' v-for="(item,index) in 6" :key="item">
		<view class='container-top'>
		<view class='container-top-1'><image src='http://img.52z.com/upload/news/image/20181123/20181123144652_18174.jpg'></image></view>
		
		<view class='container-top-2'>
		<view class='container-top-2_1'>
		<view class='container-top-2_1_1'><text class='text-lg text-weigth'>Amibitiom</text></view>
		<view><text class='text-price text-red text-lg text-weigth '>2330</text></view>
		</view>
		<view><text class='cuIcon-time lg text-gray'></text><text class='padding-left'>35天前来过</text></view>
		</view>
		</view>
		
		<view class='container-ScrollImage'>
		  <scroll-view scroll-x="true" style=" white-space: nowrap; display: flex" class='top-20'>
		    <block v-for="(item,index) in 10" :key="index">
		      <view class='item-inlines'>
		        <navigator url='' hover-class='none'>
		          <view class="item-inline bg-img padding-top-xl flex align-end" :style=" 'background-image: url('+url+');' ">
		          </view>
		        </navigator>
		      </view>
		    </block>
		  </scroll-view>
		</view>
		
		<view class='container-title'><text>vivo X21 6+128G 红色 后置指纹 全网通</text></view>
		
		<view class='container-UserDesc'>
		<view class='container-UserDesc-1'><text>来自毕节职业技术学院</text></view>
		<view class='container-UserDesc-2' :class=" 'animation-' + animation " @tap='clickCollect'><view class="cu-tag line-black padding-ll"><text class="text-xxl  " :class=" [collect == true ? 'text-yellow' : '',collect == true ? 'cuIcon-favorfill' : 'cuIcon-favor'] "></text><text class='cancel text-black'>{{collectState}}</text></view></view>
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
				url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg',
				// 控制收藏状态
				collect:true,
				collectState:'取消收藏',
				animation:'',
				//end
			}
		},
		methods: {
			   
				// 点击收藏
				  clickCollect:function(){
				    var that = this;
				      this.animation =  'scale-up'
				    setTimeout(function () {
				        this.animation =  ''
				    }, 600)
				    
				    if (that.collect){
				          this.collect = false,
				          this.collectState = '收藏'
				    }else{
				        this.collect = true,
				        this.collectState = '取消收藏'
				    }
				
				  },
		},
		
	}
</script>

<style>
.pa{
padding: 20rpx;
}
/* 内容 */
.container{
  width: 100%;
  padding: 20rpx;
  height: 500rpx;
  margin-bottom: 20rpx;
}
.container-top-1 image{
  height: 120rpx;
  width: 120rpx;
}
.container-top{
  display: flex;
  align-items: center;
}
.container-top-2{
  margin-left: 20rpx;
  width: 90%;
}
.container-top-2_1{
  display: flex;
  margin-bottom: 20rpx;
}
.container-top-2_1_1{
  width: 80%;
}
.text-weigth{
  font-weight: 550;
}
.padding-left{
  padding-left: 10rpx
}
.item-inlines{
  display: inline-block;
}
.item-inline{
display: inline-block;
margin-right: 10rpx;
height: 150rpx;
width: 230rpx;
}
.container-ScrollImage{
  margin-top: 20rpx;
}
.container-title{
  margin-top: 20rpx;
}
.container-title text{
  font-size: 30rpx;
  color: black;
  font-weight: 700;
}
.container-UserDesc{
  margin-top: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.container-UserDesc-1{
  font-size: 22rpx;
  color: var(--cyan);
  font-weight: 600;
}
.container-UserDesc-2{
margin-right: 20rpx;
}
.padding-ll{
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-top: 38rpx;
  padding-bottom: 38rpx;
}
.cancel{
  padding-left: 8rpx;
  font-weight: 550;
}
/* end */
</style>
