import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Invoice } from '../types';
import { useApp } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { EvidenceChecklist } from '../components/EvidenceChecklist';
import { CalculationExplanation } from '../components/CalculationExplanation';
import { FieldConfirmation } from '../components/FieldConfirmation';
import { ReminderDraft } from '../components/ReminderDraft';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { formatCurrency, formatDateDisplay, calculateDueDate, calculateDaysOverdue, getTodayDate } from '../lib/calculations';

function Timeline({ invoice }: { invoice: Invoice }) {
  const events = [
    { date: invoice.createdAt, label: 'Invoice created', icon: '📄' },
    invoice.dueDate ? { date: invoice.dueDate + 'T00:00:00.000Z', label: 'Payment due', icon: '📅' } : null,
    invoice.status === 'paid' ? { date: invoice.updatedAt, label: 'Marked as paid', icon: '✅' } : null,
  ].filter(Boolean) as { date: string; label: string; icon: string }[];

  return (
    <div className="space-y-3">
      {events.map((ev, i) => (
        <div key={i} className="flex items-start gap-3">
          <span className="text-lg">{ev.icon}</span>
          <div>
            <p className="text-sm font-medium text-gray-800">{ev.label}</p>
            <p className="text-xs text-gray-500">{new Date(ev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, updateInvoice, deleteInvoice, addToast } = useApp();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const found = invoices.find(i => i.id === id) ?? null;
      setInvoice(found);
      setLoading(false);
    }
  }, [id, invoices]);

  const handleSaveReminder = async (draft: string) => {
    if (!invoice) return;
    await updateInvoice(invoice.id, { reminderDraft: draft });
    addToast('success', 'Follow-up draft saved.');
  };

  const handleMarkPaid = async () => {
    if (!invoice) return;
    await updateInvoice(invoice.id, { status: 'paid' });
    addToast('success', `${invoice.invoiceNumber} marked as paid.`);
  };

  const handleDelete = async () => {
    if (!invoice) return;
    if (!window.confirm(`Delete invoice ${invoice.invoiceNumber}? This cannot be undone.`)) return;
    await deleteInvoice(invoice.id);
    navigate('/dashboard');
  };

  if (loading) return <LoadingState />;
  if (!invoice) return <ErrorState message="Invoice not found." />;

  const nextAction = (() => {
    if (invoice.status === 'needs_confirmation') return 'Confirm payment terms to calculate the due date.';
    if (invoice.status === 'overdue') return `Send a polite follow-up. This invoice is ${invoice.daysOverdue} days overdue.`;
    if (invoice.status === 'due_soon') return 'Payment is due soon. Consider sending a courtesy reminder.';
    if (invoice.status === 'evidence_incomplete') return 'Collect and upload proof of delivery to strengthen your position.';
    if (invoice.status === 'paid') return 'No action required. Invoice is paid.';
    return 'Monitor this invoice and collect any missing evidence.';
  })();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">← Back to dashboard</Link>
          <h1 className="text-2xl font-bold text-navy-900 mt-1">{invoice.invoiceNumber}</h1>
          <p className="text-gray-500">{invoice.buyerName}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <StatusBadge status={invoice.status} />
          {invoice.status !== 'paid' && (
            <button onClick={handleMarkPaid} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700">
              Mark as paid
            </button>
          )}
          <button onClick={handleDelete} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium hover:bg-red-100">
            Delete
          </button>
        </div>
      </div>

      {/* Next Action Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm font-semibold text-blue-800">📌 Recommended next action</p>
        <p className="text-sm text-blue-700 mt-1">{nextAction}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Invoice Fields */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-navy-900">Invoice Details</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Invoice Amount</p>
              <p className="font-bold text-lg">{formatCurrency(invoice.invoiceAmount, invoice.currency)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Invoice Date</p>
              <p className="font-semibold">{formatDateDisplay(invoice.invoiceDate)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Payment Terms</p>
              <p className="font-semibold">{invoice.paymentTermsDays != null ? `${invoice.paymentTermsDays} days` : <span className="text-purple-600">Not confirmed</span>}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Due Date</p>
              <p className="font-semibold">{formatDateDisplay(invoice.dueDate)}</p>
            </div>
          </div>

          {invoice.status === 'overdue' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-red-700">⚠️ {invoice.daysOverdue} days overdue</p>
            </div>
          )}

          <CalculationExplanation invoice={invoice} />
        </div>

        {/* Evidence Checklist */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-navy-900">Evidence Checklist</h2>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <EvidenceChecklist evidence={invoice.evidence} />
          </div>

          {/* Source References */}
          {invoice.sourceReferences.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Source References</h3>
              <ul className="space-y-2">
                {invoice.sourceReferences.map((ref, i) => (
                  <li key={i} className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                    <span className="font-medium">{ref.documentName}</span>
                    {ref.page && ` · Page ${ref.page}`} · {ref.field}
                    {ref.quotedText && <span className="italic"> — "{ref.quotedText}"</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timeline */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h3>
            <Timeline invoice={invoice} />
          </div>
        </div>
      </div>

      {/* Confirmed Field Review */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-3">Field Review</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <FieldConfirmation
            label="Invoice Number"
            value={invoice.invoiceNumber}
            confidence="high"
            source={invoice.sourceReferences[0]?.documentName ?? 'Document'}
            needsConfirmation={false}
          />
          <FieldConfirmation
            label="Buyer Name"
            value={invoice.buyerName}
            confidence={invoice.confidence}
            source={invoice.sourceReferences[0]?.documentName ?? 'Document'}
            needsConfirmation={invoice.confidence !== 'high'}
          />
          <FieldConfirmation
            label="Invoice Amount"
            value={formatCurrency(invoice.invoiceAmount, invoice.currency)}
            confidence="high"
            source={invoice.sourceReferences[0]?.documentName ?? 'Document'}
            needsConfirmation={false}
          />
          <FieldConfirmation
            label="Payment Terms (days)"
            value={invoice.paymentTermsDays}
            confidence={invoice.paymentTermsDays != null ? 'high' : 'low'}
            source={invoice.sourceReferences.find(r => r.field === 'Payment Terms')?.documentName ?? 'Not found'}
            needsConfirmation={invoice.paymentTermsDays == null}
            onConfirm={val => {
              const days = parseInt(val);
              if (!isNaN(days) && days > 0) {
                const newDueDate = calculateDueDate(invoice.invoiceDate, days);
                const newDaysOverdue = calculateDaysOverdue(newDueDate, getTodayDate());
                updateInvoice(invoice.id, {
                  paymentTermsDays: days,
                  dueDate: newDueDate,
                  daysOverdue: newDaysOverdue,
                  status: newDaysOverdue > 0 ? 'overdue' : 'due_soon',
                });
              }
            }}
          />
        </div>
      </div>

      {/* Reminder Draft */}
      <div>
        <h2 className="text-lg font-semibold text-navy-900 mb-3">Follow-up Draft</h2>
        <ReminderDraft invoice={invoice} onSave={handleSaveReminder} />
      </div>
    </div>
  );
}
