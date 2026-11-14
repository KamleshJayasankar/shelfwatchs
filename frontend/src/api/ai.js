import api from './client';

export const scanProductImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/ai/scan', formData, { timeout: 60000 });
};

export const getInsights = () => api.get('/ai/insights', { timeout: 60000 });
