import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { SummaryCard } from '../components/SummaryCard';
import { InvoiceTable } from '../components/InvoiceTable';
import { EmptyState } from '../components/EmptyState';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { DemoDataBanner } from '../components/DemoDataBanner';
import { calculateDashboardStats } from '../lib/calculations';
import type { FilterStatus } from '../types';
import { formatCurrency } from '../lib/calculations';

const FILTER_OPTIONS: { label: string; value: FilterStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Due Soon', value: 'due_soon' },
  { label: 'Needs Confirmation', value: 'needs_confirmation' },
  { label: 'Draft', value: 'draft' },
  { label: 'Paid', value: 'paid' },
];

export function DashboardPage() {
  const { invoices, loading, error, isDemoMode, filterStatus, searchQuery, setFilterStatus, setSearchQuery, loadDemo, refreshInvoices } = useApp();

  const stats = useMemo(() => calculateDashboardStats(invoices), [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesStatus = filterStatus === 'all' || inv.status === filterStatus;
      const matchesSearch = !searchQuery ||
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.buyerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [invoices, filterStatus, searchQuery]);

  if (loading) return <LoadingState message="Loading invoices…" />;
  if (error) return <ErrorState message={error} onRetry={refreshInvoices} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your outstanding receivables</p>
        </div>
        <div className="flex gap-3">
          {invoices.length === 0 && (
            <button onClick={loadDemo} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
              Load demo data
            </button>
          )}
          <Link to="/upload" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">
            Upload invoice
          </Link>
        </div>
      </div>

      {isDemoMode && <DemoDataBanner />}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard label="Total Outstanding" value={formatCurrency(stats.totalOutstanding)} subLabel="across open invoices" />
        <SummaryCard label="Open Invoices" value={stats.openInvoices} />
        <SummaryCard label="Overdue" value={stats.overdueInvoices} variant={stats.overdueInvoices > 0 ? 'danger' : 'default'} />
        <SummaryCard label="Due Soon" value={stats.dueSoonInvoices} variant={stats.dueSoonInvoices > 0 ? 'warning' : 'default'} />
        <SummaryCard label="Incomplete Evidence" value={stats.incompleteEvidenceInvoices} variant={stats.incompleteEvidenceInvoices > 0 ? 'warning' : 'default'} />
      </div>

      {/* Search & Filters */}
      {invoices.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            placeholder="Search by invoice number or buyer…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Search invoices"
          />
          <div className="flex gap-2 flex-wrap" role="group" aria-label="Filter by status">
            {FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  filterStatus === opt.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                }`}
                aria-pressed={filterStatus === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Table or Empty State */}
      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Upload your first invoice or load the demo data to see how PaymentProof works."
          icon="📄"
          action={
            <div className="flex gap-3 flex-wrap justify-center">
              <button onClick={loadDemo} className="px-5 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-medium text-sm hover:bg-blue-50">
                Load demo data
              </button>
              <Link to="/upload" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700">
                Upload invoice
              </Link>
            </div>
          }
        />
      ) : filteredInvoices.length === 0 ? (
        <EmptyState
          title="No matching invoices"
          description="Try a different search term or status filter."
          icon="🔍"
          action={
            <button onClick={() => { setFilterStatus('all'); setSearchQuery(''); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm">
              Clear filters
            </button>
          }
        />
      ) : (
        <InvoiceTable invoices={filteredInvoices} />
      )}
    </div>
  );
}
