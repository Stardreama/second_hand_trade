import axios from 'axios';

const API_URL = '/api/messages';

export default {
  sendMessage(messageData) {
    return axios.post(API_URL, messageData);
  },
  getMessages(conversationId) {
    return axios.get(`${API_URL}?conversationId=${conversationId}`);
  }
};
