import axios from 'axios';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from '../utils/token';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config);
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  async (error) => {
    console.error('API Response Error:', error);
    const originalRequest = error.config;

    // If the error is 401 and not already handled, try to refresh the token
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('Token expired, attempting refresh');
      originalRequest._retry = true;

      const refreshToken = getRefreshToken();
      if (refreshToken) {
        try {
          // Try to refresh the access token
          const refreshResponse = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/refresh`,
            { refreshToken }
          );

          if (refreshResponse.data.success) {
            const { accessToken } = refreshResponse.data.data;
            saveTokens(accessToken, refreshToken);

            // Update the authorization header with the new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Retry the original request
            return api(originalRequest);
          } else {
            // If refresh failed, clear tokens and redirect to login
            console.log('Token refresh failed, clearing tokens and redirecting to login');
            clearTokens();
            window.location.href = '/login';
          }
        } catch (refreshError) {
          console.error('Token refresh error:', refreshError);
          // If refresh failed, clear tokens and redirect to login
          clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token, redirect to login
        console.log('No refresh token, clearing tokens and redirecting to login');
        clearTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;