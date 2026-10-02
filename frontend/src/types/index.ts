export type InvoiceStatus =
  | 'draft'
  | 'needs_confirmation'
  | 'due_soon'
  | 'overdue'
  | 'paid'
  | 'evidence_incomplete';

export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'manual';

export type EvidenceStatus = 'available' | 'missing' | 'needs_review';

export interface Evidence {
  invoice: EvidenceStatus;
  purchaseOrder: EvidenceStatus;
  proofOfDelivery: EvidenceStatus;
  paymentCommunication: EvidenceStatus;
  paymentReceipt: EvidenceStatus;
}

export interface SourceReference {
  documentName: string;
  page?: number;
  field: string;
  quotedText?: string;
}

export interface ExtractedField<T = string> {
  value: T | null;
  confidence: ConfidenceLevel;
  source: string;
  needsConfirmation: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  buyerName: string;
  invoiceDate: string; // ISO date string YYYY-MM-DD
  invoiceAmount: number;
  currency: string;
  paymentTermsDays: number | null;
  dueDate: string | null; // ISO date string or null if terms missing
  status: InvoiceStatus;
  daysOverdue: number; // 0 if not overdue
  evidence: Evidence;
  sourceReferences: SourceReference[];
  confidence: ConfidenceLevel;
  reminderDraft?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalOutstanding: number;
  openInvoices: number;
  overdueInvoices: number;
  dueSoonInvoices: number;
  incompleteEvidenceInvoices: number;
}

// Adapter interfaces for AWS-ready / mock swap
export interface IStorageAdapter {
  getUploadUrl(invoiceId: string, fileName: string, fileType: string): Promise<{ uploadUrl: string; fileKey: string }>;
  getDownloadUrl(fileKey: string): Promise<string>;
  deleteFile(fileKey: string): Promise<void>;
}

export interface IInvoiceRepository {
  listInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<Invoice | null>;
  createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice>;
  updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice>;
  deleteInvoice(id: string): Promise<void>;
}

export interface IDocumentExtractor {
  extractInvoice(fileKey: string): Promise<ExtractedInvoiceData>;
}

export interface ExtractedInvoiceData {
  invoiceNumber: ExtractedField<string>;
  buyerName: ExtractedField<string>;
  invoiceDate: ExtractedField<string>;
  invoiceAmount: ExtractedField<number>;
  currency: ExtractedField<string>;
  paymentTermsDays: ExtractedField<number>;
}

export interface IAuthAdapter {
  getCurrentUser(): Promise<{ id: string; email: string; businessName: string } | null>;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

export type FilterStatus = 'all' | InvoiceStatus;
