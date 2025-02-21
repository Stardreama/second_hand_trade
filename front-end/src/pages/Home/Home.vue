<template>
  <div class="home">
    <h2>最新商品</h2>
    <div class="products">
      <ProductItem
        v-for="product in products"
        :key="product.product_id"
        :product="product"
      />
    </div>
  </div>
</template>

<script>
import ProductItem from '../../components/ProductItem/ProductItem.vue';
import productService from '../../services/productService';

export default {
  name: 'Home',
  components: {
    ProductItem
  },
  data() {
    return {
      products: []
    };
  },
  created() {
    productService.getProducts()
      .then(response => {
        this.products = response.data;
      })
      .catch(error => {
        console.error('加载商品出错', error);
      });
  }
};
</script>

<style scoped>
.products {
  display: flex;
  flex-wrap: wrap;
}
</style>
