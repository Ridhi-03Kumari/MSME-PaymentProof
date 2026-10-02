
interface SummaryCardProps {
  label: string;
  value: string | number;
  subLabel?: string;
  variant?: 'default' | 'warning' | 'danger' | 'success';
  icon?: React.ReactNode;
}

const variantStyles = {
  default: 'border-gray-200',
  warning: 'border-amber-300 bg-amber-50',
  danger: 'border-red-300 bg-red-50',
  success: 'border-green-300 bg-green-50',
};

export function SummaryCard({ label, value, subLabel, variant = 'default', icon }: SummaryCardProps) {
  return (
    <div className={`bg-white rounded-xl border-2 p-5 flex flex-col gap-1 shadow-sm ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <p className="text-2xl font-bold text-navy-900">{value}</p>
      {subLabel && <p className="text-xs text-gray-400">{subLabel}</p>}
    </div>
  );
}
