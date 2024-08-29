// apiClient.js
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000', 
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const navigate = useNavigate();

    if (error.response.status === 401 && error.response.data.detail === 'Token has expired') {
      try {
        const response = await axios.post('http://127.0.0.1:8000/token');
        if (response.status === 200) {
          const newToken = response.data.access_token;

          localStorage.setItem('accessToken', newToken);

          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        localStorage.removeItem('accessToken'); // Remove expired token
        navigate('/'); // Navigate back to the home page for re-authorization
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
