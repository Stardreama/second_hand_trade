<template>
	<view>
		<!-- 导航栏 -->
		<view class="cu-bar bg-white solid-bottom nav-bar">
			<view class="flex padding-sm text-center text-xl tab-container">
				<view class="flex-sub tab-item" :class="{ 'active-tab': tabIndex === 0 }" @tap="switchTab(0)">
					<font-awesome-icon :icon="['fas', 'tags']" class="tab-icon" />
					<text>出售</text>
				</view>
				<view class="flex-sub tab-item" :class="{ 'active-tab': tabIndex === 1 }" @tap="switchTab(1)">
					<font-awesome-icon :icon="['fas', 'shopping-cart']" class="tab-icon" />
					<text>求购</text>
				</view>
			</view>
		</view>
		<form @submit="formSubmit" @reset="">
			<!-- 标题 -->
			<view class="cu-form-group margin-top form-item" :class="{'error-field': titleError}">
    <view class="title">
        <font-awesome-icon :icon="['fas', 'list']" class="form-icon" />
        <text>标题</text>
    </view>
    <input type="text" v-model="title" name="title" 
        placeholder="品类品牌型号都是买家喜欢搜索的" class="form-input"></input>
</view>
			<!-- end -->

			<!-- 内容 -->
			<view class="cu-form-group margin-top" :class="{'error-field': contentError}">
    <textarea v-model="content" maxlength="1000" placeholder="描述宝贝的转手原因,入手渠道和使用感受"></textarea>
</view>
			<!-- end -->

			<!-- 图片 -->
			<view class="cu-bar bg-white margin-top">
				<view class="action">
					<font-awesome-icon :icon="['fas', 'upload']" class="form-icon" />
					<text class="section-title">图片上传</text>
				</view>
				<view class="action">
					{{ imgList.length }}/5
				</view>
			</view>
			<view class="cu-form-group">
				<view class="grid col-4 grid-square flex-sub">
					<view class="bg-img" v-for="(item, index) in imgList" :key="index" @tap="ViewImage"
						:data-url="imgList[index]">
						<image :src="imgList[index]" mode='aspectFill'></image>
						<view class="cu-tag bg-red" @tap.stop="DelImg" :data-index="index">
							<text class="cuIcon-close"></text>
						</view>
					</view>
					<view class="solids" @tap="ChooseImage" v-if="imgList.length < 5">
						<text class="cuIcon-cameraadd"></text>
					</view>
				</view>
			</view>
			<!-- end -->

			<!-- 地址选择 -->
			<view class="cu-form-group form-item">
				<view class="title">
					<font-awesome-icon :icon="['fas', 'map-marker-alt']" class="form-icon" />
					<text>地址选择</text>
				</view>
				<picker mode="multiSelector" @change="MultiChange" @columnchange="MultiColumnChange" :value="multiIndex"
					:range="multiArray">
					<view class="picker">
						{{ multiArray[0][multiIndex[0]] }}，{{ multiArray[1][multiIndex[1]] }}，{{
							multiArray[2][multiIndex[2]] }}
					</view>
				</picker>
			</view>
			<!-- end -->

			<!-- 价钱 -->
			<view class="cu-form-group margin-top" v-if="tabIndex === 0">
    <view class="title">出售价:</view>
    <input type="digit" @input="moneyInput" :value="money" placeholder="请输入价钱" maxlength='7'
        name="newPrice" :class="{'error-input': sellPriceError}"></input>

    <view class="title">原价:</view>
    <input type="digit" @input="newInput" :value="newMoney" placeholder="请输入原价"
        maxlength='7' name="oriPrice" :class="{'error-input': orginalPriceError}"></input>
