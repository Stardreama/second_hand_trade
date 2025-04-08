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
          <!-- #ifdef MP-WEIXIN -->
          <!-- 小程序端使用原生picker -->
          <picker
            mode="region"
            fields="region"
            @change="regionChange"
            :value="[
              addressForm.province,
              addressForm.city,
              addressForm.district,
            ]"
          >
            <view
              class="picker-content"
              :class="{ 'has-value': addressForm.province }"
            >
              <text class="picker-text" v-if="!addressForm.province"
                >请选择省/市/区</text
              >
              <text class="picker-text" v-else>
                {{ addressForm.province }} {{ addressForm.city }}
                {{ addressForm.district }}
              </text>
              <text class="cuIcon-right picker-arrow"></text>
            </view>
          </picker>
          <!-- #endif -->

          <!-- #ifdef H5 -->
          <!-- H5端使用自定义选择器 -->
          <view
            class="picker-content"
            :class="{ 'has-value': addressForm.province }"
            @click="showRegionPicker"
          >
            <text class="picker-text" v-if="!addressForm.province"
              >请选择省/市/区</text
            >
            <text class="picker-text" v-else>
              {{ addressForm.province }} {{ addressForm.city }}
              {{ addressForm.district }}
            </text>
            <text class="cuIcon-right picker-arrow"></text>
          </view>

          <!-- H5省市区选择弹窗 -->
          <view class="region-popup" v-if="regionPickerVisible">
            <view class="region-popup-mask" @click="hideRegionPicker"></view>
            <view class="region-popup-content">
              <view class="region-popup-header">
                <text class="cancel" @click="hideRegionPicker">取消</text>
                <text class="title">选择地区</text>
                <text class="confirm" @click="confirmRegionPicker">确定</text>
              </view>
              <view class="region-tabs">
                <text
                  class="tab"
                  :class="{ active: regionTabIndex === 0 }"
                  @click="switchTab(0)"
                  >{{ tempRegion.province || "请选择" }}</text
                >
                <text
                  class="tab"
                  :class="{ active: regionTabIndex === 1 }"
                  v-if="tempRegion.province"
                  @click="switchTab(1)"
                  >{{ tempRegion.city || "请选择" }}</text
                >
                <text
                  class="tab"
                  :class="{ active: regionTabIndex === 2 }"
                  v-if="tempRegion.city"
                  @click="switchTab(2)"
                  >{{ tempRegion.district || "请选择" }}</text
                >
              </view>
              <scroll-view class="region-list" scroll-y>
                <view
                  class="region-item"
                  v-for="(item, index) in currentRegionList"
                  :key="index"
                  @click="selectRegionItem(item)"
                >
                  <text :class="{ selected: isSelectedRegion(item) }">{{
                    item
                  }}</text>
                </view>
              </scroll-view>
            </view>
          </view>
          <!-- #endif -->
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
import cityData from "@/common/city.json";

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
      regionPickerVisible: false,
      regionTabIndex: 0,
      provinces: Object.keys(cityData),
      cities: [],
      districts: [],
      tempRegion: {
        province: "",
        city: "",
        district: "",
      },
      currentRegionList: [],
    };
  },
  created() {
    // 初始化省份列表
    this.currentRegionList = this.provinces;
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
        title: "加载中...",
      });
      // 获取用户ID
      const userInfo = uni.getStorageSync("userInfo");
      const userId = userInfo ? userInfo.student_id : null;

      // 如果没有用户ID，显示提示并返回
      if (!userId) {
        uni.hideLoading();
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        return;
      }

      uni.request({
        url: `http://localhost:3000/api/address/${this.addressId}`,
        method: "GET",
        header: {
          Authorization: `Bearer ${uni.getStorageSync("token")}`,
        },
        data: {
          // 添加user_id参数
          user_id: userId,
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
              isDefault: address.is_default === 1,
            };
          } else {
            uni.showToast({
              title: res.data.message || "获取地址失败",
              icon: "none",
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: "网络错误，请重试",
            icon: "none",
          });
        },
        complete: () => {
          uni.hideLoading();
        },
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
        : "http://localhost:3000/api/address";

      const method = this.isEdit ? "PUT" : "POST";
      // 获取用户ID
      const userInfo = uni.getStorageSync("userInfo");
      const userId = userInfo ? userInfo.student_id : null;

      // 如果没有用户ID，显示提示
      if (!userId) {
        uni.hideLoading();
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        return;
      }
      // 删除对未定义变量userId的引用
      uni.request({
        url: url,
        method: method,
        header: {
          Authorization: `Bearer ${uni.getStorageSync("token")}`,
          "Content-Type": "application/json",
        },
        data: {
          user_id: userId,
          name: this.addressForm.name,
          phone: this.addressForm.phone,
          province: this.addressForm.province,
          city: this.addressForm.city,
          district: this.addressForm.district,
          address: this.addressForm.address,
          is_default: this.addressForm.isDefault,
        },
        success: (res) => {
          if (res.data.success) {
            uni.showToast({
              title: "保存成功",
              success: () => {
                setTimeout(() => {
                  uni.navigateBack();
                }, 1500);
              },
            });
          } else {
            uni.showToast({
              title: res.data.message || "保存失败",
              icon: "none",
            });
          }
        },
        fail: (err) => {
          console.error("请求失败:", err);
          uni.showToast({
            title: "网络错误，请重试",
            icon: "none",
          });
        },
        complete: () => {
          uni.hideLoading();
        },
      });
    },

    // H5端显示地区选择器
    showRegionPicker() {
      // #ifdef H5
      this.tempRegion = {
        province: this.addressForm.province,
        city: this.addressForm.city,
        district: this.addressForm.district,
      };

      if (this.tempRegion.province) {
        this.cities = this.getCities(this.tempRegion.province);
        if (this.tempRegion.city) {
          this.districts = this.getDistricts(
            this.tempRegion.province,
            this.tempRegion.city
          );
        }
      }

      this.regionPickerVisible = true;
      this.switchTab(
        this.tempRegion.province ? (this.tempRegion.city ? 2 : 1) : 0
      );
      // #endif
    },

    // H5端隐藏地区选择器
    hideRegionPicker() {
      this.regionPickerVisible = false;
    },

    // H5端确认地区选择
    confirmRegionPicker() {
      if (
        this.tempRegion.province &&
        this.tempRegion.city &&
        this.tempRegion.district
      ) {
        this.addressForm.province = this.tempRegion.province;
        this.addressForm.city = this.tempRegion.city;
        this.addressForm.district = this.tempRegion.district;
        this.hideRegionPicker();
      } else {
        uni.showToast({
          title: "请选择完整的地区信息",
          icon: "none",
        });
      }
    },

    // H5端切换选择卡
    switchTab(index) {
      this.regionTabIndex = index;

      if (index === 0) {
        this.currentRegionList = this.provinces;
      } else if (index === 1) {
        this.currentRegionList = this.getCities(this.tempRegion.province);
      } else if (index === 2) {
        this.currentRegionList = this.getDistricts(
          this.tempRegion.province,
          this.tempRegion.city
        );
      }
    },

    // H5端选择地区项
    selectRegionItem(item) {
      if (this.regionTabIndex === 0) {
        // 选择省份
        this.tempRegion.province = item;
        this.tempRegion.city = "";
        this.tempRegion.district = "";
        this.cities = this.getCities(item);
        this.switchTab(1);
      } else if (this.regionTabIndex === 1) {
        // 选择城市
        this.tempRegion.city = item;
        this.tempRegion.district = "";
        this.districts = this.getDistricts(this.tempRegion.province, item);
        this.switchTab(2);
      } else {
        // 选择区县
        this.tempRegion.district = item;
      }
    },

    // H5端判断地区是否被选中
    isSelectedRegion(item) {
      if (this.regionTabIndex === 0) {
        return item === this.tempRegion.province;
      } else if (this.regionTabIndex === 1) {
        return item === this.tempRegion.city;
      } else {
        return item === this.tempRegion.district;
      }
    },

    // 获取城市列表
    getCities(province) {
      if (!province || !cityData[province]) return [];
      return Object.keys(cityData[province]);
    },

    // 获取区县列表
    getDistricts(province, city) {
      if (
        !province ||
        !city ||
        !cityData[province] ||
        !cityData[province][city]
      )
        return [];
      return cityData[province][city];
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
/* 地址选择 */
.region-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.region-popup-mask {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

/* 确保弹出内容区域有足够的高度 */
.region-popup-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  height: 60vh;
  border-radius: 20rpx 20rpx 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.region-popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #eee;
}

.region-popup-header .cancel {
  color: #666;
  font-size: 28rpx;
}

.region-popup-header .title {
  color: #333;
  font-size: 32rpx;
  font-weight: bold;
}

.region-popup-header .confirm {
  color: #0081ff;
  font-size: 28rpx;
}

.region-tabs {
  display: flex;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #eee;
}

.region-tabs .tab {
  margin-right: 30rpx;
  font-size: 28rpx;
  color: #666;
  padding: 10rpx 0;
  position: relative;
  max-width: 180rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.region-tabs .tab.active {
  color: #0081ff;
}

.region-tabs .tab.active:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rpx;
  background-color: #0081ff;
}

.region-list {
  flex: 1;
  padding: 0 30rpx;
  height: calc(60vh - 120rpx); /* 减去头部和标签栏的高度 */
  overflow-y: auto; /* 确保内容溢出时可以滚动 */
}

.region-item {
  padding: 25rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
  font-size: 28rpx;
}

.region-item .selected {
  color: #0081ff;
}

.picker-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 80rpx;
  color: #999;
}

.picker-content.has-value {
  color: #333;
}

.picker-arrow {
  margin-left: 10rpx;
  font-size: 24rpx;
}
</style>
