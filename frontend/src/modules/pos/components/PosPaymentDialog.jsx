import React, { useState } from 'react';
import { createPOSSale } from '../../../api/apiClient';

export default function PosPaymentDialog({ total }) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePay = async (method) => {
    if (saving) return;
    setSaving(true);
    setMessage('');
    setError('');

    try {
      // For now, record a simple POS sale with no specific items/customer.
      await createPOSSale({ customer_id: null, items: [], total });
      setMessage(`Sale recorded via ${method}.`);
    } catch (err) {
      setError(err.message || 'Failed to record sale');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm">
      <h3 className="text-md font-medium">Payment</h3>
      <p className="mt-1 text-gray-700">Amount due: ${total}</p>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      {message && !error && <p className="mt-2 text-xs text-emerald-700">{message}</p>}
      <div className="mt-2 grid gap-2 md:grid-cols-3">
        <button
          type="button"
          onClick={() => handlePay('Cash')}
          disabled={saving}
          className="rounded bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          Cash
        </button>
        <button
          type="button"
          onClick={() => handlePay('Mobile Money')}
          disabled={saving}
          className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          Mobile Money
        </button>
        <button
          type="button"
          onClick={() => handlePay('Card')}
          disabled={saving}
          className="rounded bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          Card
        </button>
      </div>
    </div>
  );
}
