import axios from 'axios';
import { toastService } from '../context/UIContext';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally via Toasts
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error (server down)
      error.isServerDown = true;
      toastService.show('Server connection lost. Please check your internet.', 'error');
    } else {
        // API error (4xx/5xx) - extract backend message
        const message = error.response.data?.message || 'Something went wrong';
        toastService.show(message, 'error');
    }
    return Promise.reject(error);
  }
);

export const checkServerHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch {
    return false;
  }
};

export const userService = {
  getSummary: () => api.get('/user/summary'),
  addSavedLocation: (locationData) => api.post('/user/saved-locations', locationData),
  removeSavedLocation: (addr) => api.delete('/user/saved-locations', { data: { addr } }),
  searchUsers: (query) => api.get(`/user/search?q=${query}`),
  myRides: () => api.get('/user/my-rides'),
};

export const rideService = {
    bookRide: (data) => api.post('/ride-request/book-ride', data),
    getRideDetails: (id) => api.get(`/ride-request/${id}`),
    cancelRide: (id, reason) => api.patch(`/ride-request/cancel/${id}`, { cancel_reason: reason }),
};

export const mapService = {
  search: (q) => api.get(`/maps/search?q=${q}`),
  reverse: (lat, lon) => api.get(`/maps/reverse?lat=${lat}&lon=${lon}`),
};

export default api;
