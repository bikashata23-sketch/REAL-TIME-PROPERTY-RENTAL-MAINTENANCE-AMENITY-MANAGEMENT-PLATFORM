import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Home, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardPathForRole } from '../utils/roleRoutes';
import AuthHeroPanel from '../components/AuthHeroPanel';

const ROLE_OPTIONS = [
  {
    value: 'tenant',
    label: 'Tenant',
    description: 'Submit maintenance requests & book amenities',
    icon: KeyRound,
  },
  {
    value: 'owner',
    label: 'Property Owner',
    description: 'Manage properties, bookings & maintenance status',
    icon: Home,
  },
];

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { role: 'tenant' } });

  const selectedRole = watch('role');

  const onSubmit = async (values) => {
    try {
      const user = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      toast.success('Account created successfully!');
      navigate(dashboardPathForRole(user.role));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-ink-50">
      <AuthHeroPanel
        title="Set up your account in under a minute."
        subtitle="Whether you rent, own, or manage — RentalHub gives you the right dashboard from day one."
      />

      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <span className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center shadow-glow">
              <Building2 size={20} />
            </span>
            <span className="font-display font-bold text-xl text-ink-900">
              Rental<span className="text-brand-600">Hub</span>
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl text-ink-900">Create your account</h1>
          <p className="text-sm text-ink-500 mt-1">Choose how you'll use RentalHub, then set up your account.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-700 mb-2 block">I am a...</label>
              <input type="hidden" {...register('role')} />
              <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setValue('role', value)}
                    className={`text-left p-3.5 rounded-xl border-2 transition-all ${
                      selectedRole === value
                        ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600 shadow-sm'
                        : 'border-ink-200 hover:border-ink-300'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                        selectedRole === value
                          ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white'
                          : 'bg-ink-100 text-ink-500'
                      }`}
                    >
                      <Icon size={16} />
                    </span>
                    <p className="text-sm font-semibold text-ink-900">{label}</p>
                    <p className="text-xs text-ink-500 mt-0.5 leading-snug">{description}</p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-ink-700">Full name</label>
              <input
                {...register('name', { required: 'Name is required' })}
                className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                placeholder="Jane Doe"
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-ink-700">Email</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-ink-700">Password</label>
              <input
                type="password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
                })}
                className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-ink-700">Confirm password</label>
              <input
                type="password"
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
                  validate: (v) => v === watch('password') || 'Passwords do not match',
                })}
                className="mt-1 w-full px-3 py-2.5 rounded-lg border border-ink-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-medium py-2.5 rounded-lg transition-all shadow-glow hover:shadow-lg disabled:opacity-60 disabled:shadow-none"
            >
              {isSubmitting ? 'Creating account...' : 'Create account'}
              {!isSubmitting && <ArrowRight size={16} />}
            </button>
          </form>

          <p className="text-sm text-ink-500 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-700 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
