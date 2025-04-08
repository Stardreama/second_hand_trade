<template>
	<view>
		<!-- 导航栏 -->
		<view class="cu-bar bg-white solid-bottom nav-bar">
			<view class="flex padding-sm text-center text-xl tab-container">
				<view class="flex-sub tab-item" :class="{ 'active-tab': tabIndex === 0 }" @tap="switchTab(0)">
					<uni-icons type="shop" size="44" color="#1890ff" class="tab-icon"></uni-icons>
					<text>出售</text>
				</view>
				<view class="flex-sub tab-item" :class="{ 'active-tab': tabIndex === 1 }" @tap="switchTab(1)">
					<uni-icons type="cart" size="44" color="#1890ff" class="tab-icon"></uni-icons>
					<text>求购</text>
				</view>
			</view>
		</view>

		<form @submit="formSubmit" @reset="">
			<!-- 标题 -->
			<view class="cu-form-group margin-top form-item" :class="{ 'error-field': titleError }">
				<view class="title">
					<uni-icons type="compose" size="36" color="#1890ff" class="form-icon"></uni-icons>
					<text>标题</text>
				</view>
				<input type="text" v-model="title" name="title" placeholder="品类品牌型号都是买家喜欢搜索的"
					class="form-input"></input>
			</view>
			<!-- end -->

			<!-- 内容 -->
			<view class="cu-form-group margin-top content-area" :class="{ 'error-field': contentError }">
				<textarea v-model="content" maxlength="1000" placeholder="描述宝贝的转手原因,入手渠道和使用感受"></textarea>
			</view>
			<!-- end -->

			<!-- 图片 -->
			<view class="cu-bar bg-white margin-top image-upload-bar">
				<view class="action">
					<uni-icons type="upload" size="36" color="#1890ff" class="form-icon"></uni-icons>
					<text class="section-title">图片上传</text>
				</view>
				<view class="action">
					{{ imgList.length }}/5
				</view>
			</view>
			<view class="cu-form-group image-upload-container">
				<view class="grid col-4 grid-square flex-sub">
					<view class="bg-img" v-for="(item, index) in imgList" :key="index" @tap="ViewImage"
						:data-url="imgList[index]">
						<image :src="imgList[index]" mode='aspectFill'></image>
						<view class="cu-tag bg-red delete-icon" @tap.stop="DelImg" :data-index="index">
							<uni-icons type="close" size="24" color="#ffffff"></uni-icons>
						</view>
						<view class="cu-tag bg-blue cover-icon" @tap.stop="SetAsCover" :data-index="index">
							<uni-icons type="star" size="20" color="#ffffff"></uni-icons>
							<!-- 显示封面标记 -->
							<text v-if="coverIndex === index" class="cover-text">封面</text>
						</view>
					</view>
					<view class="solids upload-box" @tap="ChooseImage" v-if="imgList.length < 5">
						<uni-icons type="plus-filled" size="60" color="#1890ff" class="upload-icon"></uni-icons>
						<!-- <text class="upload-text">添加图片</text> -->
					</view>
				</view>
			</view>
			<!-- end -->

			<view class="cu-form-group form-item">
  <view class="title">
    <uni-icons type="location" size="36" color="#1890ff" class="form-icon"></uni-icons>
    <text>选择地址</text>
  </view>
  <picker @change="bindAddressChange" :range="addressList" range-key="fullAddress">
    <view class="picker">
      {{ selectedAddress.fullAddress || '请选择地址' }}
    </view>
  </picker>
