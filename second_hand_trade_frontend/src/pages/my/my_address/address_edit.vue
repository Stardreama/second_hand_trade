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
        <picker
          mode="region"
          @change="regionChange"
          :value="[
            addressForm.province,
            addressForm.city,
            addressForm.district,
          ]"
        >
          <view class="picker">
            {{ addressForm.province || "" }} {{ addressForm.city || "" }}
            {{ addressForm.district || "" }}
          </view>
        </picker>
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
    this.isEdit = options.type === "edit";
    if (this.isEdit) {
      // TODO: 获取要编辑的地址信息
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

    // 获取编辑地址详情
    getAddressDetail() {
      // TODO: 从服务器获取地址详情
      // 这里模拟数据
      this.addressForm = {
        name: "张三",
        phone: "13812345678",
        province: "广东省",
        city: "深圳市",
        district: "南山区",
        address: "科技园科技路123号",
        isDefault: false,
      };
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

      // TODO: 调用保存地址接口
      uni.showLoading({
        title: "保存中...",
      });

      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({
          title: "保存成功",
          success: () => {
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          },
        });
      }, 1000);
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
.picker {
  flex: 1;
  font-size: 28rpx;
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
