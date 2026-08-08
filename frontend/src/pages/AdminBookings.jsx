import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarSearch, CheckCircle2, XCircle } from 'lucide-react';
import { getBookings, cancelBooking } from '../services/bookingService';
import { getAmenities } from '../services/amenityService';
import { SkeletonTable } from '../components/Skeletons';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { useSocket } from '../context/SocketContext';

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toCancel, setToCancel] = useState(null);
  const [filterDate, setFilterDate] = useState('');
  const [filterAmenity, setFilterAmenity] = useState('');
  const socket = useSocket();

  const fetchBookings = async (filters = {}) => {
    setLoading(true);
    try {
      const res = await getBookings(filters);
      setBookings(res.data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    getAmenities().then((res) => setAmenities(res.data)).catch(() => {});
  }, []);

  // Re-query whenever the availability filters change, so owners/admins can
  // check "is this amenity booked on this date?" in one place.
  useEffect(() => {
    const filters = {};
    if (filterDate) filters.date = filterDate;
    if (filterAmenity) filters.amenity = filterAmenity;
    fetchBookings(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterDate, filterAmenity]);

  useEffect(() => {
    if (!socket) return;
    const handleCreated = (created) => setBookings((prev) => [created, ...prev]);
    const handleCancelled = (updated) =>
      setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
    socket.on('booking:created', handleCreated);
    socket.on('booking:cancelled', handleCancelled);
    return () => {
      socket.off('booking:created', handleCreated);
      socket.off('booking:cancelled', handleCancelled);
    };
  }, [socket]);

  const confirmCancel = async () => {
    try {
      await cancelBooking(toCancel._id);
      toast.success('Booking cancelled');
      setToCancel(null);
      fetchBookings({
        ...(filterDate ? { date: filterDate } : {}),
        ...(filterAmenity ? { amenity: filterAmenity } : {}),
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const activeCount = bookings.filter((b) => b.status !== 'Cancelled').length;
  const checkingAvailability = filterDate && filterAmenity;

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-ink-900">All Bookings</h1>
      <p className="text-sm text-ink-500 mt-1">Manage amenity bookings and check date availability.</p>

      {/* Availability checker — "is this amenity booked on this date?" */}
      <div className="bg-white rounded-xl border border-ink-200 shadow-card mt-6 p-5">
        <div className="flex items-center gap-2 text-ink-900">
          <CalendarSearch size={18} className="text-brand-600" />
          <h2 className="font-display font-semibold">Check availability</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div>
            <label className="text-xs font-medium text-ink-500">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-500">Amenity</label>
            <select
              value={filterAmenity}
              onChange={(e) => setFilterAmenity(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="">All amenities</option>
              {amenities.map((a) => (
                <option key={a._id} value={a._id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            {(filterDate || filterAmenity) && (
              <button
                onClick={() => { setFilterDate(''); setFilterAmenity(''); }}
                className="text-sm font-medium text-ink-500 hover:text-ink-700 px-3 py-2.5"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {checkingAvailability && !loading && (
          <div
            className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium ${
              activeCount === 0
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
            }`}
          >
            {activeCount === 0 ? (
              <>
                <CheckCircle2 size={18} />
                Available — no bookings for this amenity on {new Date(filterDate).toLocaleDateString()}.
              </>
            ) : (
              <>
                <XCircle size={18} />
                Already booked — {activeCount} booking{activeCount > 1 ? 's' : ''} found for this amenity on{' '}
                {new Date(filterDate).toLocaleDateString()} (see time slots below).
              </>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-ink-200 shadow-card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Tenant</th>
              <th className="px-4 py-3 font-medium">Amenity</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading ? (
              <SkeletonTable rows={5} columns={6} />
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink-400">
                  No bookings found.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b._id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{b.tenant?.name}</td>
                  <td className="px-4 py-3 text-ink-600">{b.amenity?.name}</td>
                  <td className="px-4 py-3 text-ink-600">{new Date(b.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-ink-600">{b.startTime} - {b.endTime}</td>
                  <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {b.status === 'Confirmed' && (
                      <button
                        onClick={() => setToCancel(b)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!toCancel}
        title="Cancel booking?"
        message={`Cancel ${toCancel?.tenant?.name}'s booking for "${toCancel?.amenity?.name}"?`}
        confirmLabel="Cancel Booking"
        danger
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      />
    </div>
  );
};

export default AdminBookings;
