import api from './api';

export const getAmenities = () => api.get('/amenities').then((res) => res.data);
export const createAmenity = (payload) => api.post('/amenities', payload).then((res) => res.data);
export const updateAmenity = (id, payload) => api.put(`/amenities/${id}`, payload).then((res) => res.data);
export const deleteAmenity = (id) => api.delete(`/amenities/${id}`).then((res) => res.data);
