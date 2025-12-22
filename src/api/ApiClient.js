import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/learningsystem/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});


// We define a variable to hold the notification function 
// This will be "injected" by the provider later
let showNotificationRef;

export const injectNotification = (fn) => {
    showNotificationRef = fn;
};

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const message = error.response?.data || error.message;

        if (showNotificationRef) {
            if (status === 401) {
                showNotificationRef("Session expired. Please log in again.", "error");
                // Optional: Redirect to login
                // window.location.href = '/login';
            } else if (status === 403) {
                showNotificationRef("Access Denied: You do not have permission for this action.", "error");
            } else if (status >= 500) {
                showNotificationRef("Server Error: The Command Center is currently unreachable.", "error");
            } else if (!status) {
                showNotificationRef("Network Error: Check your connection to the EWU network.", "error");
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;
