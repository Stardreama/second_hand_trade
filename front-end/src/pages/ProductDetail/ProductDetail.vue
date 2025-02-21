<template>
    <div class="product-detail">
      <h2>商品详情</h2>
      <div v-if="product">
        <img :src="product.image" alt="商品图片" />
        <h3>{{ product.description }}</h3>
        <p>价格: ￥{{ product.price }}</p>
      </div>
      <div v-else>
        <p>加载中...</p>
      </div>
    </div>
  </template>
  
  <script>
  import productService from '../../services/productService';
  
  export default {
    name: 'ProductDetail',
    data() {
      return {
        product: null
      };
    },
    created() {
      const id = this.$route.params.id;
      productService.getProduct(id)
        .then(response => {
          this.product = response.data;
        })
        .catch(error => {
          console.error('加载商品详情失败', error);
        });
    }
  };
  </script>
  
  <style scoped>
  /* 根据需要添加样式 */
  </style>
  