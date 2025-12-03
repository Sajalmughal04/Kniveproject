// Frontend/src/utils/axiosInterceptor.js
import axios from 'axios';

const API_URL = 'https://kniveproject-ewyu.vercel.app/api';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// ✅ Setup axios interceptor for automatic token refresh
export const setupAxiosInterceptors = (store) => {
    // Request interceptor - Add token to requests
    axios.interceptors.request.use(
        (config) => {
            const state = store.getState();
            const token = state.auth?.token || localStorage.getItem('token') || localStorage.getItem('adminToken');

            if (token && !config.headers.Authorization) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // Response interceptor - Handle token expiration
    axios.interceptors.response.use(
        (response) => {
            return response;
        },
        async (error) => {
            const originalRequest = error.config;

            // If error is not 401 or request already retried, reject
            if (error.response?.status !== 401 || originalRequest._retry) {
                return Promise.reject(error);
            }

            // Check if error is due to token expiration
            const errorMessage = error.response?.data?.message || '';
            if (!errorMessage.includes('expired') && !errorMessage.includes('Token expired')) {
                return Promise.reject(error);
            }

            // If already refreshing, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then(token => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return axios(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken') || localStorage.getItem('adminRefreshToken');

            if (!refreshToken) {
                console.log('❌ No refresh token available');
                isRefreshing = false;
                // Redirect to login
                window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                console.log('🔄 Attempting to refresh token...');

                const response = await axios.post(`${API_URL}/auth/refresh`, {
                    refreshToken: refreshToken
                });

                if (response.data.success) {
                    const { token: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

                    console.log('✅ Token refreshed successfully');

                    // Update tokens in storage
                    const state = store.getState();
                    const isAdmin = state.auth?.user?.role === 'admin';

                    if (isAdmin) {
                        localStorage.setItem('adminToken', newAccessToken);
                        localStorage.setItem('adminRefreshToken', newRefreshToken);
                    } else {
                        localStorage.setItem('token', newAccessToken);
                        localStorage.setItem('refreshToken', newRefreshToken);
                    }

                    // Update Redux store
                    store.dispatch({
                        type: 'auth/updateTokens',
                        payload: {
                            token: newAccessToken,
                            refreshToken: newRefreshToken
                        }
                    });

                    // Update axios default header
                    axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                    // Retry all queued requests
                    processQueue(null, newAccessToken);

                    // Retry original request
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                console.error('❌ Token refresh failed:', refreshError);
                processQueue(refreshError, null);

                // Clear tokens and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminRefreshToken');
                localStorage.removeItem('userData');
                localStorage.removeItem('adminData');

                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
    );
};

export default setupAxiosInterceptors;
