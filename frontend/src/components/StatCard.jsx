const StatCard = ({ label, value, icon: Icon, accent = 'brand' }) => {
  const accents = {
    brand: 'bg-gradient-to-br from-brand-500 to-brand-700 text-white',
    amber: 'bg-gradient-to-br from-amber-400 to-amber-600 text-white',
    blue: 'bg-gradient-to-br from-blue-400 to-blue-600 text-white',
    emerald: 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white',
  };

  return (
    <div className="bg-white rounded-xl border border-ink-200 shadow-card hover-lift p-5 flex items-center justify-between animate-fade-up">
      <div>
        <p className="text-sm text-ink-500 font-medium">{label}</p>
        <p className="text-2xl font-display font-bold text-ink-900 mt-1">{value}</p>
      </div>
      {Icon && (
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${accents[accent]}`}>
          <Icon size={20} />
        </div>
      )}
    </div>
  );
};

export default StatCard;
