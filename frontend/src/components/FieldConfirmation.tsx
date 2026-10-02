import { useState } from 'react';
import type { ConfidenceLevel } from '../types';

const confidenceColors: Record<ConfidenceLevel, string> = {
  high: 'text-green-600',
  medium: 'text-amber-600',
  low: 'text-red-600',
  manual: 'text-blue-600',
};

const confidenceLabels: Record<ConfidenceLevel, string> = {
  high: 'High confidence',
  medium: 'Medium confidence — please verify',
  low: 'Low confidence — needs confirmation',
  manual: 'Manually entered',
};

interface FieldConfirmationProps {
  label: string;
  value: string | number | null;
  confidence: ConfidenceLevel;
  source: string;
  needsConfirmation: boolean;
  onConfirm?: (value: string) => void;
}

export function FieldConfirmation({ label, value, confidence, source, needsConfirmation, onConfirm }: FieldConfirmationProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value ?? ''));
  const [confirmed, setConfirmed] = useState(!needsConfirmation && confidence === 'high');

  const displayValue = value !== null ? String(value) : null;

  const handleConfirm = () => {
    setConfirmed(true);
    setEditing(false);
    onConfirm?.(editValue);
  };

  const handleEdit = () => {
    setEditValue(String(value ?? ''));
    setEditing(true);
    setConfirmed(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          {editing ? (
            <input
              type="text"
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              className="mt-1 border border-blue-400 rounded px-2 py-1 text-sm w-full"
              aria-label={`Edit ${label}`}
              autoFocus
            />
          ) : (
            <p className="mt-1 text-base font-semibold text-gray-900">
              {displayValue ?? <span className="text-purple-600 italic">Needs confirmation</span>}
            </p>
          )}
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {editing ? (
            <>
              <button onClick={handleConfirm} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">Save</button>
              <button onClick={() => setEditing(false)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Cancel</button>
            </>
          ) : (
            <>
              {!confirmed && (
                <button onClick={handleConfirm} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">Confirm</button>
              )}
              <button onClick={handleEdit} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200">Edit</button>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 text-xs">
        <span className={`font-medium ${confidenceColors[confidence]}`}>{confidenceLabels[confidence]}</span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-500">Source: {source}</span>
        {confirmed && <span className="text-green-600 font-medium">✓ Confirmed</span>}
      </div>
    </div>
  );
}
