<template>
    <div class="product-item">
      <img :src="product.image" alt="产品图片" />
      <h3>{{ product.description }}</h3>
      <p>价格: ￥{{ product.price }}</p>
      <router-link :to="`/product/${product.product_id}`">查看详情</router-link>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProductItem',
    props: {
      product: {
        type: Object,
        required: true
      }
    }
  };
  </script>
  
  <style scoped>
  .product-item {
    border: 1px solid #ddd;
    padding: 10px;
    margin: 10px;
    width: 220px;
  }
  .product-item img {
    max-width: 100%;
    height: auto;
  }
  </style>
  