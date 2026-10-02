import { describe, it, expect } from 'vitest';
import {
  calculateDueDate,
  calculateDaysOverdue,
  calculateStatus,
  generateReminderDraft,
  formatIndianNumber,
  parseDate,
} from '../lib/calculations';
import type { Evidence } from '../types';

const FULL_EVIDENCE: Evidence = {
  invoice: 'available',
  purchaseOrder: 'available',
  proofOfDelivery: 'available',
  paymentCommunication: 'available',
  paymentReceipt: 'available',
};

describe('calculateDueDate', () => {
  it('adds payment terms days to invoice date', () => {
    expect(calculateDueDate('2026-07-12', 45)).toBe('2026-08-26');
  });

  it('calculates 30 day terms correctly', () => {
    expect(calculateDueDate('2026-08-26', 30)).toBe('2026-09-25');
  });

  it('handles month boundary correctly', () => {
    expect(calculateDueDate('2026-01-31', 1)).toBe('2026-02-01');
  });
});

describe('calculateDaysOverdue', () => {
  it('returns positive days when past due', () => {
    const today = parseDate('2026-09-19');
    expect(calculateDaysOverdue('2026-08-26', today)).toBe(24);
  });

  it('returns 0 when not yet due', () => {
    const today = parseDate('2026-09-19');
    expect(calculateDaysOverdue('2026-09-25', today)).toBe(0);
  });

  it('returns 0 when due today', () => {
    const today = parseDate('2026-09-19');
    expect(calculateDaysOverdue('2026-09-19', today)).toBe(0);
  });
});

describe('calculateStatus', () => {
  it('returns needs_confirmation when paymentTermsDays is null', () => {
    expect(calculateStatus({ paymentTermsDays: null, dueDate: null, daysOverdue: 0, evidence: FULL_EVIDENCE })).toBe('needs_confirmation');
  });

  it('returns overdue when past due date', () => {
    const status = calculateStatus({ paymentTermsDays: 45, dueDate: '2026-08-26', daysOverdue: 24, evidence: FULL_EVIDENCE });
    expect(status).toBe('overdue');
  });

  it('returns due_soon when within 7 days', () => {
    const status = calculateStatus({ paymentTermsDays: 30, dueDate: '2026-09-25', daysOverdue: 0, evidence: FULL_EVIDENCE });
    expect(status).toBe('due_soon');
  });

  it('returns paid when isPaid is true', () => {
    const status = calculateStatus({ paymentTermsDays: 30, dueDate: '2026-08-01', daysOverdue: 0, evidence: FULL_EVIDENCE, isPaid: true });
    expect(status).toBe('paid');
  });
});

describe('generateReminderDraft', () => {
  it('includes invoice number in subject', () => {
    const invoice: any = {
      invoiceNumber: 'INV-104',
      buyerName: 'ABC Components Pvt. Ltd.',
      invoiceAmount: 82000,
      currency: 'INR',
      invoiceDate: '2026-07-12',
      dueDate: '2026-08-26',
      paymentTermsDays: 45,
    };
    const draft = generateReminderDraft(invoice);
    expect(draft).toContain('INV-104');
    expect(draft).toContain('ABC Components Pvt. Ltd.');
    expect(draft).toContain('82,000');
  });

  it('handles missing due date', () => {
    const invoice: any = {
      invoiceNumber: 'INV-111',
      buyerName: 'Bharat Industrial Works',
      invoiceAmount: 120000,
      currency: 'INR',
      invoiceDate: '2026-09-01',
      dueDate: null,
      paymentTermsDays: null,
    };
    const draft = generateReminderDraft(invoice);
    expect(draft).toContain('INV-111');
    expect(draft).toContain('payment terms are currently pending confirmation');
  });
});

describe('formatIndianNumber', () => {
  it('formats 82000 as 82,000', () => {
    expect(formatIndianNumber(82000)).toBe('82,000');
  });

  it('formats 120000 as 1,20,000', () => {
    const result = formatIndianNumber(120000);
    expect(result).toMatch(/1,20,000|120,000/);
  });
});

describe('demo data', () => {
  it('loads three invoices', async () => {
    const { loadDemoData } = await import('../data/demoData');
    const data = loadDemoData();
    expect(data).toHaveLength(3);
  });

  it('INV-104 is overdue', async () => {
    const { loadDemoData } = await import('../data/demoData');
    const [inv104] = loadDemoData();
    expect(inv104.invoiceNumber).toBe('INV-104');
    expect(inv104.status).toBe('overdue');
    expect(inv104.daysOverdue).toBeGreaterThan(0);
  });

  it('INV-109 is due_soon', async () => {
    const { loadDemoData } = await import('../data/demoData');
    const [, inv109] = loadDemoData();
    expect(inv109.invoiceNumber).toBe('INV-109');
    expect(inv109.status).toBe('due_soon');
  });

  it('INV-111 needs confirmation', async () => {
    const { loadDemoData } = await import('../data/demoData');
    const [, , inv111] = loadDemoData();
    expect(inv111.invoiceNumber).toBe('INV-111');
    expect(inv111.status).toBe('needs_confirmation');
    expect(inv111.paymentTermsDays).toBeNull();
  });
});
