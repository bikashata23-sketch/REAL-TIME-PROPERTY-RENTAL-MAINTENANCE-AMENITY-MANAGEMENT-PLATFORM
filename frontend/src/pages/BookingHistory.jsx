import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getBookings, cancelBooking } from '../services/bookingService';
import { SkeletonTable } from '../components/Skeletons';
import StatusBadge from '../components/StatusBadge';
import ConfirmDialog from '../components/ConfirmDialog';
import { useSocket } from '../context/SocketContext';

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toCancel, setToCancel] = useState(null);
  const socket = useSocket();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await getBookings();
      setBookings(res.data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handler = (updated) => {
      setBookings((prev) => prev.map((b) => (b._id === updated._id ? updated : b)));
    };
    socket.on('booking:cancelled', handler);
    return () => socket.off('booking:cancelled', handler);
  }, [socket]);

  const confirmCancel = async () => {
    try {
      await cancelBooking(toCancel._id);
      toast.success('Booking cancelled');
      setToCancel(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking');
    }
  };

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-ink-900">My Bookings</h1>
      <p className="text-sm text-ink-500 mt-1">Your amenity booking history.</p>

      <div className="bg-white rounded-xl border border-ink-200 shadow-card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Amenity</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading ? (
              <SkeletonTable rows={4} columns={5} />
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-ink-400">
                  No bookings yet.
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b._id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{b.amenity?.name}</td>
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
        message={`Cancel your booking for "${toCancel?.amenity?.name}"?`}
        confirmLabel="Cancel Booking"
        danger
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      />
    </div>
  );
};

export default BookingHistory;
