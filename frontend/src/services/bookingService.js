import api from './api';

export const getBookings = (params) => api.get('/bookings', { params }).then((res) => res.data);
export const createBooking = (payload) => api.post('/bookings', payload).then((res) => res.data);
export const cancelBooking = (id) => api.patch(`/bookings/${id}/cancel`).then((res) => res.data);
export const checkInBooking = (id) => api.patch(`/bookings/${id}/checkin`).then((res) => res.data);
export const checkOutBooking = (id) => api.patch(`/bookings/${id}/checkout`).then((res) => res.data);
