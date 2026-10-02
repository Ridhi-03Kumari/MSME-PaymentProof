import type { Invoice } from '../types';
import { calculateDueDate, calculateDaysOverdue, getTodayDate } from '../lib/calculations';

const today = getTodayDate();

export const DEMO_INVOICES: Invoice[] = [
  {
    id: 'demo-inv-104',
    invoiceNumber: 'INV-104',
    buyerName: 'ABC Components Pvt. Ltd.',
    invoiceDate: '2026-07-12',
    invoiceAmount: 82000,
    currency: 'INR',
    paymentTermsDays: 45,
    dueDate: calculateDueDate('2026-07-12', 45), // 2026-08-26
    status: 'overdue',
    daysOverdue: calculateDaysOverdue(calculateDueDate('2026-07-12', 45), today),
    evidence: {
      invoice: 'available',
      purchaseOrder: 'available',
      proofOfDelivery: 'available',
      paymentCommunication: 'missing',
      paymentReceipt: 'missing',
    },
    sourceReferences: [
      { documentName: 'INV-104.pdf', page: 1, field: 'Invoice Number', quotedText: 'INV-104' },
      { documentName: 'INV-104.pdf', page: 1, field: 'Invoice Amount', quotedText: '₹82,000' },
      { documentName: 'PO-104.pdf', page: 1, field: 'Payment Terms', quotedText: '45 days net' },
      { documentName: 'POD-104.pdf', page: 1, field: 'Delivery Date', quotedText: '15 July 2026' },
    ],
    confidence: 'high',
    reminderDraft: undefined,
    createdAt: '2026-07-12T10:00:00.000Z',
    updatedAt: '2026-09-19T06:44:00.000Z',
  },
  {
    id: 'demo-inv-109',
    invoiceNumber: 'INV-109',
    buyerName: 'MetroFab Industries',
    invoiceDate: '2026-08-26',
    invoiceAmount: 46500,
    currency: 'INR',
    paymentTermsDays: 30,
    dueDate: calculateDueDate('2026-08-26', 30), // 2026-09-25
    status: 'due_soon',
    daysOverdue: 0,
    evidence: {
      invoice: 'available',
      purchaseOrder: 'available',
      proofOfDelivery: 'missing',
      paymentCommunication: 'missing',
      paymentReceipt: 'missing',
    },
    sourceReferences: [
      { documentName: 'INV-109.pdf', page: 1, field: 'Invoice Number', quotedText: 'INV-109' },
      { documentName: 'INV-109.pdf', page: 1, field: 'Invoice Amount', quotedText: '₹46,500' },
      { documentName: 'PO-109.pdf', page: 1, field: 'Payment Terms', quotedText: '30 days net' },
    ],
    confidence: 'high',
    reminderDraft: undefined,
    createdAt: '2026-08-26T09:00:00.000Z',
    updatedAt: '2026-09-19T06:44:00.000Z',
  },
  {
    id: 'demo-inv-111',
    invoiceNumber: 'INV-111',
    buyerName: 'Bharat Industrial Works',
    invoiceDate: '2026-09-01',
    invoiceAmount: 120000,
    currency: 'INR',
    paymentTermsDays: null,
    dueDate: null,
    status: 'needs_confirmation',
    daysOverdue: 0,
    evidence: {
      invoice: 'available',
      purchaseOrder: 'available',
      proofOfDelivery: 'missing',
      paymentCommunication: 'missing',
      paymentReceipt: 'missing',
    },
    sourceReferences: [
      { documentName: 'INV-111.pdf', page: 1, field: 'Invoice Number', quotedText: 'INV-111' },
      { documentName: 'INV-111.pdf', page: 1, field: 'Invoice Amount', quotedText: '₹1,20,000' },
    ],
    confidence: 'medium',
    reminderDraft: undefined,
    createdAt: '2026-09-01T11:00:00.000Z',
    updatedAt: '2026-09-19T06:44:00.000Z',
  },
];

export function loadDemoData(): Invoice[] {
  return DEMO_INVOICES.map(inv => ({ ...inv }));
}
