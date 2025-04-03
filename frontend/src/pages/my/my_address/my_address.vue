<template>
  <view class="container">
    <!-- 地址列表 -->
    <view class="address-list" v-if="addressList.length > 0">
      <view class="address-item" v-for="(item, index) in addressList" :key="item.address_id">
        <view class="address-info">
          <view class="user-info">
            <text class="name">{{ item.name }}</text>
            <text class="phone">{{ item.phone }}</text>
            <text class="default-tag" v-if="item.is_default">默认</text>
          </view>
          <view class="address-detail">{{ item.province }}{{ item.city }}{{ item.district }}{{ item.address }}</view>
        </view>
        <view class="operation">
          <view class="set-default" v-if="!item.is_default" @tap="setDefault(item.address_id)">设为默认</view>
          <view class="edit" @tap="editAddress(item)">编辑</view>
          <view class="delete" @tap="deleteAddress(item.address_id, index)">删除</view>
        </view>
      </view>
    </view>

    <!-- 空地址提示 -->
    <view class="empty-address" v-else>
      <text class="tips">暂无收货地址</text>
    </view>

    <!-- 底部添加按钮 -->
    <view class="add-btn">
      <button class="cu-btn block bg-blue lg" @tap="addNewAddress">添加新地址</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      addressList: []
    }
  },
  onShow() {
    // 每次显示页面时获取最新地址列表
    this.getAddressList();
  },
  methods: {
    // 获取地址列表
    getAddressList() {
      const userInfo = uni.getStorageSync('userInfo');
      const userId = userInfo ? userInfo.student_id : null;

      if (!userId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      uni.request({
        url: 'http://localhost:3000/api/address',
        method: 'GET',
        header: {
          'Authorization': `Bearer ${uni.getStorageSync('token')}`
        },
        data: {
          user_id: userId
        },
        success: (res) => {
          if (res.data.success) {
            this.addressList = res.data.data || [];
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
        }
      });
    },

    // 添加新地址
    addNewAddress() {
      uni.navigateTo({
        url: '/pages/my/my_address/address_edit'
      });
    },

    // 编辑地址
    editAddress(item) {
      // 将地址数据序列化后传递
      uni.navigateTo({
        url: `/pages/my/my_address/address_edit?id=${item.address_id}`
      });
    },

    // 删除地址
    deleteAddress(addressId, index) {
      // 获取用户ID
      const userInfo = uni.getStorageSync('userInfo');
      const userId = userInfo ? userInfo.student_id : null;

      if (!userId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      uni.showModal({
        title: '提示',
        content: '确定要删除该地址吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '删除中...'
            });

            uni.request({
              url: `http://localhost:3000/api/address/${addressId}`,
              method: 'DELETE',
              header: {
                'Authorization': `Bearer ${uni.getStorageSync('token')}`
              },
              data: {
                user_id: userId
              },
              success: (res) => {
                if (res.data.success) {
                  this.addressList.splice(index, 1);
                  uni.showToast({
                    title: '删除成功'
                  });
                } else {
                  uni.showToast({
                    title: res.data.message || '删除失败',
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
          }
        }
      });
    },

    // 设置默认地址
    setDefault(addressId) {
      // 获取用户ID
      const userInfo = uni.getStorageSync('userInfo');
      const userId = userInfo ? userInfo.student_id : null;

      if (!userId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        });
        return;
      }

      uni.showLoading({
        title: '设置中...'
      });

      uni.request({
        url: `http://localhost:3000/api/address/${addressId}/default`,
        method: 'PUT',
        header: {
          'Authorization': `Bearer ${uni.getStorageSync('token')}`
        },
        data: {
          user_id: userId
        },
        success: (res) => {
          if (res.data.success) {
            // 刷新地址列表
            this.getAddressList();
            uni.showToast({
              title: '设置成功'
            });
          } else {
            uni.showToast({
              title: res.data.message || '设置失败',
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
    }
  }
}
</script>

<style>
.container {
  padding: 20rpx;
  background: #f5f5f5;
  min-height: 100vh;
}

.address-item {
  background: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
}

.user-info {
  margin-bottom: 20rpx;
}

.name {
  margin-right: 20rpx;
  font-weight: bold;
}

.default-tag {
  background: #f56c6c;
  color: #fff;
  font-size: 22rpx;
  padding: 4rpx 10rpx;
  border-radius: 8rpx;
  margin-left: 10rpx;
}

.address-detail {
  color: #666;
  font-size: 28rpx;
}

.operation {
  display: flex;
  justify-content: flex-end;
  margin-top: 20rpx;
  font-size: 28rpx;
}

.edit,
.delete,
.set-default {
  padding: 10rpx 20rpx;
  color: #666;
}

.set-default {
  color: #409EFF;
}

.empty-address {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}

.add-btn {
  position: fixed;
  bottom: 40rpx;
  left: 20rpx;
  right: 20rpx;
}
</style>