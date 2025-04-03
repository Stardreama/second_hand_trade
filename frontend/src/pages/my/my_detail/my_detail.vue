<template>
  <view>
    <view class="cu-card dynamic">
      <view class="cu-item shadow">
        <view class="cu-list menu-avatar">
          <view class="cu-item">
            <view class="cu-avatar round lg" :style="'background-image:url(' + userInfo.avatar + ');'"></view>
            <view class="content flex-sub">
              <view>{{ userInfo.name }}</view>
              <view class="text-gray text-sm flex justify-between">
                {{ userInfo.desc }}
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 其他用户信息 -->
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        avatar: 'https://ossweb-img.qq.com/images/lol/web201310/skin/big10001.jpg',
        name: 'Amibition',
        desc: '我已天理为凭，踏入这片荒芜，不再受凡人的枷锁遏制。'
      }
    }
  }
}
</script>

<style>
.cu-card.dynamic {
  display: block;
}

.cu-card.dynamic>.cu-item {
  display: block;
  background-color: #fff;
  overflow: hidden;
}
</style>