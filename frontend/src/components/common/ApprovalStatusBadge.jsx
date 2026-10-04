export default function ApprovalStatusBadge({
  status,
  size = 'md',
  showIcon = true,
  className = '',
}) {
  const normalized = (status || 'PENDENTE').toUpperCase();

  const configs = {
    PENDENTE: {
      label: 'Pendente',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      dotClass: 'bg-amber-500',
      icon: (
        <svg className="w-3 h-3 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    APROVADO: {
      label: 'Aprovado',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dotClass: 'bg-emerald-500',
      icon: (
        <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ),
    },
    REJEITADO: {
      label: 'Rejeitado',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      dotClass: 'bg-rose-500',
      icon: (
        <svg className="w-3 h-3 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
    },
  };

  const current = configs[normalized] || configs.PENDENTE;

  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.2 rounded font-bold',
    sm: 'text-[10px] px-2 py-0.5 rounded-md font-bold',
    md: 'text-xs px-2.5 py-1 rounded-lg font-semibold',
    lg: 'text-sm px-3.5 py-1.5 rounded-xl font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border tracking-tight shrink-0 shadow-2xs ${current.badgeClass} ${sizeClasses[size] || sizeClasses.md} ${className}`}
      title={`Status: ${current.label}`}
    >
      {showIcon && current.icon}
      <span>{current.label}</span>
    </span>
  );
}
