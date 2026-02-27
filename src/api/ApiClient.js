import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/trackingsystem/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});


// We define a variable to hold the notification function 
// This will be "injected" by the provider later
let showNotificationRef;
let userContextTokenRef;

export const injectNotification = (fn) => {
    showNotificationRef = fn;
};

export const injectUserToken = (token) => {
  userContextTokenRef = token;
};

apiClient.interceptors.request.use((config) => {
    const token = userContextTokenRef;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const errorData = error.response?.data;
        
        // Always extract the message from our ErrorDTO structure
        const message = errorData?.error || "A system error occurred";
        const detail = errorData?.detail ? `: ${errorData.detail}` : "";

        // Use your existing NotificationContext to show the error
        console.error(`[API ERROR]: ${message} ${detail}`);
        
        return Promise.reject(error);
    }
);

export default apiClient;
