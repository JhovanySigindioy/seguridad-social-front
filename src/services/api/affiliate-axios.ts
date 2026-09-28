import axios from 'axios';
import { useAffiliateAuthStore } from '../../store/useAffiliateAuthStore';

const affiliateApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://seguridad-social-api.impulsaepos.com/api',
});

affiliateApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('affiliate_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

affiliateApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAffiliateAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export default affiliateApi;
