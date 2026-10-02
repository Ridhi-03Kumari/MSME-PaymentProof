import type { Invoice } from '../types';
import { formatDateDisplay, calculateDaysOverdue, calculateDaysDue, getTodayDate } from '../lib/calculations';

export function CalculationExplanation({ invoice }: { invoice: Invoice }) {
  const today = getTodayDate();
  const daysOverdue = invoice.dueDate ? calculateDaysOverdue(invoice.dueDate, today) : 0;
  const daysDue = invoice.dueDate ? calculateDaysDue(invoice.dueDate, today) : null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3" aria-label="Calculation explanation">
      <h3 className="font-semibold text-navy-800">How the deadline was calculated</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">Invoice Date</p>
          <p className="font-semibold">{formatDateDisplay(invoice.invoiceDate)}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">Payment Terms</p>
          <p className="font-semibold">{invoice.paymentTermsDays != null ? `${invoice.paymentTermsDays} days` : '—'}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-xs text-gray-500 mb-1">Due Date</p>
          <p className="font-semibold">{formatDateDisplay(invoice.dueDate)}</p>
        </div>
      </div>
      {invoice.dueDate && daysOverdue > 0 && (
        <p className="text-sm text-red-700 font-medium">This invoice is <strong>{daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue</strong> as of {formatDateDisplay('2026-09-19')}.</p>
      )}
      {invoice.dueDate && daysDue !== null && daysDue > 0 && daysOverdue === 0 && (
        <p className="text-sm text-amber-700 font-medium">Payment is due in <strong>{daysDue} day{daysDue !== 1 ? 's' : ''}</strong>.</p>
      )}
      {!invoice.paymentTermsDays && (
        <p className="text-sm text-purple-700 font-medium">Payment terms are not confirmed. Please enter the agreed terms to calculate the due date.</p>
      )}
      <p className="text-xs text-gray-400">Due date = Invoice date + Payment terms (days). Calculated using standard application logic, not AI.</p>
    </div>
  );
}
