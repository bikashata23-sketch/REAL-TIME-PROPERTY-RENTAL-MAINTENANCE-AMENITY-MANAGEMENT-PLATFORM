import api from './api';

export const getMaintenanceRequests = (params) =>
  api.get('/maintenance', { params }).then((res) => res.data);
export const createMaintenanceRequest = (payload) =>
  api.post('/maintenance', payload).then((res) => res.data);
export const updateMaintenanceStatus = (id, status) =>
  api.patch(`/maintenance/${id}/status`, { status }).then((res) => res.data);
