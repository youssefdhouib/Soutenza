import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9006/api',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('soutenza_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const extractApiError = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return 'Une erreur inattendue est survenue.';
};

export default client;
