import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null,
    products: [],
    cart: [],
    orders: []
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    setProducts(state, products) {
      state.products = products;
    },
    addToCart(state, product) {
      state.cart.push(product);
    },
    setOrders(state, orders) {
      state.orders = orders;
    }
  },
  actions: {
    login({ commit }, user) {
      // 登录逻辑处理
      commit('setUser', user);
    },
    logout({ commit }) {
      commit('setUser', null);
    }
  },
  getters: {
    isAuthenticated: state => !!state.user,
    getProducts: state => state.products
  }
});
