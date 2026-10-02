import type { InvoiceStatus } from '../types';

const CONFIG: Record<InvoiceStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700' },
  needs_confirmation: { label: 'Needs Confirmation', className: 'bg-purple-100 text-purple-700' },
  due_soon: { label: 'Due Soon', className: 'bg-amber-100 text-amber-700' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700' },
  paid: { label: 'Paid', className: 'bg-green-100 text-green-700' },
  evidence_incomplete: { label: 'Evidence Incomplete', className: 'bg-orange-100 text-orange-700' },
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, className } = CONFIG[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}
