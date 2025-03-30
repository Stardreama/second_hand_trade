<template>
  <view class="container">
    <view class="form-group">
      <!-- 联系人 -->
      <view class="form-item">
        <text class="label">联系人</text>
        <input
          class="input"
          v-model="addressForm.name"
          placeholder="收货人姓名"
        />
      </view>

      <!-- 手机号码 -->
      <view class="form-item">
        <text class="label">手机号码</text>
        <input
          class="input"
          type="number"
          v-model="addressForm.phone"
          placeholder="请输入手机号"
        />
      </view>

     <!-- 所在地区 -->
<view class="form-item">
  <text class="label">所在地区</text>
  <view class="region-picker">
    <picker
  mode="region"
  fields="region"
  @change="regionChange"
  :value="[ addressForm.province, addressForm.city, addressForm.district ]"
>
  <view class="picker-content" :class="{'has-value': addressForm.province}">
    <text class="picker-text" v-if="!addressForm.province">请选择省/市/区</text>
    <text class="picker-text" v-else>
      {{ addressForm.province }} {{ addressForm.city }} {{ addressForm.district }}
    </text>
    <text class="cuIcon-right picker-arrow"></text>
  </view>
</picker>

  </view>
</view>

      <!-- 详细地址 -->
      <view class="form-item">
        <text class="label">详细地址</text>
        <textarea
          class="textarea"
          v-model="addressForm.address"
          placeholder="街道、楼牌号等"
        />
      </view>

      <!-- 设为默认地址 -->
      <view class="form-item switch-item">
        <text class="label">设为默认地址</text>
        <switch
          :checked="addressForm.isDefault"
          @change="switchChange"
          color="#0081ff"
        />
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="btn-save">
      <button class="cu-btn block bg-blue lg" @tap="saveAddress">保存</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isEdit: false,
      pickerVisible: false, 
      addressForm: {
        name: "",
        phone: "",
        province: "",
        city: "",
        district: "",
        address: "",
        isDefault: false,
      },
    };
  },
  onLoad(options) {
    // 判断是否为编辑模式
    if (options.id) {
      this.addressId = options.id;
      this.isEdit = true;
      this.getAddressDetail();
    }
  },
  methods: {
    // 地区选择器改变
    regionChange(e) {
      const [province, city, district] = e.detail.value;
      this.addressForm.province = province;
      this.addressForm.city = city;
      this.addressForm.district = district;
    },

    // 默认地址开关
    switchChange(e) {
      this.addressForm.isDefault = e.detail.value;
    },

    getAddressDetail() {
      uni.showLoading({
        title: '加载中...'
      });
      // 获取用户ID
  const userInfo = uni.getStorageSync('userInfo');
  const userId = userInfo ? userInfo.student_id : null;
  
  // 如果没有用户ID，显示提示并返回
  if (!userId) {
    uni.hideLoading();
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    return;
  }
  
      uni.request({
        url: `http://localhost:3000/api/address/${this.addressId}`,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${uni.getStorageSync('token')}`
        },
        data: {  // 添加user_id参数
      user_id: userId
    },
        success: (res) => {
          if (res.data.success) {
            const address = res.data.data;
            this.addressForm = {
              name: address.name,
              phone: address.phone,
              province: address.province,
              city: address.city,
              district: address.district,
              address: address.address,
              isDefault: address.is_default === 1
            };
          } else {
            uni.showToast({
              title: res.data.message || '获取地址失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: '网络错误，请重试',
            icon: 'none'
          });
        },
        complete: () => {
          uni.hideLoading();
        }
      });
    },

    // 表单验证
    validate() {
      if (!this.addressForm.name) {
        uni.showToast({
          title: "请输入联系人",
          icon: "none",
        });
        return false;
      }
      if (!/^1[3-9]\d{9}$/.test(this.addressForm.phone)) {
        uni.showToast({
          title: "请输入正确的手机号",
          icon: "none",
        });
        return false;
      }
      if (!this.addressForm.province || !this.addressForm.city) {
        uni.showToast({
          title: "请选择所在地区",
          icon: "none",
        });
        return false;
      }
      if (!this.addressForm.address) {
        uni.showToast({
          title: "请输入详细地址",
          icon: "none",
        });
        return false;
      }
      return true;
    },

// 保存地址
saveAddress() {
  if (!this.validate()) return;

  uni.showLoading({
    title: "保存中...",
  });

  const url = this.isEdit 
    ? `http://localhost:3000/api/address/${this.addressId}`
    : 'http://localhost:3000/api/address';
  
  const method = this.isEdit ? 'PUT' : 'POST';
  // 获取用户ID
  const userInfo = uni.getStorageSync('userInfo');
  const userId = userInfo ? userInfo.student_id : null;
   
  // 如果没有用户ID，显示提示
  if (!userId) {
    uni.hideLoading();
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    return;
  }
  // 删除对未定义变量userId的引用
  uni.request({
    url: url,
    method: method,
    header: {
      'Authorization': `Bearer ${uni.getStorageSync('token')}`,
      'Content-Type': 'application/json'
    },
    data: {
      user_id: userId,
      name: this.addressForm.name,
      phone: this.addressForm.phone,
      province: this.addressForm.province,
      city: this.addressForm.city,
      district: this.addressForm.district,
      address: this.addressForm.address,
      is_default: this.addressForm.isDefault
    },
    success: (res) => {
      if (res.data.success) {
        uni.showToast({
          title: '保存成功',
          success: () => {
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          }
        });
      } else {
        uni.showToast({
          title: res.data.message || '保存失败',
          icon: 'none'
        });
      }
    },
    fail: (err) => {
      console.error('请求失败:', err);
      uni.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      });
    },
    complete: () => {
      uni.hideLoading();
    }
  });
},
  },
};
</script>

<style>
.container {
  padding: 20rpx;
  background: #f5f5f5;
  min-height: 100vh;
}
.form-group {
  background: #fff;
  border-radius: 12rpx;
  padding: 0 30rpx;
}
.form-item {
  display: flex;
  align-items: center;
  min-height: 100rpx;
  border-bottom: 1rpx solid #eee;
}
.form-item:last-child {
  border-bottom: none;
}
.label {
  width: 180rpx;
  font-size: 28rpx;
  color: #333;
}
.input {
  flex: 1;
  font-size: 28rpx;
}
.textarea {
  flex: 1;
  height: 160rpx;
  font-size: 28rpx;
  padding: 20rpx 0;
}
.picker-container {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  padding: 12rpx 20rpx;
  border-radius: 8rpx;
}

.picker {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.picker text {
  color: #666;
}

.picker-arrow {
  margin-left: 10rpx;
}
.switch-item {
  justify-content: space-between;
}
.btn-save {
  position: fixed;
  bottom: 40rpx;
  left: 20rpx;
  right: 20rpx;
}
</style>
