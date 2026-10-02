export type InvoiceStatus =
  | 'draft'
  | 'needs_confirmation'
  | 'due_soon'
  | 'overdue'
  | 'paid'
  | 'evidence_incomplete';

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

export interface Invoice {
  userId: string;
  invoiceId: string;
  invoiceNumber: string;
  buyerName: string;
  invoiceDate: string;
  invoiceAmount: number;
  currency: string;
  paymentTermsDays: number | null;
  dueDate: string | null;
  status: InvoiceStatus;
  daysOverdue: number;
  evidence: Evidence;
  sourceReferences: SourceReference[];
  confidence: 'high' | 'medium' | 'low' | 'manual';
  fileKey?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  reminderDraft?: string;
}
