import api from './api';

export const getTenantDashboard = () => api.get('/dashboard/tenant').then((res) => res.data);
export const getAdminDashboard = () => api.get('/dashboard/admin').then((res) => res.data);
export const getOwnerDashboard = () => api.get('/dashboard/owner').then((res) => res.data);
