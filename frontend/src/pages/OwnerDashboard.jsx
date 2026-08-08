import { useEffect, useState } from 'react';
import { Building2, ClipboardList, Clock, CheckCircle2, CalendarCheck } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import StatCard from '../components/StatCard';
import { SkeletonCard } from '../components/Skeletons';
import { getOwnerDashboard } from '../services/dashboardService';

const STATUS_COLORS = { Pending: '#d97706', 'In Progress': '#2563eb', Completed: '#059669' };
const BAR_COLOR = '#0d9488';

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOwnerDashboard()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-ink-900">Owner Dashboard</h1>
      <p className="text-sm text-ink-500 mt-1">
        Overview of your properties, maintenance requests, and amenity bookings.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard label="Total Properties" value={data.stats.totalProperties} icon={Building2} accent="brand" />
            <StatCard label="Total Requests" value={data.stats.totalRequests} icon={ClipboardList} accent="blue" />
            <StatCard label="Pending Requests" value={data.stats.pendingRequests} icon={Clock} accent="amber" />
            <StatCard label="Completed Requests" value={data.stats.completedRequests} icon={CheckCircle2} accent="emerald" />
            <StatCard label="Active Bookings" value={data.stats.activeBookings} icon={CalendarCheck} accent="brand" />
          </>
        )}
      </div>

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl border border-ink-200 shadow-card hover-lift p-5">
            <h2 className="font-display font-semibold text-ink-900 mb-4">Maintenance by Status</h2>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.charts.maintenanceByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {data.charts.maintenanceByStatus.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-ink-200 shadow-card hover-lift p-5">
            <h2 className="font-display font-semibold text-ink-900 mb-4">Bookings per Amenity</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.charts.bookingsPerAmenity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl border border-ink-200 shadow-card hover-lift p-5 lg:col-span-2">
            <h2 className="font-display font-semibold text-ink-900 mb-4">Monthly Requests (last 6 months)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.charts.monthlyRequests}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke={BAR_COLOR} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
