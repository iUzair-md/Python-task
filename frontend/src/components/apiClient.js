// apiClient.js
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Replace with your backend API base URL
});

// Axios request interceptor to add the access token to headers
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

// Axios response interceptor to handle token expiration and refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const navigate = useNavigate();

    if (error.response.status === 401 && error.response.data.detail === 'Token has expired') {
      try {
        // Request a new token
        const response = await axios.post('http://127.0.0.1:8000/token');
        if (response.status === 200) {
          const newToken = response.data.access_token;

          // Save the new token to localStorage
          localStorage.setItem('accessToken', newToken);

          // Update the Authorization header with the new token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

          // Retry the original request with the new token
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
