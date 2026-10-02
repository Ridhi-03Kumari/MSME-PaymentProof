import { Link } from 'react-router-dom';
import type { Invoice } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDateDisplay } from '../lib/calculations';

interface InvoiceTableProps {
  invoices: Invoice[];
}

export function InvoiceTable({ invoices }: InvoiceTableProps) {
  if (!invoices.length) return null;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm" role="table" aria-label="Invoice list">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Buyer</th>
            <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Due Date</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Evidence</th>
            <th scope="col" className="px-4 py-3"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {invoices.map(invoice => (
            <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                <Link to={`/invoices/${invoice.id}`} className="hover:underline" aria-label={`View invoice ${invoice.invoiceNumber}`}>
                  {invoice.invoiceNumber}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-800">{invoice.buyerName}</td>
              <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(invoice.invoiceAmount, invoice.currency)}</td>
              <td className="px-4 py-3 text-gray-600">{formatDateDisplay(invoice.dueDate)}</td>
              <td className="px-4 py-3"><StatusBadge status={invoice.status} /></td>
              <td className="px-4 py-3 text-center">
                {invoice.evidence.proofOfDelivery === 'missing' ? (
                  <span className="text-amber-500 text-xs" title="Proof of delivery missing">⚠ Incomplete</span>
                ) : (
                  <span className="text-green-600 text-xs">✓ Complete</span>
                )}
              </td>
              <td className="px-4 py-3 text-right">
                <Link to={`/invoices/${invoice.id}`} className="text-blue-600 hover:text-blue-800 text-xs font-medium">View →</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
