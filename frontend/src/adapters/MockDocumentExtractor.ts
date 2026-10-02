import type { IDocumentExtractor, ExtractedInvoiceData } from '../types';

export class MockDocumentExtractor implements IDocumentExtractor {
  async extractInvoice(_fileKey: string): Promise<ExtractedInvoiceData> {
    // Simulate Textract processing delay
    await new Promise(r => setTimeout(r, 2000));
    return {
      invoiceNumber: { value: 'INV-NEW', confidence: 'high', source: 'Page 1 - Header', needsConfirmation: false },
      buyerName: { value: 'Sample Buyer Pvt. Ltd.', confidence: 'medium', source: 'Page 1 - Bill To', needsConfirmation: true },
      invoiceDate: { value: '2026-09-15', confidence: 'high', source: 'Page 1 - Invoice Date', needsConfirmation: false },
      invoiceAmount: { value: 50000, confidence: 'high', source: 'Page 1 - Total Amount', needsConfirmation: false },
      currency: { value: 'INR', confidence: 'high', source: 'Page 1 - Currency', needsConfirmation: false },
      paymentTermsDays: { value: null, confidence: 'low', source: 'Not found in document', needsConfirmation: true },
    };
  }
}
