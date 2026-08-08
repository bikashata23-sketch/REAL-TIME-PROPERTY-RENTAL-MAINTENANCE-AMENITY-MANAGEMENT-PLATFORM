import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wrench, Building2, Waves, CalendarClock, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const tenantLinks = [
  { to: '/tenant/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/tenant/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/tenant/amenities', label: 'Amenities', icon: Waves },
  { to: '/tenant/bookings', label: 'My Bookings', icon: CalendarClock },
];

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/properties', label: 'Properties', icon: Building2 },
  { to: '/admin/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/admin/amenities', label: 'Amenities', icon: Waves },
  { to: '/admin/bookings', label: 'Bookings', icon: CalendarClock },
];

const ownerLinks = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/owner/properties', label: 'Properties', icon: Building2 },
  { to: '/owner/maintenance', label: 'Maintenance', icon: Wrench },
  { to: '/owner/amenities', label: 'Amenities', icon: Waves },
  { to: '/owner/bookings', label: 'Bookings', icon: CalendarClock },
];

const linksByRole = { admin: adminLinks, owner: ownerLinks, tenant: tenantLinks };

const Sidebar = ({ open, onClose }) => {
  const { user } = useAuth();
  const links = linksByRole[user?.role] || tenantLinks;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-brand-gradient text-ink-100 flex flex-col relative overflow-hidden
        transform transition-transform duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Decorative texture — CSS-only dot grid + radial glow, no image assets */}
        <div className="absolute inset-0 dot-grid bg-brand-radial pointer-events-none" />

        <div className="relative flex items-center justify-between px-6 h-16 border-b border-white/10">
          <span className="font-display font-bold text-lg text-white">
            Rental<span className="text-brand-300">Hub</span>
          </span>
          <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="relative flex-1 px-3 py-6 space-y-1">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border-l-2 ${
                  isActive
                    ? 'bg-white/10 text-white border-brand-300 shadow-sm'
                    : 'text-white/70 border-transparent hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="relative px-6 py-4 border-t border-white/10 text-xs text-white/60">
          Signed in as <span className="font-medium text-white capitalize">{user?.role}</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
