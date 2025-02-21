import axios from 'axios';

const API_URL = '/api';

export default {
  register(data) {
    return axios.post(`${API_URL}/register`, data);
  },
  login(credentials) {
    return axios.post(`${API_URL}/login`, credentials);
  }
};
