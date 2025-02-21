import Vue from 'vue';
import Router from 'vue-router';
import Home from '../pages/Home/Home.vue';
import Login from '../pages/Login/Login.vue';
import Register from '../pages/Register/Register.vue';
import ProductDetail from '../pages/ProductDetail/ProductDetail.vue';
import Chat from '../pages/Chat/Chat.vue';
import Order from '../pages/Order/Order.vue';

Vue.use(Router);

export default new Router({
  mode: 'history',
  routes: [
    { path: '/', name: 'Home', component: Home },
    { path: '/login', name: 'Login', component: Login },
    { path: '/register', name: 'Register', component: Register },
    { path: '/product/:id', name: 'ProductDetail', component: ProductDetail, props: true },
    { path: '/chat', name: 'Chat', component: Chat },
    { path: '/order', name: 'Order', component: Order }
  ]
});
