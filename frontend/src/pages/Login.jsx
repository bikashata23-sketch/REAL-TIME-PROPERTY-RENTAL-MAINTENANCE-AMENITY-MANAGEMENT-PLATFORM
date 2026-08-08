import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRole } from '../utils/roleRoutes';
import AuthHeroPanel from '../components/AuthHeroPanel';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (values) => {
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(dashboardPathForRole(user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-ink-50">
      <AuthHeroPanel
        title="Manage properties without the chaos."
        subtitle="One dashboard for tenants, owners, and admins — bookings, maintenance, and everything in between, in real time."
      />

      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-glow">
              <Building2 size={20} />
            </span>
            <span className="font-display font-bold text-xl text-ink-900">
              Rental<span className="text-brand-600">Hub</span>
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl text-ink-900">Welcome back</h1>
          <p className="text-sm text-ink-500 mt-1">Sign in to manage your properties and bookings.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-700">Email</label>
              <div className="relative mt-1">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-ink-700">Password</label>
              <div className="relative mt-1">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-medium py-2.5 rounded-lg transition-all shadow-glow hover:shadow-lg disabled:opacity-60 disabled:shadow-none"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-sm text-ink-500 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-700 font-medium hover:underline">
              Register
            </Link>
          </p>

          <div className="text-xs text-ink-400 text-center mt-8 bg-ink-100/60 rounded-lg py-3 px-4">
            <p className="font-medium text-ink-500 mb-1">Demo accounts</p>
            <p>Admin: admin@propertyplatform.com / Admin@123</p>
            <p>Owner: owner@propertyplatform.com / Owner@123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
