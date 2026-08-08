import { useEffect, useState } from 'react';
import { ClipboardList, Loader2, CheckCircle2, CalendarCheck } from 'lucide-react';
import StatCard from '../components/StatCard';
import { SkeletonCard } from '../components/Skeletons';
import { getTenantDashboard } from '../services/dashboardService';

const TenantDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTenantDashboard()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="font-display font-bold text-2xl text-ink-900">Your Dashboard</h1>
      <p className="text-sm text-ink-500 mt-1">A quick summary of your requests and bookings.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard label="Total Requests" value={stats.totalRequests} icon={ClipboardList} accent="brand" />
            <StatCard label="Active Requests" value={stats.activeRequests} icon={Loader2} accent="amber" />
            <StatCard label="Completed Requests" value={stats.completedRequests} icon={CheckCircle2} accent="emerald" />
            <StatCard label="Upcoming Bookings" value={stats.upcomingBookings} icon={CalendarCheck} accent="blue" />
          </>
        )}
      </div>
    </div>
  );
};

export default TenantDashboard;
