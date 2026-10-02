import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Invoice, FilterStatus } from '../types';
import { invoiceRepository } from '../adapters';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface AppContextValue {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
  filterStatus: FilterStatus;
  searchQuery: string;
  toasts: Toast[];
  setFilterStatus: (s: FilterStatus) => void;
  setSearchQuery: (q: string) => void;
  loadDemo: () => Promise<void>;
  refreshInvoices: () => Promise<void>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
  addToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await invoiceRepository.listInvoices();
      setInvoices(data);
    } catch (e) {
      setError('Failed to load invoices.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDemo = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const repo = invoiceRepository as any;
      if (repo.loadDemo) repo.loadDemo();
      const data = await invoiceRepository.listInvoices();
      setInvoices(data);
      setIsDemoMode(true);
      addToast('success', 'Demo data loaded successfully.');
    } catch (e) {
      setError('Failed to load demo data.');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const updateInvoice = useCallback(async (id: string, updates: Partial<Invoice>) => {
    const updated = await invoiceRepository.updateInvoice(id, updates);
    setInvoices(prev => prev.map(i => i.id === id ? updated : i));
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    await invoiceRepository.deleteInvoice(id);
    setInvoices(prev => prev.filter(i => i.id !== id));
    addToast('success', 'Invoice deleted.');
  }, [addToast]);

  useEffect(() => { refreshInvoices(); }, [refreshInvoices]);

  return (
    <AppContext.Provider value={{
      invoices, loading, error, isDemoMode,
      filterStatus, searchQuery,
      toasts,
      setFilterStatus, setSearchQuery,
      loadDemo, refreshInvoices,
      updateInvoice, deleteInvoice,
      addToast, removeToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
