import { Building2, ShieldCheck, Zap, Wrench } from 'lucide-react';

const features = [
  { icon: Zap, text: 'Real-time updates on requests & bookings' },
  { icon: ShieldCheck, text: 'Role-based dashboards for every stakeholder' },
  { icon: Wrench, text: 'Maintenance tracking from submission to resolution' },
];

/**
 * Left-hand branded panel shown on auth screens (desktop only).
 * Pure CSS/SVG — no external image assets — so it renders instantly
 * and stays crisp at any size.
 */
const AuthHeroPanel = ({ title, subtitle }) => (
  <div className="hidden lg:flex flex-col justify-between w-1/2 bg-brand-gradient relative overflow-hidden p-12 text-white">
    <div className="absolute inset-0 dot-grid bg-brand-radial pointer-events-none" />

    {/* Soft decorative blobs */}
    <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl" />
    <div className="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-brand-400/20 blur-3xl" />

    <div className="relative flex items-center gap-2">
      <span className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur flex items-center justify-center">
        <Building2 size={20} />
      </span>
      <span className="font-display font-bold text-xl">
        Rental<span className="text-brand-200">Hub</span>
      </span>
    </div>

    <div className="relative">
      <h2 className="font-display font-bold text-3xl leading-tight max-w-sm">{title}</h2>
      <p className="text-brand-100 mt-3 max-w-sm">{subtitle}</p>

      <div className="mt-8 space-y-3">
        {features.map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-3 text-sm text-white/90">
            <span className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
              <Icon size={15} />
            </span>
            {text}
          </div>
        ))}
      </div>
    </div>

    <p className="relative text-xs text-brand-200/80">
      Tenant · Owner · Admin — one platform, every role.
    </p>
  </div>
);

export default AuthHeroPanel;