</view>
			<!-- end -->

			<!-- 选择分类  -->
			<view class="cu-form-group">
				<view class="title">分类:</view>
				<input disabled="true" name="classify" :value='classify'></input>
				<button class="cu-btn  bg-green" role="button" aria-disabled="false" @tap="showModal"
					data-target="DrawerModalL">选择</button>
			</view>
			<!-- end -->

			<!-- 新旧 -->
			<view class="cu-form-group" v-if="tabIndex === 0">
				<view class="title">新旧:</view>
				<input ref="status" disabled="true" name="itemLists" :value='itemLists[itemListsIndex]'></input>
				<button class="cu-btn bg-green" role="button" aria-disabled="false" @tap="newState">选择</button>
			</view>
			<!-- end -->

			<!-- 交易方式 -->
			<view class="cu-form-group">
				<view class="title">交易方式</view>
				<checkbox-group name="means" @change="checkboxChange">
					<checkbox :class="checkboxs[0].checked ? 'checked' : ''"
						:checked="checkboxs[0].checked ? true : false" value="自提"></checkbox> 自提
					<checkbox :class="checkboxs[1].checked ? 'checked' : ''"
						:checked="checkboxs[1].checked ? true : false" value='同城面交'></checkbox> 同城面交
					<checkbox :class="checkboxs[2].checked ? 'checked' : ''"
						:checked="checkboxs[2].checked ? true : false" value='邮寄'></checkbox> 邮寄
				</checkbox-group>

			</view>
			<!-- end -->

			<!-- 确定发布 -->
			<view class="padding flex flex-direction">
				<button class="cu-btn submit-btn margin-tb-sm lg" form-type="submit">
					<font-awesome-icon :icon="['fas', 'paper-plane']" class="submit-icon" />
					{{ tabIndex === 0 ? '发布出售' : '发布求购' }}
				</button>
			</view>
			<!-- end -->
		</form>

		<!-- 模态框 -->
		<view @touchmove.stop="modeMove" class=" cu-modal drawer-modal justify-start "
			:class="modalName == 'DrawerModalL' ? 'show' : ''" @tap="hideModal">
			<scroll-view scroll-with-animation='true' scroll-y='true' class="cu-dialog basis-lg">
				<view class="cu-list menu text-left">
					<view class="cu-item " v-for="(item, index) in picker" :key="index" @tap="getClassify"
						:data-name="item.classify_name" :data-value="item.classify_id">
						<view class="content">
							<view>{{ item.classify_name }}</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>

	</view>
</template>