</view>
			<!-- end -->

			<!-- 价钱 -->
			<view class="cu-form-group margin-top price-group" v-if="tabIndex === 0">
				<view class="title price-label">
					<uni-icons type="wallet" size="36" color="#1890ff" class="form-icon"></uni-icons>
					<text>出售价:</text>
				</view>
				<input type="digit" @input="moneyInput" :value="money" placeholder="请输入价钱" maxlength='7' name="newPrice"
					:class="{ 'error-input': sellPriceError }"></input>

				<view class="title price-label">
					<uni-icons type="wallet" size="36" color="#1890ff" class="form-icon"></uni-icons>
					<text>原价:</text>
				</view>
				<input type="digit" @input="newInput" :value="newMoney" placeholder="请输入原价" maxlength='7'
					name="oriPrice" :class="{ 'error-input': orginalPriceError }"></input>
			</view>
			<!-- end -->

			<!-- 选择分类 -->
			<view class="cu-form-group">
				<view class="title">
					<uni-icons type="list" size="36" color="#1890ff" class="form-icon"></uni-icons>
					<text>分类:</text>
				</view>
				<input disabled="true" name="classify" :value='classify' class="category-input"></input>
				<button class="cu-btn bg-green select-btn" role="button" aria-disabled="false" @tap="showModal"
					data-target="DrawerModalL">选择</button>
			</view>
			<!-- end -->

			<!-- 新旧 -->
			<view class="cu-form-group" v-if="tabIndex === 0">
				<view class="title">
					<uni-icons type="star" size="36" color="#1890ff" class="form-icon"></uni-icons>
					<text>新旧:</text>
				</view>
				<input ref="status" disabled="true" name="itemLists" :value='itemLists[itemListsIndex]'
					class="status-input"></input>
				<button class="cu-btn bg-green select-btn" role="button" aria-disabled="false"
					@tap="newState">选择</button>
			</view>
			<!-- end -->

			<!-- 交易方式 -->
			<view class="cu-form-group trade-method">
				<view class="title">
					<uni-icons type="loop" size="34" color="#1890ff" class="form-icon"></uni-icons>
					<text>交易方式</text>
				</view>
				<checkbox-group name="means" @change="checkboxChange" class="checkbox-group">
					<label class="checkbox-item" :class="{ 'checked-label': checkboxs[0].checked }">
						<checkbox :class="checkboxs[0].checked ? 'checked' : ''"
							:checked="checkboxs[0].checked ? true : false" value="自提"></checkbox>
						<text>自提</text>
					</label>
					<label class="checkbox-item" :class="{ 'checked-label': checkboxs[1].checked }">
						<checkbox :class="checkboxs[1].checked ? 'checked' : ''"
							:checked="checkboxs[1].checked ? true : false" value='同城面交'></checkbox>
						<text>同城面交</text>
					</label>
					<label class="checkbox-item" :class="{ 'checked-label': checkboxs[2].checked }">
						<checkbox :class="checkboxs[2].checked ? 'checked' : ''"
							:checked="checkboxs[2].checked ? true : false" value='邮寄'></checkbox>
						<text>邮寄</text>
					</label>
				</checkbox-group>
			</view>
			<!-- end -->

			<!-- 确定发布 -->
			<view class="padding flex flex-direction">
				<button class="cu-btn submit-btn margin-tb-sm lg" form-type="submit">
					<uni-icons type="paperplane" size="28" color="#ffffff" class="submit-icon"></uni-icons>
					{{ tabIndex === 0 ? '发布出售' : '发布求购' }}
				</button>
			</view>
			<!-- end -->
		</form>

		<!-- 模态框 -->
		<view @touchmove.stop="modeMove" class="cu-modal drawer-modal justify-start"
			:class="modalName == 'DrawerModalL' ? 'show' : ''" @tap="hideModal">
			<scroll-view scroll-with-animation='true' scroll-y='true' class="cu-dialog basis-lg modal-content">
				<view class="modal-header">
					<text class="modal-title">选择分类</text>
				</view>
				<view class="cu-list menu text-left">
					<view class="cu-item category-item" v-for="(item, index) in picker" :key="index" @tap="getClassify"
						:data-name="item.classify_name" :data-value="item.classify_id">
						<view class="content">
							<view>{{ item.classify_name }}</view>
						</view>
					</view>
				</view>
			</scroll-view>
		</view>
		<!-- AI助手浮窗按钮 -->
		<view class="ai-float-button" @tap="showAiModal">
			<uni-icons type="info" size="28" color="#ffffff"></uni-icons>
			<text class="ai-btn-text">AI帮写</text>
		</view>

		<!-- AI助手模态框 -->
		<view class="cu-modal" :class="aiModalVisible ? 'show' : ''" @tap="hideAiModal">
			<view class="cu-dialog" @tap.stop>
				<view class="cu-bar bg-white justify-end">
					<view class="content">AI助手</view>
					<view class="action" @tap="hideAiModal">
						<uni-icons type="close" size="24" color="#333333"></uni-icons>
					</view>
				</view>
				<view class="padding-xl">
					<view class="ai-input-container">
						<input v-model="aiUserInput" class="ai-input" placeholder="描述您想要买/卖的商品，例如：我想要卖王道考研2024计组" />
						<button class="cu-btn bg-blue ai-generate-btn" @tap="generateContent" :loading="isGenerating"
							:disabled="isGenerating">
							<uni-icons v-if="!isGenerating" type="refresh" size="22" color="#ffffff"></uni-icons>
							<text>{{ isGenerating ? '生成中...' : '生成' }}</text>
						</button>
					</view>
					<view class="ai-result-container" v-if="aiResult">
						<view class="ai-result-title">
							<text class="ai-label">类型:</text>
							<text class="ai-content">{{ aiResult.type }}</text>
						</view>
						<view class="ai-result-title">
							<text class="ai-label">标题:</text>
							<text class="ai-content">{{ aiResult.title }}</text>
							<button class="cu-btn bg-blue sm ai-use-btn" @tap="useAiTitle">使用</button>
						</view>
						<view class="ai-result-content">
							<view class="ai-label">商品介绍:</view>
							<text class="ai-introduction">{{ aiResult.introduction }}</text>
							<button class="cu-btn bg-blue sm ai-use-btn" @tap="useAiContent">使用</button>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import uniIcons from '@dcloudio/uni-ui/lib/uni-icons/uni-icons.vue';
