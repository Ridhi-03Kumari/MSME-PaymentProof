import type { Invoice, InvoiceStatus, Evidence } from '../types';

export const TODAY = '2026-09-19'; // Reference date for demo

export function getTodayDate(): Date {
  return new Date(TODAY);
}

export function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateDisplay(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = parseDate(dateStr);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function calculateDueDate(invoiceDate: string, paymentTermsDays: number): string {
  const date = parseDate(invoiceDate);
  date.setDate(date.getDate() + paymentTermsDays);
  return formatDate(date);
}

export function calculateDaysOverdue(dueDate: string, today: Date = getTodayDate()): number {
  const due = parseDate(dueDate);
  const diffMs = today.getTime() - due.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function calculateDaysDue(dueDate: string, today: Date = getTodayDate()): number {
  const due = parseDate(dueDate);
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function isEvidenceIncomplete(evidence: Evidence): boolean {
  return evidence.proofOfDelivery === 'missing';
}

export function calculateStatus(
  invoice: Pick<Invoice, 'paymentTermsDays' | 'dueDate' | 'daysOverdue' | 'evidence'> & { isPaid?: boolean }
): InvoiceStatus {
  if (invoice.isPaid) return 'paid';
  if (!invoice.paymentTermsDays || !invoice.dueDate) return 'needs_confirmation';

  const today = getTodayDate();
  const daysOverdue = calculateDaysOverdue(invoice.dueDate, today);
  if (daysOverdue > 0) return 'overdue';

  const daysDue = calculateDaysDue(invoice.dueDate, today);
  if (daysDue <= 7) return 'due_soon';

  if (isEvidenceIncomplete(invoice.evidence)) return 'evidence_incomplete';

  return 'draft';
}

export function calculateDashboardStats(invoices: Invoice[]) {
  const open = invoices.filter(i => i.status !== 'paid');
  return {
    totalOutstanding: open.reduce((sum, i) => sum + i.invoiceAmount, 0),
    openInvoices: open.length,
    overdueInvoices: invoices.filter(i => i.status === 'overdue').length,
    dueSoonInvoices: invoices.filter(i => i.status === 'due_soon').length,
    incompleteEvidenceInvoices: invoices.filter(i => isEvidenceIncomplete(i.evidence) && i.status !== 'paid').length,
  };
}

export function generateReminderDraft(
  invoice: Invoice,
  businessName = 'Your Business Name'
): string {
  if (!invoice.dueDate) {
    return `Subject: Payment follow-up for Invoice ${invoice.invoiceNumber}\n\nDear ${invoice.buyerName},\n\nThis is a polite follow-up regarding Invoice ${invoice.invoiceNumber} for ₹${formatIndianNumber(invoice.invoiceAmount)}. The payment terms are currently pending confirmation. Please review and confirm the agreed payment terms at your earliest convenience.\n\nRegards,\n${businessName}`;
  }
  return `Subject: Payment follow-up for Invoice ${invoice.invoiceNumber}\n\nDear ${invoice.buyerName},\n\nThis is a polite follow-up regarding Invoice ${invoice.invoiceNumber} for ₹${formatIndianNumber(invoice.invoiceAmount)}, dated ${formatDateDisplay(invoice.invoiceDate)}. According to the recorded payment terms, payment was due on ${formatDateDisplay(invoice.dueDate)}.\n\nPlease confirm the expected payment date. The relevant invoice and delivery records are available for reference.\n\nRegards,\n${businessName}`;
}

export function formatIndianNumber(amount: number): string {
  return amount.toLocaleString('en-IN');
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  if (currency === 'INR') {
    return `₹${formatIndianNumber(amount)}`;
  }
  return `${currency} ${amount.toLocaleString()}`;
}
