<template>
	<!-- <bar></bar> -->
<view class="">
	

<!-- 搜索 -->
  <view class="cu-bar search bg-white" id="TabCurTab">
    <!-- <view class="action text-cut locaWidth" bindtap='toSelectAddress'>
      <text class='text-cut'>毕节市毕节市</text>
      <text class="cuIcon-triangledownfill"></text>
    </view> -->
    <view class="search-form round" bindtap='toSearch'>
      <text class="cuIcon-search"></text>
      <input type="text" placeholder="搜索物品" confirm-type="search"></input>
    </view>
  <view class="cu-avatar round search_img" style="background-image:url(../../static/img/avatar.jpg);"></view>
  </view>
<!-- 搜索end -->


<!-- 轮播图 -->
<!-- <swiper class="screen-swiper square-dot " :indicator-dots="true" :circular="true"
		 :autoplay="true" interval="5000" duration="500">
			<swiper-item v-for="(item,index) in swiperList" :key="index">
				<image :src="item.url" mode="aspectFill" v-if="item.type=='image'"></image>
				<video :src="item.url" autoplay loop muted :show-play-btn="false" :controls="false" objectFit="cover" v-if="item.type=='video'"></video>
			</swiper-item>
		</swiper> -->
<!-- 轮播图end -->

<!--头条滚动区域-->
<swiper class="swiperitem margin-top solid-bottom" autoplay="true" vertical="true" circular="true" @click="lineschange">
    <block v-for="(item,index) in Headlines" :key="index">
        <swiper-item  @click="linesclick">
            <view class="cu-bar bg-white">
                <view class='action'>
                    <text class="cuIcon-triangledownfill text-orange"></text>
                    <text>头条：{{item.title}}</text>
                </view>
            </view>
        </swiper-item>
    </block>
</swiper>
<!-- end -->

<!-- 宫格列表 -->
<!-- <view class="cu-list no-border grid  card-menu "  :class="['col-' + gridCol]" >
    <view class="cu-item" v-for="(item,index) in iconList" :key="index" v-if="index<gridCol*2">
    <navigator :url="item.name == '全部分类' ? '/pages/home/home_classify/home_classify' : '/pages/home/home_grid/home_grid' "  :data-value='item.name' hover-class='none'>
      
	   <view :class=" ['cuIcon-' + item.icon,'text-'+item.color] " >
        <view class="cu-tag badge" v-if="item.badge!=0">
          <block v-if="item.badge!=1"> {{item.badge>99?"99+":item.badge}}</block>
        </view>
      </view>
      <text>{{item.name}}</text>
      </navigator>
    </view>
  </view> -->
<!-- 宫格列表end -->


<!-- 3布局 -->
     <!-- <view class="canui-duotu">

                        <view class="canui-dtimg-a">
                            <view class="canui-dtimg-content">
                                <image src="https://image.weilanwl.com/img/4x3-3.jpg" mode="aspectFill"></image>
                                <view class="text-sm canui-dtimg-text">
                                    <view class="text-white canui-xzwz">商品名称商品名称商品名称商品名称</view>
                                    <view class="text-price text-red">60000</view>
                                </view>
                            </view>
                        </view>
                        
                        <view class="canui-dtimg-b">

                            <view class="canui-dtimg-ba">
                                <view class="canui-dtimg-content">
                                    <image src="https://image.weilanwl.com/img/4x3-3.jpg" mode="aspectFill"></image>
                                    <view class="text-sm canui-dtimg-text">
                                        <view class="text-white canui-xzwz">商品名称</view>
                                        <view class="text-price text-red">60</view>
                                    </view>
                                </view>
                            </view>
                            
                            <view class="canui-dtimg-bb">

                                <view class="canui-dtimg-content">
                                    <image src="https://image.weilanwl.com/img/4x3-3.jpg" mode="aspectFill"></image>
                                    <view class="text-sm canui-dtimg-text">
                                        <view class="text-white canui-xzwz">商品名称商品名称商品名称商品名称</view>
                                        <view class="text-price text-red">60000</view>
                                    </view>
                                </view>

                            </view>

                        </view>

                    </view> -->
