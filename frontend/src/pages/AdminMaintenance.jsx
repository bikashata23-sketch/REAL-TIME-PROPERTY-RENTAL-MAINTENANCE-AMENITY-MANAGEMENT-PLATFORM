import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getMaintenanceRequests, updateMaintenanceStatus } from '../services/maintenanceService';
import { SkeletonTable } from '../components/Skeletons';
import StatusBadge from '../components/StatusBadge';
import { useSocket } from '../context/SocketContext';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Completed'];

const AdminMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const socket = useSocket();

  const fetchRequests = async (status = '') => {
    setLoading(true);
    try {
      const res = await getMaintenanceRequests(status ? { status } : {});
      setRequests(res.data);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // Live-add newly submitted requests without requiring a page refresh
  useEffect(() => {
    if (!socket) return;
    const handler = (created) => {
      setRequests((prev) => (statusFilter && statusFilter !== created.status ? prev : [created, ...prev]));
    };
    socket.on('maintenance:created', handler);
    return () => socket.off('maintenance:created', handler);
  }, [socket, statusFilter]);

  const handleStatusChange = async (id, status) => {
    const previous = requests;
    setRequests((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    try {
      await updateMaintenanceStatus(id, status);
      toast.success('Status updated');
    } catch (err) {
      setRequests(previous);
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900">All Maintenance Requests</h1>
          <p className="text-sm text-ink-500 mt-1">Review and update the status of tenant requests.</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-ink-200 shadow-card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Tenant</th>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Issue</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading ? (
              <SkeletonTable rows={5} columns={5} />
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-400">
                  No requests found.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{r.tenant?.name}</td>
                  <td className="px-4 py-3 text-ink-600">{r.property?.title}</td>
                  <td className="px-4 py-3 text-ink-600 max-w-sm">{r.issue}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) => handleStatusChange(r._id, e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMaintenance;
