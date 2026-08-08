import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-ink-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <button onClick={onMenuClick} className="lg:hidden text-ink-600">
        <Menu size={22} />
      </button>

      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-ink-700">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-sm">
            <User size={16} />
          </span>
          <span className="font-medium hidden sm:inline">{user?.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-md hover:bg-red-50"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
