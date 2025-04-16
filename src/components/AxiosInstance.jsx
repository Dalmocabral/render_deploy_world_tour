// src/component/AxiosInstance.jsx
import axios from 'axios';

const isDevelopment = import.meta.env.MODE === 'development';

const baseURL = isDevelopment
  ? import.meta.env.VITE_API_BASE_URL_LOCAL
  : import.meta.env.VITE_API_BASE_URL_DEPLOY;

const AxiosInstance = axios.create({ baseURL });

// Adiciona o token ao cabeçalho de todas as requisições, exceto para /register/
AxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && !config.url.includes('/register/')) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default AxiosInstance;
