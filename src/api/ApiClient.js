import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/learningsystem/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;

// Request Interceptor to inject the JWT Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Retrieve your Okta/SSO token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response Interceptor to handle global 401s (Token Expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logic to redirect to login or refresh token
      console.error("Session expired. Redirecting...");
    }
    return Promise.reject(error);
  }
);

