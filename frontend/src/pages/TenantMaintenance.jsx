import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus } from 'lucide-react';
import { getMaintenanceRequests, createMaintenanceRequest } from '../services/maintenanceService';
import { getProperties } from '../services/propertyService';
import { SkeletonTable } from '../components/Skeletons';
import StatusBadge from '../components/StatusBadge';
import { useSocket } from '../context/SocketContext';

const TenantMaintenance = () => {
  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const socket = useSocket();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getMaintenanceRequests();
      setRequests(res.data);
    } catch {
      toast.error('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    getProperties({ limit: 100 }).then((res) => setProperties(res.data));
  }, []);

  // Live-update the table the moment an admin changes a status
  useEffect(() => {
    if (!socket) return;
    const handler = (updated) => {
      setRequests((prev) => prev.map((r) => (r._id === updated._id ? updated : r)));
    };
    socket.on('maintenance:updated', handler);
    return () => socket.off('maintenance:updated', handler);
  }, [socket]);

  const onSubmit = async (values) => {
    try {
      const res = await createMaintenanceRequest(values);
      setRequests((prev) => [res.data, ...prev]);
      toast.success('Request submitted');
      setShowForm(false);
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit request');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900">Maintenance Requests</h1>
          <p className="text-sm text-ink-500 mt-1">Submit and track the status of your requests.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <Plus size={16} /> New Request
        </button>
      </div>

      <div className="bg-white rounded-xl border border-ink-200 shadow-card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Issue</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Submitted</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading ? (
              <SkeletonTable rows={4} columns={4} />
            ) : requests.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-400">
                  No maintenance requests yet.
                </td>
              </tr>
            ) : (
              requests.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{r.property?.title}</td>
                  <td className="px-4 py-3 text-ink-600 max-w-sm">{r.issue}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3 text-ink-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-display font-semibold text-lg text-ink-900">New Maintenance Request</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-ink-700">Property</label>
                <select
                  {...register('property', { required: 'Please select a property' })}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Select a property</option>
                  {properties.map((p) => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
                {errors.property && <p className="text-xs text-red-600 mt-1">{errors.property.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700">Issue description</label>
                <textarea
                  {...register('issue', { required: 'Please describe the issue' })}
                  rows={4}
                  placeholder="e.g. Leaking kitchen faucet"
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {errors.issue && <p className="text-xs text-red-600 mt-1">{errors.issue.message}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-ink-600 hover:bg-ink-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-700 hover:bg-brand-800 text-white disabled:opacity-60"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantMaintenance;
