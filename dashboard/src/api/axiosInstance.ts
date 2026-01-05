import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'https://fitg-backend.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    console.log("apis",token)
    // const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTUyMjBlMjFlMTA1NzllMzNhNjFjZDUiLCJpYXQiOjE3Njc1ODkyNjEsImV4cCI6MTc2ODE5NDA2MX0.pqNlNgWbnyzjsARk7HUJ1CyGXnJMxqz05g7FoRLoNwg'
    console.log('Attaching token to request:',); // Debugging line
    // console.log(localStorage.setItem('admin_token', token.data.token))
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log("config--->",config)
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
// axiosInstance.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       localStorage.removeItem('admin_token');
//       window.location.href = '/login';
//       toast.error('Session expired. Please login again.');
//     }
    
//     const message = error.response?.data?.message || 'Something went wrong';
//     toast.error(message);
//     return Promise.reject(error);
//   }
// );
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    console.log('AXIOS ERROR:', status, message);

    // ✅ Logout ONLY when token is actually expired
    if (status === 401 && message === 'Token expired') {
      localStorage.removeItem('admin_token');
      toast.error('Session expired. Please login again.');
      window.location.href = '/login';
    } else {
      // ❌ normal error, no logout
      toast.error(message || 'Something went wrong');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;