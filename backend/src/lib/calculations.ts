import { Evidence, InvoiceStatus } from '../types';

export function parseDate(dateStr: string): Date {
  return new Date(dateStr);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function calculateDueDate(invoiceDate: string, paymentTermsDays: number): string {
  const date = parseDate(invoiceDate);
  date.setDate(date.getDate() + paymentTermsDays);
  return formatDate(date);
}

export function calculateDaysOverdue(dueDate: string, currentDate: Date = new Date()): number {
  const due = parseDate(dueDate);
  const diffTime = Math.max(0, currentDate.getTime() - due.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateDaysDue(dueDate: string, currentDate: Date = new Date()): number {
  const due = parseDate(dueDate);
  const diffTime = Math.max(0, due.getTime() - currentDate.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateStatus(params: {
  paymentTermsDays: number | null;
  dueDate: string | null;
  daysOverdue: number;
  evidence: Evidence;
  isPaid?: boolean;
}): InvoiceStatus {
  if (params.isPaid) return 'paid';
  if (!params.paymentTermsDays || !params.dueDate) return 'needs_confirmation';
  if (params.daysOverdue > 0) return 'overdue';
  const daysDue = calculateDaysDue(params.dueDate);
  if (daysDue <= 7) return 'due_soon';
  if (isEvidenceIncomplete(params.evidence)) return 'evidence_incomplete';
  return 'draft';
}

export function isEvidenceIncomplete(evidence: Evidence): boolean {
  return evidence.proofOfDelivery === 'missing';
}