<!-- end -->

<!-- 导航条 -->
<TopBar @click="tabSelect" :TabCur="TabCur" :dataList ="tablist"></TopBar>
<!-- 导航条 -->


<!-- 点击回到顶部 -->
<view class='goTop'>
<image src='../../static/img/top_top.png'  v-if="!showTop" @click='goTop'></image>
</view>
<!-- end -->



 <!-- 内容 -->
 <!-- 商品列表容器 -->
  <!-- 使用v-for循环渲染products数组中的每个商品 -->
  <view class='card-menu container margin-top' 
        v-for="item in products" 
        :key="item.product_id">
    <!-- 商品详情页导航 -->
    <navigator url='/pages/home/home_detail/home_detail' 
               hover-class='none'>
      
      <!-- 商品图片容器 -->
      <view class='container_img'>
        <!-- 动态绑定图片路径，调用方法处理图片地址 -->
        <image :src="getImageUrl(item.image)"></image>
      </view>

      <!-- 商品标题容器 -->
      <view class='container_text'>
        <!-- 显示商品标题 -->
        <text>{{ item.product_title }}</text>
      </view>

      <!-- 价格和状态容器 -->
      <view class='container_price'>
        <!-- 显示商品价格（建议后续添加价格格式化） -->
        <text class='container_price_text_0'>￥{{ item.price }}</text>
        <!-- 动态绑定状态标签样式 -->
        <view class="cu-tag" :class="getStatusClass(item.product_status)">
          {{ item.product_status }}
        </view>

      </view>
        </navigator>
</view>
<!-- 内容end -->
</view>






</template>

