import type { Evidence, EvidenceStatus } from '../types';

const EVIDENCE_LABELS: Record<keyof Evidence, string> = {
  invoice: 'Invoice',
  purchaseOrder: 'Purchase Order',
  proofOfDelivery: 'Proof of Delivery',
  paymentCommunication: 'Payment Communication',
  paymentReceipt: 'Payment Receipt',
};

function StatusIcon({ status }: { status: EvidenceStatus }) {
  if (status === 'available') return <span className="text-green-500 font-bold" aria-label="Available">✓</span>;
  if (status === 'missing') return <span className="text-red-500 font-bold" aria-label="Missing">✗</span>;
  return <span className="text-amber-500 font-bold" aria-label="Needs review">?</span>;
}

function StatusLabel({ status }: { status: EvidenceStatus }) {
  const styles = { available: 'text-green-700', missing: 'text-red-700', needs_review: 'text-amber-700' };
  const labels = { available: 'Available', missing: 'Missing', needs_review: 'Needs review' };
  return <span className={`text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
}

interface EvidenceChecklistProps {
  evidence: Evidence;
  compact?: boolean;
}

export function EvidenceChecklist({ evidence, compact = false }: EvidenceChecklistProps) {
  const entries = Object.entries(evidence) as [keyof Evidence, EvidenceStatus][];
  return (
    <ul className={`space-y-${compact ? '1' : '3'}`} role="list" aria-label="Evidence checklist">
      {entries.map(([key, status]) => (
        <li key={key} className="flex items-center gap-3">
          <StatusIcon status={status} />
          <span className={`flex-1 ${compact ? 'text-sm' : 'text-base'} text-gray-700`}>
            {EVIDENCE_LABELS[key]}
          </span>
          {!compact && <StatusLabel status={status} />}
        </li>
      ))}
    </ul>
  );
}
