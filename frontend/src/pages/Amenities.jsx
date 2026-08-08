import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, CalendarPlus } from 'lucide-react';
import { getAmenities, createAmenity, updateAmenity, deleteAmenity } from '../services/amenityService';
import { createBooking } from '../services/bookingService';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

const Amenities = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [bookingFor, setBookingFor] = useState(null);

  const adminForm = useForm();
  const bookingForm = useForm();

  const fetchAmenities = async () => {
    setLoading(true);
    try {
      const res = await getAmenities();
      setAmenities(res.data);
    } catch {
      toast.error('Failed to load amenities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  const openCreate = () => {
    setEditing(null);
    adminForm.reset({ name: '', description: '', available: true });
    setShowForm(true);
  };

  const openEdit = (amenity) => {
    setEditing(amenity);
    adminForm.reset(amenity);
    setShowForm(true);
  };

  const onSubmitAdmin = async (values) => {
    try {
      if (editing) {
        await updateAmenity(editing._id, values);
        toast.success('Amenity updated');
      } else {
        await createAmenity(values);
        toast.success('Amenity created');
      }
      setShowForm(false);
      fetchAmenities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteAmenity(toDelete._id);
      toast.success('Amenity deleted');
      setToDelete(null);
      fetchAmenities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const onSubmitBooking = async (values) => {
    try {
      await createBooking({ ...values, amenity: bookingFor._id });
      toast.success('Booking confirmed');
      setBookingFor(null);
      bookingForm.reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900">Amenities</h1>
          <p className="text-sm text-ink-500 mt-1">
            {isAdmin ? 'Manage the shared amenities available to tenants.' : 'Browse and book shared amenities.'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg"
          >
            <Plus size={16} /> Add Amenity
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-36 rounded-xl" />)
          : amenities.map((a) => (
              <div key={a._id} className="bg-white rounded-xl border border-ink-200 p-5 flex flex-col">
                <div className="flex items-start justify-between">
                  <h3 className="font-display font-semibold text-ink-900">{a.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${a.available ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {a.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                <p className="text-sm text-ink-500 mt-2 flex-1">{a.description || 'No description provided.'}</p>

                <div className="flex justify-end gap-2 mt-4">
                  {isAdmin ? (
                    <>
                      <button onClick={() => openEdit(a)} className="p-2 rounded-lg hover:bg-ink-100 text-ink-500">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setToDelete(a)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </>
                  ) : (
                    <button
                      disabled={!a.available}
                      onClick={() => setBookingFor(a)}
                      className="flex items-center gap-1.5 text-sm font-medium bg-brand-700 hover:bg-brand-800 disabled:bg-ink-200 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg"
                    >
                      <CalendarPlus size={15} /> Book
                    </button>
                  )}
                </div>
              </div>
            ))}
      </div>

      {/* Admin create/edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-display font-semibold text-lg text-ink-900">
              {editing ? 'Edit Amenity' : 'Add Amenity'}
            </h3>
            <form onSubmit={adminForm.handleSubmit(onSubmitAdmin)} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-ink-700">Name</label>
                <input
                  {...adminForm.register('name', { required: 'Name is required' })}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700">Description</label>
                <textarea
                  {...adminForm.register('description')}
                  rows={3}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-ink-700">
                <input type="checkbox" {...adminForm.register('available')} className="rounded border-ink-300" />
                Available for booking
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium rounded-lg text-ink-600 hover:bg-ink-100">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-700 hover:bg-brand-800 text-white">
                  {editing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenant booking modal */}
      {bookingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-display font-semibold text-lg text-ink-900">Book {bookingFor.name}</h3>
            <form onSubmit={bookingForm.handleSubmit(onSubmitBooking)} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-ink-700">Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...bookingForm.register('date', { required: true })}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-ink-700">Start time</label>
                  <input
                    type="time"
                    {...bookingForm.register('startTime', { required: true })}
                    className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-ink-700">End time</label>
                  <input
                    type="time"
                    {...bookingForm.register('endTime', { required: true })}
                    className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setBookingFor(null)} className="px-4 py-2 text-sm font-medium rounded-lg text-ink-600 hover:bg-ink-100">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-700 hover:bg-brand-800 text-white">
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete amenity?"
        message={`This will permanently remove "${toDelete?.name}".`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};

export default Amenities;