import allSchool from "../../common/allSchool.js";
export default {
	// 注册图标组件
	components: {
		uniIcons
	},
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
				{ classify_id: 5, classify_name: '生活用品' },
				{ classify_id: 6, classify_name: '其他闲置' } // 新增条目
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
			coverIndex: 0, // 默认第一张图片为封面
			// 错误状态变量
			titleError: false,
			contentError: false,
			sellPriceError: false,
			orginalPriceError: false,
			aiModalVisible: false,
			aiUserInput: '',
			aiResult: null,
			isGenerating: false,
			  addressList: [],       // 用户地址列表
    selectedAddress: {}   // 选中的地址
		}
	},
	methods: {
		 // 修改后的前端获取地址方法
		 async loadUserAddress() {
  const token = uni.getStorageSync('token');
  try {
    // 从本地存储获取用户ID（需要确保登录时已存储）
    const userId = uni.getStorageSync('userInfo').student_id;
    
    const res = await uni.request({
      url: 'http://localhost:3000/api/address',
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        user_id: userId // 通过参数传递用户ID
      }
    });

    if (res.statusCode === 200) {
      this.addressList = res.data.data.map(addr => ({
        ...addr,
        fullAddress: `${addr.province} ${addr.city} ${addr.district || ''} ${addr.address}`
      }));
      // 设置默认地址
      const defaultAddr = this.addressList.find(addr => addr.is_default);
      if (defaultAddr) this.selectedAddress = defaultAddr;
      
      // 移除了这里的自动弹出提示框部分
    }
  } catch (error) {
    console.error('获取地址失败:', error);
    uni.showToast({
      title: '地址获取失败',
      icon: 'none'
    });
  }
},

  // 地址选择改变
  bindAddressChange(e) {
    const index = e.detail.value;
    this.selectedAddress = this.addressList[index];
  },

		// 切换标签页
		switchTab(index) {
			this.tabIndex = index;
			// 清空表单
			this.resetForm();
		},
		// 设置封面图片
		SetAsCover(e) {
			const index = e.currentTarget.dataset.index;
			this.coverIndex = index;
			console.log("设置封面索引", this.coverIndex);

			uni.showToast({
				title: '已设为封面图片',
				icon: 'success',
				duration: 1500
			});
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
			console.log("Title:", this.title);
  const token = uni.getStorageSync('token');
  let isValid = true;
  // 验证标题
  if (!this.validateField('title')) {
    isValid = false;
  }
  
  // 验证地址
  if (!this.selectedAddress.address_id) {
    uni.showModal({
      title: '提示',
      content: '您还没有添加任何地址，请先添加收货地址',
      showCancel: false,
      success: () => {
        uni.navigateTo({
          url: '/pages/my/my_address/my_address'
        });
      }
    });
    return;
  }
  
			// 验证内容
			if (!this.validateField('content')) {
				isValid = false;
			}
			// 仅在出售模式下验证价格和图片
			if (this.tabIndex === 0) {
				// 验证售价
				if (!this.validateField('sellPrice')) {
					isValid = false;
				}
				// 验证原价
				if (!this.validateField('orginalPrice')) {
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

			const selectedMethods = this.checkboxs.filter(i => i.checked).map(i => i.value).join('|');

			// 处理发布请求
			const formData = {
				title: this.title,
				description: this.content,
				price: this.tabIndex === 0 ? this.money : '0', // 求购时价格可为0
				original_price: this.tabIndex === 0 ? this.newMoney : '0',
				product_status: this.tabIndex === 0 ? this.itemLists[this.itemListsIndex] : '求购',
				product_class: this.classify,
				product_type: this.tabIndex === 0 ? 'sell' : 'buy', // 区分出售与求购
				token: token,
				status: selectedMethods,
				is_off_shelf: 0, // 默认上架
				coverIndex: this.coverIndex, // 添加封面图片索引
				address: this.selectedAddress.fullAddress
			};
			console.log(this.coverIndex, "封面索引");

			// 统一使用一个接口，但区分有无图片的处理方式
			if (this.imgList.length > 0) {
				// 有图片，使用uploadFile
				console.log("有图片", this.imgList);

				uni.uploadFile({
					url: 'http://localhost:3000/api/products/create',
					filePath: this.imgList[0],
					name: 'image',
					formData: formData,
					header: {
						'Authorization': `Bearer ${token}`
					},
					success: (res) => {
						this.handleUploadSuccess(res, token);
					},
					fail: this.handleUploadFail
				});
			} else {
				// 无图片，使用普通请求
				console.log("无图片");
				uni.request({
					url: 'http://localhost:3000/api/products/create',
					method: 'POST',
					data: formData,
					header: {
						'Authorization': `Bearer ${token}`
					},
					success: (res) => {
						if (res.statusCode === 201) {
							uni.showToast({
								title: this.tabIndex === 0 ? '商品发布成功' : '求购信息发布成功',
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
				const uploadRemainingImages = async () => {
					// 遍历剩余图片，依次上传
					for (let i = 1; i < this.imgList.length; i++) {
						const filePath = this.imgList[i];
						const isCover = i === this.coverIndex; // 判断该图片是否应该是封面

						console.log(`上传图片 ${i}，是否封面:`, isCover);

						try {
							await new Promise((resolve, reject) => {
								uni.uploadFile({
									url: 'http://localhost:3000/api/products/addImage',
									filePath: filePath,
									name: 'image',
									formData: {
										product_id: productId,
										is_cover: isCover ? "1" : "0" // 传递封面标记
									},
									header: {
										'Authorization': `Bearer ${token}`
									},
									success: (res) => {
										const data = JSON.parse(res.data);
										if (res.statusCode === 200) {
											console.log(`图片 ${i} 上传成功`);
											resolve();
										} else {
											console.error(`图片 ${i} 上传失败:`, data.message);
											reject(new Error(data.message));
										}
									},
									fail: (err) => {
										console.error(`图片 ${i} 上传失败:`, err);
										reject(err);
									}
								});
							});
						} catch (error) {
							console.error(`图片 ${i} 上传出错:`, error);
							// 继续上传其他图片，不中断
						}
					}

					// 所有图片上传完成后的处理
					this.resetForm();
					uni.showToast({
						title: this.tabIndex === 0 ? '商品发布成功' : '求购信息发布成功',
						icon: 'success',
						duration: 2000
					});
				};
				// 执行上传
				uploadRemainingImages().then(() => {
					// 上传完成后跳转
					setTimeout(() => {
						uni.switchTab({
							url: '/pages/my/my'
						});
					}, 1500);
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
			switch (field) {
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
				switch (field) {
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

		// 显示AI助手模态框
		showAiModal() {
			this.aiModalVisible = true;
		},

		// 隐藏AI助手模态框
		hideAiModal() {
			this.aiModalVisible = false;
		},

		// 生成AI内容
		async generateContent() {
			if (!this.aiUserInput.trim()) {
				uni.showToast({
					title: '请输入商品描述',
					icon: 'none',
					duration: 2000
				});
				return;
			}
			let my_input=this.aiUserInput+`输出格式举例为：
{
"type": "卖",
"title": "王道2024",
"introduction": "全新正品王道二手商品，型号2024，适合大学生使用。品牌信誉良好，功能齐全，新旧程度适中，性价比高。"
}
{
"type": "买",
"title": "求购王道2024计组",
"introduction": "急需一本王道2024年计算机组成原理考研教材，85新以上即可，最好无笔记无破损。预算40元左右，比网上便宜些就行。希望校内当面交易，可灵活协商时间地点。本人计科专业考研备考中，诚心购买，请有闲置的同学尽快联系我。"
},请注意，输出内容一定只要买或者卖这两个中的一个，一定不要同时输出两部分`;
			this.isGenerating = true;
			const token = uni.getStorageSync('token');

			try {
				const res = await new Promise((resolve, reject) => {
					uni.request({
						url: 'http://localhost:3000/api/ai/generate',
						method: 'POST',
						data: {
							userInput: my_input
						},
						header: {
							'Authorization': `Bearer ${token}`
						},
						success: (res) => resolve(res),
						fail: (err) => reject(err)
					});
				});

				if (res.statusCode === 200) {
					this.aiResult = res.data;
					console.log('AI返回结果:', this.aiResult);
				} else {
					throw new Error(res.data.message || '内容生成失败');
				}
			} catch (error) {
				console.error('AI内容生成失败:', error);
				uni.showToast({
					title: '内容生成失败，请重试',
					icon: 'none',
					duration: 2000
				});
			} finally {
				this.isGenerating = false;
			}
		},

		// 使用AI生成的标题
		useAiTitle() {
			if (this.aiResult && this.aiResult.title) {
				this.title = this.aiResult.title;
				// 根据类型自动切换标签页
				if (this.aiResult.type === '买') {
					this.tabIndex = 1; // 切换到求购标签
				} else {
					this.tabIndex = 0; // 切换到出售标签
				}
				uni.showToast({
					title: '已应用AI标题',
					icon: 'success',
					duration: 1500
				});
				this.hideAiModal();
			}
		},

		// 使用AI生成的内容
		useAiContent() {
			if (this.aiResult && this.aiResult.introduction) {
				this.content = this.aiResult.introduction;
				uni.showToast({
					title: '已应用AI介绍',
					icon: 'success',
					duration: 1500
				});
				this.hideAiModal();
			}
		},


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
						this.imgList = res.tempFilePaths;
						this.coverIndex = 0;
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
						const index = e.currentTarget.dataset.index;

						// 处理删除后的封面索引逻辑
						if (index === this.coverIndex) {
							// 如果删除的是封面图片，重新设置封面为第一张
							this.coverIndex = this.imgList.length > 1 ? 0 : -1;
						} else if (index < this.coverIndex) {
							// 如果删除的图片在封面前面，封面索引减1
							this.coverIndex--;
						}

						this.imgList.splice(index, 1);
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
this.loadUserAddress(); // 页面显示时加载地址
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

/* 导航栏样式 */
.nav-bar {
	border-radius: 16rpx;
	margin: 20rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
	overflow: hidden;
	padding: 0;
}

.tab-container {
	width: 100%;
	padding: 0;
	background-color: #ffffff;
}

.tab-item {
	padding: 24rpx 0;
	border-radius: 12rpx;
	transition: all 0.3s ease;
	display: flex;
	flex-direction: column;
	align-items: center;
	font-weight: 600;
}

.tab-icon {
	margin-bottom: 10rpx;
	font-size: 44rpx;
}

.active-tab {
	background-color: #e6f7ff;
	color: #1890ff;
	transform: translateY(-2rpx);
	box-shadow: 0 2rpx 10rpx rgba(24, 144, 255, 0.15);
}

/* 表单项样式 */
.form-item {
	border-radius: 12rpx;
	margin: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.03);
	background-color: white;
	overflow: hidden;
}

.form-icon {
	margin-right: 12rpx;
	color: #1890ff;
	font-size: 36rpx;
	vertical-align: middle;
}

.form-input {
	padding: 12rpx;
	height: 50rpx;
	border-radius: 8rpx;
	background-color: #f9f9f9;
	height: auto;
}

/* 内容区域样式 */
.content-area {
	border-radius: 12rpx;
	margin: 20rpx;
	padding: 20rpx;
	background-color: white;
}

.content-area textarea {
	min-height: 200rpx;
	width: 100%;
	padding: 16rpx;
	border-radius: 8rpx;
	background-color: #f9f9f9;
	height: auto;
}

/* 图片上传区域 */
.image-upload-bar {
	border-radius: 12rpx 12rpx 0 0;
	margin: 20rpx 20rpx 0 20rpx;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.03);
	background-color: white;
	padding: 20rpx;
}

.image-upload-container {
	border-radius: 0 0 12rpx 12rpx;
	margin: 0 20rpx 20rpx 20rpx;
	padding: 20rpx;
	background-color: white;
}

.section-title {
	font-weight: 600;
	font-size: 28rpx;
	color: #333;
	margin-left: 12rpx;
}

.grid-square {
	border-radius: 12rpx;
	overflow: hidden;
	background-color: #f8f8f8;
	padding: 16rpx;
}

.bg-img {
	overflow: hidden;
	border-radius: 12rpx;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	position: relative;
}

.delete-icon {
	padding: 8rpx;
	border-radius: 50%;
	font-size: 24rpx;
}

.upload-box {
	border: 2rpx dashed #ddd;
	border-radius: 12rpx;
	transition: all 0.3s ease;
	display: flex;
	flex-direction: column;
	align-items: center;
	/* justify-content: center; */
	background-color: #fafafa;
	padding: 30rpx 0;
}

.upload-box:active {
	background-color: #f0f0f0;
}

.upload-icon {
	font-size: 60rpx;
	color: #1890ff;
	/* margin-bottom: 30rpx; */
}

.upload-text {
	font-size: 24rpx;
	color: #999;
}

/* 价格样式 */
.price-group {
	border-radius: 12rpx;
	margin: 20rpx;
	padding: 24rpx 20rpx;
	display: flex;
	align-items: center;
	background-color: white;
}

.price-label {
	display: flex;
	align-items: center;
}

/* 分类和状态输入框 */
.category-input,
.status-input {
	background-color: #f9f9f9;
	border-radius: 8rpx;
	padding: 10rpx 16rpx;
	height: auto;
}

.select-btn {
	border-radius: 8rpx;
	padding: 0 30rpx;
	background: linear-gradient(135deg, #52c41a, #389e0d);
	box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.2);
	height: 60rpx;
	line-height: 60rpx;
	margin-left: 20rpx;
	font-size: 26rpx;
}

/* 交易方式 */
.trade-method {
	border-radius: 12rpx;
	margin: 20rpx;
	padding: 24rpx 20rpx;
	background-color: white;
}

.checkbox-group {
	display: flex;
	flex-wrap: wrap;
}

.checkbox-item {
	margin-right: 40rpx;
	display: flex;
	align-items: center;
	padding: 10rpx 16rpx;
	border-radius: 30rpx;
	transition: all 0.3s ease;
}

.checked-label {
	background-color: #e6f7ff;
	color: #1890ff;
}

/* 提交按钮 */
.submit-btn {
	background: linear-gradient(135deg, #1890ff, #096dd9);
	box-shadow: 0 10rpx 20rpx rgba(24, 144, 255, 0.2);
	border-radius: 50rpx;
	font-size: 32rpx;
	font-weight: bold;
	letter-spacing: 4rpx;
	transition: all 0.3s ease;
	color: white;
	padding: 0 80rpx;
	height: 90rpx;
	line-height: 90rpx;
}

.submit-btn:active {
	transform: translateY(4rpx);
	box-shadow: 0 4rpx 10rpx rgba(24, 144, 255, 0.2);
}

.submit-icon {
	margin-right: 12rpx;
	font-size: 32rpx;
}

/* 模态框样式 */
.modal-content {
	border-radius: 0 16rpx 16rpx 0;
	overflow: hidden;
}

.modal-header {
	padding: 30rpx 24rpx;
	border-bottom: 2rpx solid #f0f0f0;
}

.modal-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.category-item {
	transition: all 0.2s ease;
	border-radius: 8rpx;
	margin: 0 10rpx;
}

.category-item:active {
	background-color: #e6f7ff;
}

/* 封面标记图标样式 */
.cover-icon {
	position: absolute;
	top: 8rpx;
	right: 8rpx;
	padding: 8rpx;
	border-radius: 8rpx;
	font-size: 24rpx;
	z-index: 1;
}

.cover-text {
	margin-left: 8rpx;
	font-size: 22rpx;
}

/* 当图片既是封面又要删除时，调整位置 */
.bg-img .delete-icon {
	top: 8rpx;
	left: 8rpx;
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

	0%,
	100% {
		background-color: transparent;
	}

	50% {
		background-color: rgba(255, 73, 73, 0.2);
	}
}

.error-field {
	animation: flash 0.5s ease;
	border: 1rpx solid rgba(255, 73, 73, 0.5) !important;
}

.error-input {
	animation: flash 0.5s ease;
	background-color: rgba(255, 73, 73, 0.1);
}

/* AI浮窗按钮样式 */
.ai-float-button {
	position: fixed;
	right: 30rpx;
	bottom: 180rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 100rpx;
	height: 100rpx;
	background: linear-gradient(135deg, #3B7AEF, #2563eb);
	border-radius: 50%;
	box-shadow: 0 8rpx 20rpx rgba(37, 99, 235, 0.3);
	z-index: 100;
	padding: 10rpx;
}

.ai-btn-text {
	font-size: 20rpx;
	color: #ffffff;
	margin-top: 4rpx;
}

/* AI模态框样式 */
.ai-input-container {
	display: flex;
	margin-bottom: 30rpx;
}

.ai-input {
	flex: 1;
	border: 1px solid #ddd;
	border-radius: 8rpx;
	font-size: 28rpx;
	margin-right: 16rpx;
	height: 50rpx;
}

.ai-generate-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 0 30rpx;
	border-radius: 8rpx;
}

.ai-generate-btn uni-icons {
	margin-right: 8rpx;
}

.ai-result-container {
	background-color: #f8f9fa;
	border-radius: 12rpx;
	padding: 24rpx;
	margin-top: 20rpx;
}

.ai-result-title {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

.ai-label {
	font-weight: bold;
	margin-right: 10rpx;
	color: #555;
}

.ai-content {
	flex: 1;
	color: #333;
}

.ai-result-content {
	position: relative;
}

.ai-introduction {
	display: block;
	margin-top: 10rpx;
	font-size: 28rpx;
	line-height: 1.6;
	color: #333;
	background-color: white;
	padding: 16rpx;
	border-radius: 8rpx;
	border: 1px solid #eee;
}

.ai-use-btn {
	margin-left: 16rpx;
	padding: 0 20rpx;
	height: 56rpx;
	line-height: 56rpx;
}
</style>