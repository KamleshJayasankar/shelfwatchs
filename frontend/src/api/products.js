import api from './client';

export const getProducts = (params) => api.get('/products', { params });
export const getProductStats = () => api.get('/products/stats');
export const createProduct = (payload) => api.post('/products', payload);
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
