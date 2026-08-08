import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import {
  getProperties,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../services/propertyService';
import { SkeletonTable } from '../components/Skeletons';
import ConfirmDialog from '../components/ConfirmDialog';

const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchProperties = async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await getProperties({ search: searchTerm });
      setProperties(res.data);
    } catch {
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProperties(search);
  };

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', address: '', description: '' });
    setShowForm(true);
  };

  const openEdit = (property) => {
    setEditing(property);
    reset(property);
    setShowForm(true);
  };

  const onSubmit = async (values) => {
    try {
      if (editing) {
        await updateProperty(editing._id, values);
        toast.success('Property updated');
      } else {
        await createProperty(values);
        toast.success('Property created');
      }
      setShowForm(false);
      fetchProperties(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteProperty(toDelete._id);
      toast.success('Property deleted');
      setToDelete(null);
      fetchProperties(search);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink-900">Properties</h1>
          <p className="text-sm text-ink-500 mt-1">Manage the properties on your platform.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg"
        >
          <Plus size={16} /> Add Property
        </button>
      </div>

      <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={16} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or address..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-ink-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <button type="submit" className="px-4 py-2.5 rounded-lg border border-ink-200 text-sm font-medium text-ink-600 hover:bg-ink-50">
          Search
        </button>
      </form>

      <div className="bg-white rounded-xl border border-ink-200 shadow-card mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-ink-600 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Address</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {loading ? (
              <SkeletonTable rows={4} columns={4} />
            ) : properties.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-ink-400">
                  No properties found.
                </td>
              </tr>
            ) : (
              properties.map((p) => (
                <tr key={p._id}>
                  <td className="px-4 py-3 font-medium text-ink-900">{p.title}</td>
                  <td className="px-4 py-3 text-ink-600">{p.address}</td>
                  <td className="px-4 py-3 text-ink-600 max-w-xs truncate">{p.description || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-ink-100 text-ink-500">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setToDelete(p)} className="p-2 rounded-lg hover:bg-red-50 text-red-500">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-display font-semibold text-lg text-ink-900">
              {editing ? 'Edit Property' : 'Add Property'}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-ink-700">Title</label>
                <input
                  {...register('title', { required: 'Title is required' })}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700">Address</label>
                <input
                  {...register('address', { required: 'Address is required' })}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700">Description</label>
                <textarea
                  {...register('description')}
                  rows={3}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
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
                  {editing ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete property?"
        message={`This will permanently remove "${toDelete?.title}". This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
};

export default Properties;
