<template>
    <view class="container">
      <!-- 地址列表 -->
      <view class="address-list" v-if="addressList.length > 0">
        <view class="address-item" v-for="(item, index) in addressList" :key="index">
          <view class="address-info">
            <view class="user-info">
              <text class="name">{{item.name}}</text>
              <text class="phone">{{item.phone}}</text>
            </view>
            <view class="address-detail">{{item.province}}{{item.city}}{{item.address}}</view>
          </view>
          <view class="operation">
            <view class="edit" @tap="editAddress(item)">编辑</view>
            <view class="delete" @tap="deleteAddress(index)">删除</view>
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
        addressList: [
          {
            name: '张三',
            phone: '13812345678',
            province: '广东省',
            city: '深圳市',
            address: '南山区科技园科技路123号'
          }
        ]
      }
    },
    methods: {
      addNewAddress() {
        uni.navigateTo({
          url: '/pages/my/my_address/address_edit'
        })
      },
      editAddress(item) {
        uni.navigateTo({
          url: '/pages/my/my_address/address_edit?type=edit'
        })
      },
      deleteAddress(index) {
        uni.showModal({
          title: '提示',
          content: '确定要删除该地址吗？',
          success: (res) => {
            if(res.confirm) {
              this.addressList.splice(index, 1)
            }
          }
        })
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
  .edit, .delete {
    padding: 10rpx 20rpx;
    color: #666;
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