<script>
import allSchool from "../../common/allSchool.js";
export default {
	data() {
		return {
			tabIndex: 0, // 0: 出售, 1: 求购
			title: '',  // 产品标题绑定（对应数据库 product_title，类型 TEXT）
			modalName: '',//模态框开关
			picker: [
				{ classify_id: 1, classify_name: '数码产品' },
				{ classify_id: 2, classify_name: '家电' },
				{ classify_id: 3, classify_name: '服饰' },
				{ classify_id: 4, classify_name: '图书' },
				{ classify_id: 5, classify_name: '生活用品' }
			],
			itemListsIndex: 0, // 新旧程度下标（绑定到 product_status，类型 VARCHAR(255)）
			itemLists: ['全新', '99新', '95新', '85新', '8新'],
			classify: '其他闲置', // 分类默认值（绑定到 product_class，类型 VARCHAR(255)）
			content: '', // 商品描述
			money: '', // 出售价
			newMoney: '', // 原价
			imgList: [], // 图片上传列表
			multiIndex: [0, 0, 0],//地址选择下标
			multiArray: [
				['北京市', '重庆市', '福建省', '江苏省', '广东省', '辽宁省', '内蒙古', '山西省', '青海省', '四川省', '贵州省', '云南省', '陕西省', '西藏', '宁夏', '新疆', '广西', '海南省', '湖南省', '湖北省', '河南省', '山东省', '江西省', '安徽省', '浙江省', '上海', '黑龙江省', '吉林省', '甘肃省', '天津市', '河北省'],
				['北京市'],
				['北京大学', '中国人民大学', '清华大学', '北京交通大学', '北京工业大学', '北京航空航天大学', '北京理工大学', '北京科技大学', '北方工业大学', '北京化工大学', '北京工商大学', '北京服装学院', '北京邮电大学', '北京印刷学院', '北京建筑大学', '北京石油化工学院', '北京电子科技学院', '中国农业大学', '北京农学院', '北京林业大学', '北京协和医学院', '首都医科大学', '北京中医药大学', '北京师范大学', '首都师范大学', '首都体育学院', '北京外国语大学', '北京第二外国语学院', '北京语言大学', '中国传媒大学', '中央财经大学', '对外经济贸易大学', '北京物资学院', '首都经济贸易大学', '外交学院', '中国人民公安大学', '国际关系学院', '北京体育大学', '中央音乐学院', '中国音乐学院', '中央美术学院', '中央戏剧学院', '中国戏曲学院', '北京电影学院', '北京舞蹈学院', '中央民族大学', '中国政法大学', '华北电力大学', '中华女子学院', '北京信息科技大学', '中国矿业大学（北京）', '中国石油大学（北京）', '中国地质大学（北京）', '北京联合大学', '北京城市学院', '中国青年政治学院', '首钢工学院', '中国劳动关系学院', '北京吉利学院', '首都师范大学科德学院', '北京工商大学嘉华学院', '北京邮电大学世纪学院', '北京工业大学耿丹学院', '北京警察学院', '北京第二外国语学院中瑞酒店管理学院', '北京工业职业技术学院', '北京信息职业技术学院', '北京电子科技职业学院', '北京京北职业技术学院', '北京交通职业技术学院', '北京青年政治学院', '北京农业职业学院', '北京政法职业学院', '北京财贸职业学院', '北京北大方正软件职业技术学院', '北京经贸职业学院', '北京经济技术职业学院', '北京戏曲艺术职业学院', '北京汇佳职业学院', '北京科技经营管理学院', '北京科技职业学院', '北京培黎职业学院', '北京经济管理职业学院', '北京劳动保障职业学院', '北京社会管理职业学院', '北京艺术传媒职业学院', '北京体育职业学院', '北京交通运输职业学院', '北京卫生职业学院', '北京网络职业学院', '其他']
			],//默认选择地址
			region: ['贵州省', '毕节市', '毕节职业技术学院'],//选择地址
			// 交易方式
			checkboxs: [
				{ value: "自提", checked: false },
				{ value: "同城面交", checked: false },
				{ value: "邮寄", checked: false },
			],
		// 错误状态变量
        titleError: false,
        contentError: false,
        sellPriceError: false,
        orginalPriceError: false,
		}
	},
	methods: {
		// 切换标签页
		switchTab(index) {
			this.tabIndex = index;
			// 清空表单
			this.resetForm();
		},

		// 重置表单
		resetForm() {
			this.title = '';
			this.content = '';
			this.imgList = [];
			this.money = '';
			this.newMoney = '';
			this.multiIndex = [0, 0, 0];
			this.classify = '其他闲置';
			this.itemListsIndex = 0;
			this.checkboxs.forEach(item => item.checked = false);
		},
		formSubmit() {
			// 从本地存储获取 token
			console.log("Title:", this.title);
			const token = uni.getStorageSync('token');
			let isValid = true;
			// 验证标题
			if (!this.validateField('title')) {
				isValid = false;
			}
			// 验证内容
			if (!this.validateField('content')) {
				isValid = false;
			}
			// 仅在出售模式下验证价格和图片
			if (this.tabIndex === 0) {
				// 验证分类
				if (!this.validateField('sellPrice')) {
					isValid = false;
				}
				// 验证分类
				if (!this.validateField('orginalPrice')) {
					isValid = false;
				}

				// 验证图片
				if (this.imgList.length === 0) {
					uni.showToast({
						title: '出售商品请上传至少一张图片',
						icon: 'none',
						duration: 2000,
					});
					isValid = false;
				}
			}
			// 验证分类
			if (!this.validateField('status')) {
				isValid = false;
			}
			if (!isValid) {
				uni.showToast({
					title: '请填写完整信息',
					icon: 'none',
					duration: 2000,
				});
				return;
			}

			const selectedMethods = this.checkboxs.filter(i=>i.checked).map(i=>i.value).join('|');
			console.log(selectedMethods);
			


			// 处理发布请求
			const formData = {
				title: this.title,
				description: this.content,
				price: this.tabIndex === 0 ? this.money : '0', // 求购时价格可为0
				product_status: this.tabIndex === 0 ? this.itemLists[this.itemListsIndex] : '求购',
				product_class: this.classify,
				product_type: this.tabIndex === 0 ? 'sell' : 'buy', // 区分出售与求购
				token: token,
				status: selectedMethods,
			};
			// console.log("🔔 发布 payload →", formData.status);

			// 区分有图和无图的情况
			if (this.imgList.length > 0) {
				// 有图片的情况
				uni.uploadFile({
					url: 'http://localhost:3000/api/products/create',
					filePath: this.imgList[0],
					name: 'image',
					formData: formData,
					header: {
						'Authorization': `Bearer ${token}`
					},
					success: (res) => {
						console.log(formData.status);
						
						this.handleUploadSuccess(res, token);
					},
					fail: this.handleUploadFail
				});
			} else {
				// 无图片的情况（仅适用于求购）
				uni.request({
					url: 'http://localhost:3000/api/products/create-no-image',
					method: 'POST',
					data: formData,
					header: {
						'Authorization': `Bearer ${token}`
					},
					success: (res) => {
						if (res.statusCode === 201) {
							uni.showToast({
								title: '求购信息发布成功',
								icon: 'success',
								duration: 2000,
							});
							// 重置表单
							this.resetForm();
						} else {
							uni.showToast({
								title: res.data.message || '发布失败，请重试',
								icon: 'none',
								duration: 2000,
							});
						}
					},
					fail: this.handleUploadFail
				});
			}
		},

		// 添加处理上传成功的方法
		handleUploadSuccess(res, token) {
			const data = JSON.parse(res.data);
			if (res.statusCode === 201) {
				const productId = data.product_id;
				console.log('封面图片上传成功，product_id:', productId);

				// 上传其他图片（非封面图片）
				this.imgList.slice(1).forEach((filePath, index) => {
					uni.uploadFile({
						url: 'http://localhost:3000/api/products/addImage',
						filePath: filePath,
						name: 'image',
						formData: {
							product_id: productId,
						},
						header: {
							'Authorization': `Bearer ${token}`,
						},
						success: (res) => {
							const data = JSON.parse(res.data);
							if (res.statusCode === 200) {
								console.log(`图片 ${index + 1} 上传成功`);
							} else {
								uni.showToast({
									title: data.message || '上传失败，请重试',
									icon: 'none',
									duration: 2000,
								});
							}
						},
						fail: this.handleUploadFail
					});
				});

				// 重置表单
				this.resetForm();

				// 显示发布成功提示
				uni.showToast({
					title: this.tabIndex === 0 ? '商品发布成功' : '求购信息发布成功',
					icon: 'success',
					duration: 2000,
				});
			} else {
				uni.showToast({
					title: data.message || '发布失败，请重试',
					icon: 'none',
					duration: 2000,
				});
			}
		},

		// 添加处理上传失败的方法
		handleUploadFail(err) {
			console.error('上传失败:', err);
			uni.showToast({
				title: '网络错误，请重试',
				icon: 'none',
				duration: 2000,
			});
		},
		validateField(field) {
    let isValid = true;
    
    // 根据不同字段类型进行处理
    switch(field) {
        case 'title':
            isValid = this.title && this.title.trim() !== '';
            break;
        case 'content':
            isValid = this.content && this.content.trim() !== '';
            break;
        case 'sellPrice':
            isValid = this.tabIndex === 1 || (this.money && this.money.trim() !== '');
            break;
        case 'orginalPrice':
            isValid = this.tabIndex === 1 || (this.newMoney && this.newMoney.trim() !== '');
            break;
        case 'status':
            isValid = true; // 这些通常有默认值
            break;
        default:
            isValid = Boolean(this[field]);
    }
    
    // 如果验证失败，使用uni-app的震动API而非DOM操作
    if (!isValid) {
        // 使用uni-app的震动API
        uni.vibrateShort({
            success: function () {
                console.log('震动成功');
            }
        });
        
        // 突出显示错误字段（通过临时设置相关变量）
        switch(field) {
            case 'title':
                this.titleError = true;
                setTimeout(() => { this.titleError = false; }, 500);
                break;
            case 'content':
                this.contentError = true;
                setTimeout(() => { this.contentError = false; }, 500);
                break;
            case 'sellPrice':
                this.sellPriceError = true;
                setTimeout(() => { this.sellPriceError = false; }, 500);
                break;
            case 'orginalPrice':
                this.orginalPriceError = true; 
                setTimeout(() => { this.orginalPriceError = false; }, 500);
                break;
        }
    }
    
    return isValid;
},
		// 选择地址
		MultiChange(e) {
			this.multiIndex = e.detail.value
		},
		MultiColumnChange(e) {
			var that = this;
			allSchool.all(e, that);
		},

		// end


		// 图片上传
		ChooseImage() {
			uni.chooseImage({
				count: 5 - this.imgList.length, // 限制还能选择的图片数量
				sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
				sourceType: ['album'], //从相册选择
				success: (res) => {
					if (this.imgList.length != 0) {
						this.imgList = this.imgList.concat(res.tempFilePaths)
					} else {
						this.imgList = res.tempFilePaths
					}
				}
			});
		},
		ViewImage(e) {
			uni.previewImage({
				urls: this.imgList,
				current: e.currentTarget.dataset.url
			});
		},
		// 删除照片
		DelImg(e) {
			uni.showModal({
				title: '提示',
				content: '确定要删除这个照片吗？',
				cancelText: '再看看',
				confirmText: '删除',
				success: res => {
					if (res.confirm) {
						this.imgList.splice(e.currentTarget.dataset.index, 1);
						this.imgList = this.imgList
					}
				}
			})
		},

		//限制只能到小数点2位
		moneyInput: function (e) {
			var money;
			if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) { //正则验证，提现金额小数点后不能大于两位数字
				money = e.detail.value;
			} else {
				money = e.detail.value.substring(0, e.detail.value.length - 1);
			}
			this.money = money;
		},

		//原价验证
		newInput: function (e) {
			var money;
			if (/^(\d?)+(\.\d{0,2})?$/.test(e.detail.value)) { //正则验证，提现金额小数点后不能大于两位数字
				money = e.detail.value;
			} else {
				money = e.detail.value.substring(0, e.detail.value.length - 1);
			}
			this.newMoney = money;
		},


		// 选择交易方式
		checkboxChange: function (e) {
			console.log(e);
			//获取选择状态
			var item = this.checkboxs,
				values = e.detail.value;
			for (var i = 0; i < item.length; i++) {
				item[i].checked = false;//初始化选择状态
				for (var j = 0; j < values.length; j++) {
					if (item[i].value == values[j]) {
						item[i].checked = true;
						break;
					}
				}
			}


		},

		// 新旧程度
		newState: function (e) {
			var that = this;
			uni.showActionSheet({
				itemList: that.itemLists,
				success(e) {
					that.itemListsIndex = e.tapIndex
				}
			})
		},
		// 拦截模态框滚动事件
		modeMove: function () {

		},

		// 显示分类模态框
		showModal(e) {
			this.modalName = e.currentTarget.dataset.target
		},
		// 隐藏分类模态框
		hideModal(e) {
			this.modalName = null
		},
		// 得到分类的值
		getClassify: function (e) {
			this.classify = e.currentTarget.dataset.name,
				this.classify_id = e.currentTarget.dataset.value
			this.hideModal();
		},
	},
	onLoad(options) {

	},
	onShow() {

	},
	onHide() {

	},
	// 出发下拉刷新
	onPullDownRefresh() {
		// 模拟刷新完成
		setTimeout(function () {
			uni.stopPullDownRefresh();
		}, 2000);
	},
}
</script>

