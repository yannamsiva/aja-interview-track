import axios from 'axios';

// Create axios instance with default config
const baseURL ="/api";
//const baseURL = 'http://localhost:8080';
const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Token expired or invalid
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('userRole');
          localStorage.removeItem('employeeId');
          window.location.href = '/login';
          break;
        case 403:
          // Insufficient permissions
          console.error('Authorization failed: Insufficient permissions');
          break;
        case 429:
          // Rate limiting
          console.error('Rate limit exceeded');
          break;
        case 500:
          // Server error
          console.error('Server error:', error.response.data);
          break;
        default:
          console.error('API Error:', error.response.data);
      }
    } else if (error.request) {
      // Network error
      console.error('Network error: No response received');
    } else {
      // Request setup error
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance; 

