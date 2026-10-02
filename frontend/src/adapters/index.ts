import { MockStorageAdapter } from './MockStorageAdapter';
import { MockInvoiceRepository } from './MockInvoiceRepository';
import { MockDocumentExtractor } from './MockDocumentExtractor';
import { MockAuthAdapter } from './MockAuthAdapter';

const IS_DEMO_MODE = true; // Set to false and swap adapters when AWS is configured

export const storageAdapter = new MockStorageAdapter();
export const invoiceRepository = new MockInvoiceRepository();
export const documentExtractor = new MockDocumentExtractor();
export const authAdapter = new MockAuthAdapter();
export { IS_DEMO_MODE };
