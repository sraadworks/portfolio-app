'use client';

import { useState } from 'react';
import { updateCpiEntry, deleteCpiEntry } from './actions';

export default function CpiActions({ item }: { item: any }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdate(formData: FormData) {
    setLoading(true);
    const result = await updateCpiEntry(item.id, formData);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setEditing(false);
      setError(null);
    }
  }

  async function handleDelete() {
    if (!confirm('Bu enflasyon verisini silmek istediğinize emin misiniz?')) return;
    setLoading(true);
    await deleteCpiEntry(item.id);
    setLoading(false);
  }

  if (editing) {
    return (
      <form action={handleUpdate} className="flex items-center gap-2 justify-end">
        {error && <span className="text-xs text-red-500">{error}</span>}
        <input
          required
          step="0.01"
          name="cpi_value"
          type="number"
          defaultValue={item.cpi_value}
          className="w-24 border border-slate-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button type="submit" disabled={loading} className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50">
          Kaydet
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-xs font-semibold text-slate-400 hover:text-slate-600">
          İptal
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 justify-end">
      <button
        onClick={() => setEditing(true)}
        disabled={loading}
        className="text-xs font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
      >
        Düzenle
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs font-semibold text-rose-500 hover:text-rose-700 disabled:opacity-50"
      >
        Sil
      </button>
    </div>
  );
}