<script>
	import bar from "../component/bar.vue";
	import TopBar from "../component/topTab.vue";
	import axios from 'axios';
	export default {
		data() {
			return {
				  // 导航条
				    TabCur: '0',
				    scrollLeft: 0,
				  // 导航条end
				 scrollTop:0,//屏幕位置
				 TabCurTab:0,//吸附置顶的偏差值
				 ceil_top:'',//导航条置顶高度
				//  // 轮播图
				//     cardCur: 0,
				//     swiperList: [{
				//       id: 0,
				//       type: 'image',
				//       url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big84000.jpg'
				//     }, {
				//       id: 1,
				//       type: 'image',
				//       url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big84001.jpg',
				//     }, {
				//       id: 2,
				//       type: 'image',
				//       url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big39000.jpg'
				//     }, {
				//       id: 3,
				//       type: 'image',
				//       url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg'
				//     }, {
				//       id: 4,
				//       type: 'image',
				//       url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big25011.jpg'
				//     }, {
				//       id: 5,
				//       type: 'image',
				//       url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big21016.jpg'
				//     }, {
				//       id: 6,
				//       type: 'image',
				//       url: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big99008.jpg'
				//     }],
				//     // 轮播图end
					// 宫格列表
					iconList: [{
					      icon: 'cardboardfill',
					      color: 'red',
					      badge: 120,
					      name: '手机'
					    }, {
					      icon: 'recordfill',
					      color: 'orange',
					      badge: 1,
					      name: '图书'
					    }, {
					      icon: 'picfill',
					      color: 'yellow',
					      badge: 0,
					      name: '游戏交易'
					    }, {
					      icon: 'noticefill',
					      color: 'olive',
					      badge: 22,
					      name: '服装鞋帽'
					    }, {
					      icon: 'upstagefill',
					      color: 'cyan',
					      badge: 0,
					      name: '数码'
					    }, {
					      icon: 'clothesfill',
					      color: 'blue',
					      badge: 0,
					      name: '二手车'
					    }, {
					      icon: 'discoverfill',
					      color: 'purple',
					      badge: 0,
					      name: '电脑'
					    }, {
					      icon: 'questionfill',
					      color: 'mauve',
					      badge: 0,
					      name: '毕业季'
					    }, {
					      icon: 'commandfill',
					      color: 'purple',
					      badge: 0,
					      name: '寝室用品'
					    }, {
					      icon: 'brandfill',
					      color: '美妆捡漏',
					      badge: 0,
					      name: '全部分类'
					    }],
					    gridCol: 5,
					    // 宫格列表end
						// 滚动title
						    Headlines: [{
						      id: 1,
						      title: "测试标题1",
						      type: 1
						    }, {
						      id: 2,
						      title: "测试标题2",
						      type: 2
						    }, {
						      id: 3,
						      title: "测试标题3",
						      type: 3
						    }, {
						      id: 4,
						      title: "测试标题4",
						      type: 4
						    }],
						//end
						
						// //导航条
						// tablist:[
						// {id:1,name:'导航条888'},
						// {id:2,name:'导航条2'},
						// {id:3,name:'导航条3'},
						// {id:4,name:'导航条4'}, 
						// {id:5,name:'导航条5'},
						// {id:6,name:'导航条6'},
						// 	],
						// //end
						// //显示异常屏幕回到初始化位置开关
						showTop:false,//异常
						 products: [] // 初始化商品数据为空数组,
			}
		},
		components:{
			bar,
			TopBar
		},
		onLoad:function(){
			//搜索框的高度
			// this.selectTab();
			// var view = uni.createSelectorQuery().select("#navTab");
			// view.boundingClientRect(data => {
			// console.log("节点离页面顶部的距离为" + data);
			// }).exec();

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
		   // 生命周期钩子：组件挂载完成后自动执行
  mounted() {
    this.fetchProducts();
  },

		methods: {
			// 获取商品数据的方法
    async fetchProducts() {
      try {
        // 发送GET请求到后端API
        const response = await axios.get('http://localhost:3000/api/products');
        // 将响应数据赋值给products数组
        this.products = response.data;
      } catch (error) {
        // 错误处理（建议后续添加用户提示）
        console.error('获取商品数据失败:', error);
      }
    },

    /**
     * 处理图片路径的方法
     * @param {string} path - 后端返回的图片路径
     * @returns {string} 完整的图片URL地址
     */
    getImageUrl(path) {
      // 将Windows路径分隔符转换为URL标准分隔符
      const formattedPath = path.replace(/\\/g, '/');
      // 拼接完整的图片访问地址（假设服务器运行在3000端口）
      return `http://localhost:3000/${formattedPath}`;
    },

    /**
     * 获取状态标签样式的动态类名
     * @param {string} status - 商品状态
     * @returns {Object} 包含样式类名的对象
     */
    getStatusClass(status) {
      return {
        // 全新状态使用橙色边框
        'line-orange': status === '全新',
        // 二手状态使用蓝色边框（需要定义对应的CSS类）
        'line-blue': status === '二手',
        // 其他状态使用绿色边框（需要定义对应的CSS类）
        'line-green': !['全新', '二手'].includes(status)
      };
    }
  ,
			// 导航条点击
			  tabSelect(e) {
				  // console.log(e) ;
				 
			      this.TabCur = e.currentTarget.dataset.id
			    
			  },
			  //  导航条点击end
			    // 点击回到顶部
			    onPageScroll: function (e) {
			      // console.log(e)
			        // this.setData({
			        //   scrollTop: e.scrollTop
			        // })
					this.scrollTop = e.scrollTop
			      
			      if (e.scrollTop > 500) {
					this.showTop = false;
			      } else {
					this.showTop = true;
			      }
			    },
				  goTop: function () {
				    uni.pageScrollTo({
				      scrollTop: 0,
				      duration: 300
				    })
				  },
				  //end
				  
				
				// 吸附自顶的高度
				    SelectorQuery: function () {
				      var that = this;
				      const query = wx.createSelectorQuery()
				      query.select('#navTab').boundingClientRect()
				      query.selectViewport().scrollOffset()
				      query.exec(function (res) {
				        console.log(res);
				          // ceil_top: res[0].top - res[0].height - res[0].height
						 
				      })
				    },
					
					//搜索框的高度
					  selectTab: function () {
					    var that = this;
					    const query = wx.createSelectorQuery()
					    query.select('#TabCurTab').boundingClientRect()
					    query.selectViewport().scrollOffset()
					    query.exec(function (res) {
					      console.log(res)
					        this.TabCurTab = res[0].bottom - res[0].height - 4; 
					    })
					  },
			
				

		}
	}
</script>

<style>
	
	
	/* 吸附置顶 */
	.navTab{
	  position: fixed;
	  z-index: 9999;
	  top: 0;
	}
	/* end */
	
	/* 搜索 */
	
	.search_img {
	  margin-right: 30rpx;
	}
	
	
	
	.locaWidth {
	  width: 21%;
	}
	
	/* end */
	
	/* 内容 */
	
	.container {
	  margin-left: 29rpx;
	  margin-right: 20rpx;
	  float: left;
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
	  font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
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
	
	/* end */
	
	
	
	/* 滚动的title */
	
	.swiperitem {
	  background: #fff;
	  height: 40px;
	  margin-left: 30rpx;
	  margin-right: 30rpx;
	}
	
	/* end */
	
	.cu-list.grid.no-border {
	  border-radius: 0rpx;
	}
	
	/* 3布局 */
	
	
	.canui-xzwz {
	  overflow: hidden;
	  text-overflow: ellipsis;
	  display: -webkit-box;
	  -webkit-box-orient: vertical;
	  -webkit-line-clamp: 1;
	}
	
	
	.canui-duotu {
	  padding: 20rpx 30rpx;
	  padding-left: 380rpx;
	  padding-bottom: 30rpx;
	  position: relative;
	  display: flex;
	}
	
	.canui-dtimg-a {
	  position: absolute;
	  left: 30rpx;
	  width: 344rpx;
	  height: 348rpx;
	}
	
	.canui-dtimg-b {
	  height: 348rpx;
	  width: 100%;
	}
	
	.canui-dtimg-ba, .canui-dtimg-bb {
	  height: 172rpx;
	}
	
	.canui-dtimg-bb {
	  margin-top: 5rpx;
	}
	
	.canui-dtimg-content {
	  position: relative;
	}
	
	.canui-dtimg-content, .canui-duotu image {
	  width: 100%;
	  height: 100%;
	}
	
	
	.canui-dtimg-text {
	  position: absolute;
	  bottom: 0px;
	  background: rgba(0, 0, 0, 0.4);
	  height: 60rpx;
	  line-height: 60rpx;
	  padding: 0 15rpx;
	}
	
	.canui-dtimg-text .text-white {
	  float: left;
	  width: auto;
	  max-width: 210rpx;
	  margin-right: 10rpx;
	  color: #aaa;
	}
	
	.canui-dtimg-text .text-price {
	  float: right;
	}
	
	.canui-dtimg-a .canui-dtimg-text {
	  border-radius: 0 0 0 10rpx;
	}
	
	.canui-dtimg-b .canui-dtimg-text .text-white {
	  max-width: 150rpx;
	}
	
	.cu-card>.cu-item {
	  margin-top: 0rpx;
	}
	
	.cu-card>.margin-top {
	  margin-top: 30rpx;
	}
	
	/* end */
	
	/* 点击回到顶部 */
	
	.goTop image {
	height: 60rpx;
	width: 60rpx;
	border-radius: 100%;
	position: fixed;
	bottom: 150rpx;
	right: 60rpx;
	z-index: 10000;
	}
	
	/* end */
	
	/* 撑高线条 */
	.lines{
	  display: flex;
	  width: 100%;
	  height: 150rpx;
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
	
	/* 登陆按钮 */
	.loginButton{
	  width: 100%;
	}
	/* end */

</style>
