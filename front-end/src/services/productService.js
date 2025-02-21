import axios from 'axios';

const API_URL = '/api/products';

export default {
  getProducts() {
    return axios.get(API_URL);
  },
  getProduct(id) {
    return axios.get(`${API_URL}/${id}`);
  },
  searchProducts(keyword) {
    return axios.get(`${API_URL}/search`, { params: { keyword } });
  },
  createProduct(productData) {
    return axios.post(API_URL, productData);
  },
  updateProduct(id, productData) {
    return axios.put(`${API_URL}/${id}`, productData);
  },
  deleteProduct(id) {
    return axios.delete(`${API_URL}/${id}`);
  }
};
