<template>
	
	<scroll-view scroll-x  class="bg-white nav "  id="navTab"  >
	  <view class="flex text-center">
		<view class="cu-item flex-sub" :class="index==TabCur?'text-orange cur':'' " v-for="(item,index) in tablist" :key ="index" @click="tabSelect"  :data-id="index">
		  {{item.name}}
		</view>
	  </view>
	</scroll-view>
	
</template>

<script>
	export default{
		data(){
			return{
				//导航条
				tablist:this.dataList,
				//end
			}
		},
		props:{
			TabCur:{//初始选择位置 0
				type:String,
				default:'0'
			},
			dataList:{//数据
			}
		},
		created() {
		},
		methods:{
		// 导航条点击
		  tabSelect(e) {
		   
		   this.$emit('click',e);//让父类使用改方法
		    
		  }
		}
	}
</script>

<style>
</style>
