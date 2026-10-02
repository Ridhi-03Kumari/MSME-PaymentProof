export function validateFileType(contentType: string): boolean {
  return ['application/pdf', 'image/jpeg', 'image/png'].includes(contentType);
}

export function validateFileSize(size: number): boolean {
  return size <= 10 * 1024 * 1024; // 10MB
}

export function sanitizeString(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, 500);
}

export function validateInvoiceAmount(value: unknown): boolean {
  const num = Number(value);
  return !isNaN(num) && num > 0 && num < 1_000_000_000;
}

export function validatePaymentTerms(value: unknown): boolean {
  if (value === null || value === undefined) return true; // Optional
  const num = Number(value);
  return !isNaN(num) && num > 0 && num <= 365;
}
