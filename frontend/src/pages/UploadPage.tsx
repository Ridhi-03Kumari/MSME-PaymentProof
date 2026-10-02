import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UploadDropzone } from '../components/UploadDropzone';
import { FieldConfirmation } from '../components/FieldConfirmation';
import { LoadingState } from '../components/LoadingState';
import { useApp } from '../context/AppContext';
import { documentExtractor, storageAdapter } from '../adapters';
import type { ExtractedInvoiceData } from '../types';
import { calculateDueDate, calculateDaysOverdue, getTodayDate, calculateStatus } from '../lib/calculations';
import { invoiceRepository } from '../adapters';

export function UploadPage() {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const [stage, setStage] = useState<'upload' | 'extracting' | 'confirm' | 'saving'>('upload');
  const [extracted, setExtracted] = useState<ExtractedInvoiceData | null>(null);

  const handleInvoiceFile = async (file: File) => {
    try {
      setStage('extracting');
      const tempId = `temp-${Date.now()}`;
      const { fileKey: key } = await storageAdapter.getUploadUrl(tempId, file.name, file.type);
      const data = await documentExtractor.extractInvoice(key);
      setExtracted(data);
      setStage('confirm');
    } catch (e) {
      addToast('error', 'Failed to process file. Please try again.');
      setStage('upload');
    }
  };

  const handleSave = async () => {
    if (!extracted) return;
    setStage('saving');
    try {
      const invoiceDate = extracted.invoiceDate.value ?? new Date().toISOString().split('T')[0];
      const paymentTermsDays = extracted.paymentTermsDays.value;
      const dueDate = paymentTermsDays ? calculateDueDate(invoiceDate, paymentTermsDays) : null;
      const daysOverdue = dueDate ? calculateDaysOverdue(dueDate, getTodayDate()) : 0;

      const evidence = {
        invoice: 'available' as const,
        purchaseOrder: 'missing' as const,
        proofOfDelivery: 'missing' as const,
        paymentCommunication: 'missing' as const,
        paymentReceipt: 'missing' as const,
      };

      const status = calculateStatus({ paymentTermsDays, dueDate, daysOverdue, evidence });

      await invoiceRepository.createInvoice({
        invoiceNumber: extracted.invoiceNumber.value ?? 'UNKNOWN',
        buyerName: extracted.buyerName.value ?? 'Unknown Buyer',
        invoiceDate,
        invoiceAmount: extracted.invoiceAmount.value ?? 0,
        currency: extracted.currency.value ?? 'INR',
        paymentTermsDays,
        dueDate,
        status,
        daysOverdue,
        evidence,
        sourceReferences: [],
        confidence: extracted.invoiceNumber.confidence,
      });

      addToast('success', 'Invoice saved successfully.');
      navigate('/dashboard');
    } catch (e) {
      addToast('error', 'Failed to save invoice.');
      setStage('confirm');
    }
  };

  if (stage === 'extracting') return <LoadingState message="Extracting information from your document…" />;
  if (stage === 'saving') return <LoadingState message="Saving invoice…" />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Link to="/dashboard" className="text-sm text-blue-600 hover:underline">← Back to dashboard</Link>
        <h1 className="text-2xl font-bold text-navy-900 mt-2">Upload Invoice</h1>
        <p className="text-sm text-gray-500">Upload your invoice and supporting documents. Information will be extracted automatically.</p>
      </div>

      {stage === 'upload' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Invoice (required)</h2>
            <UploadDropzone label="Invoice PDF or image" onFile={handleInvoiceFile} />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900">Supporting documents (optional)</h2>
            <UploadDropzone label="Purchase Order" onFile={async () => {}} optional />
            <UploadDropzone label="Proof of Delivery" onFile={async () => {}} optional />
          </div>
          <p className="text-xs text-gray-400">
            Files are stored privately. Temporary access URLs expire after 5 minutes.
          </p>
        </div>
      )}

      {stage === 'confirm' && extracted && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 font-medium">Review the extracted information below. Confirm or edit each field.</p>
          </div>
          <div className="space-y-3">
            <FieldConfirmation label="Invoice Number" value={extracted.invoiceNumber.value} confidence={extracted.invoiceNumber.confidence} source={extracted.invoiceNumber.source} needsConfirmation={extracted.invoiceNumber.needsConfirmation} />
            <FieldConfirmation label="Buyer Name" value={extracted.buyerName.value} confidence={extracted.buyerName.confidence} source={extracted.buyerName.source} needsConfirmation={extracted.buyerName.needsConfirmation} />
            <FieldConfirmation label="Invoice Date" value={extracted.invoiceDate.value} confidence={extracted.invoiceDate.confidence} source={extracted.invoiceDate.source} needsConfirmation={extracted.invoiceDate.needsConfirmation} />
            <FieldConfirmation label="Amount" value={extracted.invoiceAmount.value !== null ? `₹${extracted.invoiceAmount.value?.toLocaleString('en-IN')}` : null} confidence={extracted.invoiceAmount.confidence} source={extracted.invoiceAmount.source} needsConfirmation={extracted.invoiceAmount.needsConfirmation} />
            <FieldConfirmation label="Payment Terms (days)" value={extracted.paymentTermsDays.value} confidence={extracted.paymentTermsDays.confidence} source={extracted.paymentTermsDays.source} needsConfirmation={extracted.paymentTermsDays.needsConfirmation} />
          </div>
          <div className="flex gap-3">
            <button onClick={handleSave} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">Save Invoice</button>
            <button onClick={() => setStage('upload')} className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200">Back</button>
          </div>
        </div>
      )}
    </div>
  );
}
