<template>
    <div class="order">
      <h2>订单列表</h2>
      <ul>
        <li v-for="order in orders" :key="order.order_id">
          订单号: {{ order.order_id }}, 状态: {{ order.status }}
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import orderService from '../../services/orderService';
  
  export default {
    name: 'Order',
    data() {
      return {
        orders: []
      };
    },
    created() {
      orderService.getOrders()
        .then(response => {
          this.orders = response.data;
        })
        .catch(error => {
          console.error('获取订单失败', error);
        });
    }
  };
  </script>
  
  <style scoped>
  /* 根据需要添加样式 */
  </style>
  