<style>
.rule {
	display: flex;
	justify-content: space-between;
}

.margin-top-xl-170 {
	margin-top: 170rpx;
}

.nav-bar {
	border-radius: 12rpx;
	margin: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
}

.tab-container {
	width: 100%;
	padding: 10rpx;
}

.tab-item {
	padding: 20rpx 0;
	border-radius: 8rpx;
	transition: all 0.3s ease;
	display: flex;
	flex-direction: column;
	align-items: center;
	font-weight: bold;
}

.tab-icon {
	margin-bottom: 8rpx;
	font-size: 40rpx;
}

.active-tab {
	background-color: #ecf6ff;
	color: #0081ff;
	transform: translateY(-2rpx);
	box-shadow: 0 2rpx 10rpx rgba(0, 128, 255, 0.2);
}

/* 表单项样式 */
.form-item {
	border-radius: 8rpx;
	margin: 20rpx;
	box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-icon {
	margin-right: 10rpx;
	color: #666;
}

.form-input {
	padding: 10rpx;
}

.section-title {
	font-weight: bold;
	font-size: 28rpx;
	margin-left: 10rpx;
}

/* 提交按钮 */
.submit-btn {
	background: linear-gradient(45deg, #0081ff, #1cbbb4);
	box-shadow: 0 10rpx 20rpx rgba(0, 129, 255, 0.2);
	border-radius: 50rpx;
	font-size: 32rpx;
	font-weight: bold;
	letter-spacing: 2rpx;
	transition: all 0.3s ease;
	color: white;
}

.submit-btn:active {
	transform: translateY(4rpx);
	box-shadow: 0 4rpx 10rpx rgba(0, 129, 255, 0.2);
}

.submit-icon {
	margin-right: 10rpx;
}

/* 图片上传区域样式 */
.grid-square {
	border-radius: 8rpx;
	overflow: hidden;
	background-color: #f8f8f8;
	padding: 10rpx;
}

.solids {
	border: 2rpx dashed #ddd;
	transition: all 0.3s ease;
}

.solids:active {
	background-color: #f0f0f0;
}

.bg-img {
	overflow: hidden;
	border-radius: 8rpx;
	box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.1);
}

/* 验证动画 */
@keyframes shake {

	0%,
	100% {
		transform: translateX(0);
	}

	10%,
	30%,
	50%,
	70%,
	90% {
		transform: translateX(-5rpx);
	}

	20%,
	40%,
	60%,
	80% {
		transform: translateX(5rpx);
	}
}

.shake-animation {
	animation: shake 0.5s cubic-bezier(.36, .07, .19, .97) both;
	background-color: rgba(255, 73, 73, 0.05);
}
@keyframes flash {
    0%, 100% { background-color: transparent; }
    50% { background-color: rgba(255, 73, 73, 0.2); }
}

.error-field {
    animation: flash 0.5s ease;
    border: 1rpx solid rgba(255, 73, 73, 0.5) !important;
}

.error-input {
    animation: flash 0.5s ease;
    background-color: rgba(255, 73, 73, 0.1);
}
</style>