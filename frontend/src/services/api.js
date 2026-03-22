// =====================================================
// API SERVICE
// Centralized API configuration and helper functions
// =====================================================

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor - add auth token
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

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =====================================================
// AUTH API
// =====================================================

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/password', data)
};

// =====================================================
// ROOMS API
// =====================================================

export const roomsAPI = {
  // Get all room types
  getRoomTypes: () => api.get('/rooms/types'),
  
  // Check availability
  checkAvailability: (params) => api.get('/rooms/available', { params }),
  
  // Get pricing for specific dates
  getPricing: (roomTypeId, params) => api.get(`/rooms/${roomTypeId}/pricing`, { params }),
  
  // Admin endpoints
  createRoomType: (data) => api.post('/rooms/types', data),
  updateRoomType: (id, data) => api.put(`/rooms/types/${id}`, data),
  addRoom: (data) => api.post('/rooms', data),
  updateRoomStatus: (id, status) => api.put(`/rooms/${id}/status`, { status }),
  getInventory: () => api.get('/rooms/inventory')
};

// =====================================================
// BOOKINGS API
// =====================================================

export const bookingsAPI = {
  // Create booking
  create: (data) => api.post('/bookings', data),
  
  // Get user's bookings
  getMyBookings: (params) => api.get('/bookings', { params }),
  
  // Get single booking
  getById: (id) => api.get(`/bookings/${id}`),
  
  // Cancel booking
  cancel: (id, reason) => api.put(`/bookings/${id}/cancel`, { reason }),
  
  // Check in (staff)
  checkIn: (id, roomId) => api.put(`/bookings/${id}/check-in`, { roomId }),
  
  // Check out (staff)
  checkOut: (id) => api.put(`/bookings/${id}/check-out`)
};

// =====================================================
// FOOD & BEVERAGE API
// =====================================================

export const foodAPI = {
  getMenu: (category) => api.get('/food/menu', { params: { category } }),
  getCategories: () => api.get('/food/categories'),
  createOrder: (data) => api.post('/food/orders', data),
  getMyOrders: (params) => api.get('/food/orders', { params }),
  getOrderById: (id) => api.get(`/food/orders/${id}`),
  updateOrderStatus: (id, status) => api.put(`/food/orders/${id}/status`, { status })
};

// =====================================================
// EVENTS API
// =====================================================

export const eventsAPI = {
  getSpaces: () => api.get('/events/spaces'),
  getSpaceById: (id) => api.get(`/events/spaces/${id}`),
  checkAvailability: (params) => api.get('/events/availability', { params }),
  createBooking: (data) => api.post('/events', data),
  getMyBookings: () => api.get('/events'),
  updateStatus: (id, data) => api.put(`/events/${id}/status`, data)
};

// =====================================================
// ADMIN API
// =====================================================

export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getRevenueAnalytics: (period) => api.get('/admin/analytics/revenue', { params: { period } }),
  getOccupancyAnalytics: () => api.get('/admin/analytics/occupancy'),
  getAllBookings: (params) => api.get('/admin/bookings', { params }),
  confirmBooking: (id) => api.put(`/admin/bookings/${id}/confirm`),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/toggle-status`)
};

export default api;
