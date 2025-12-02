import axios from 'axios';

const API_BASE_URL = 'https://my-json-server.typicode.com/SalcedoJh/db.json/db';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth services
export const authService = {
    login: async (username, password) => {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
        if (response.data.success) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: async () => {
        await api.post('/auth/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
};

// Product services
export const productService = {
    getAll: () => api.get('/products'),
    getOne: (id) => api.get(`/products/${id}`),
    create: (product) => api.post('/products', product),
    update: (id, product) => api.put(`/products/${id}`, product),
    delete: (id) => api.delete(`/products/${id}`),
    assignCategory: (id, categoryId) => api.post(`/products/${id}/category`, { categoryId })
};

// Category services
export const categoryService = {
    getAll: () => api.get('/categories'),
    create: (category) => api.post('/categories', category),
    update: (id, category) => api.put(`/categories/${id}`, category),
    delete: (id) => api.delete(`/categories/${id}`)
};

// Sucursal services
export const sucursalService = {
    getAll: () => api.get('/sucursales')
};

// Order services
export const orderService = {
    getAll: () => api.get('/orders'),
    getOne: (id) => api.get(`/orders/${id}`),
    create: (order) => api.post('/orders', order),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { estado: status })
};

// Analytics services
export const analyticsService = {
    get: (month, year) => api.get('/analytics', { params: { month, year } })
};

// User services
export const userService = {
    getAll: () => api.get('/users'),
    getOne: (id) => api.get(`/users/${id}`),
    create: (user) => api.post('/users', user),
    update: (id, user) => api.put(`/users/${id}`, user),
    delete: (id) => api.delete(`/users/${id}`)
};

export default api;

