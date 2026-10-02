import type { IInvoiceRepository, Invoice } from '../types';
import { loadDemoData } from '../data/demoData';

let store: Invoice[] = [];

export class MockInvoiceRepository implements IInvoiceRepository {
  async listInvoices(): Promise<Invoice[]> {
    await new Promise(r => setTimeout(r, 300));
    return [...store];
  }

  async getInvoice(id: string): Promise<Invoice | null> {
    await new Promise(r => setTimeout(r, 200));
    return store.find(i => i.id === id) ?? null;
  }

  async createInvoice(data: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    await new Promise(r => setTimeout(r, 300));
    const now = new Date().toISOString();
    const invoice: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    store.push(invoice);
    return { ...invoice };
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    await new Promise(r => setTimeout(r, 200));
    const idx = store.findIndex(i => i.id === id);
    if (idx === -1) throw new Error(`Invoice ${id} not found`);
    store[idx] = { ...store[idx], ...updates, updatedAt: new Date().toISOString() };
    return { ...store[idx] };
  }

  async deleteInvoice(id: string): Promise<void> {
    await new Promise(r => setTimeout(r, 200));
    store = store.filter(i => i.id !== id);
  }

  // Helper for demo
  loadDemo(): void {
    store = loadDemoData();
  }

  clear(): void {
    store = [];
  }
}
