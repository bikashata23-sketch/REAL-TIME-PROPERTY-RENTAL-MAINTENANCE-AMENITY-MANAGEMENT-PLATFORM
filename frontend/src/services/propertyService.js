import api from './api';

export const getProperties = (params) => api.get('/properties', { params }).then((res) => res.data);
export const createProperty = (payload) => api.post('/properties', payload).then((res) => res.data);
export const updateProperty = (id, payload) => api.put(`/properties/${id}`, payload).then((res) => res.data);
export const deleteProperty = (id) => api.delete(`/properties/${id}`).then((res) => res.data);
