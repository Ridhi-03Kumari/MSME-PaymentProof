import { useState, useEffect } from 'react';
import { generateReminderDraft } from '../lib/calculations';
import type { Invoice } from '../types';

export function ReminderDraft({ invoice, onSave }: { invoice: Invoice; onSave?: (draft: string) => void }) {
  const [draft, setDraft] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDraft(generateReminderDraft(invoice));
  }, [invoice]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Follow-up Draft</h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
            aria-label="Copy draft to clipboard"
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
          {onSave && (
            <button
              onClick={() => onSave(draft)}
              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Save draft
            </button>
          )}
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
        ⚠️ Review and edit this message before sending. Do not send automatically.
      </div>
      <textarea
        value={draft}
        onChange={e => setDraft(e.target.value)}
        rows={12}
        className="w-full border border-gray-300 rounded-xl p-4 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        aria-label="Editable follow-up draft"
      />
    </div>
  );
}
