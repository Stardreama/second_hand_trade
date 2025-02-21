import axios from 'axios';

const API_URL = '/api/orders';

export default {
  createOrder(orderData) {
    return axios.post(API_URL, orderData);
  },
  getOrders() {
    return axios.get(API_URL);
  },
  getOrder(id) {
    return axios.get(`${API_URL}/${id}`);
  }
};
