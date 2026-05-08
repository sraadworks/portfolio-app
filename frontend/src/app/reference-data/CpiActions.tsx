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
        {error && <span className="text-xs text-rose-400">{error}</span>}
        <input
          required
          step="0.01"
          name="cpi_value"
          type="number"
          defaultValue={item.cpi_value}
          className="w-24 bg-[#0B0F19] border border-slate-700 rounded px-2 py-1 text-sm text-white text-right focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
        <button type="submit" disabled={loading} className="text-xs font-medium text-blue-400 hover:text-blue-300 disabled:opacity-50 px-2 py-1 bg-blue-500/10 rounded border border-blue-500/20 transition-colors">
          Kaydet
        </button>
        <button type="button" onClick={() => setEditing(false)} className="text-xs font-medium text-slate-400 hover:text-slate-300 px-2 py-1 bg-transparent rounded border border-slate-700 transition-colors">
          İptal
        </button>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={() => setEditing(true)}
        disabled={loading}
        className="text-xs font-medium text-slate-400 hover:text-blue-400 disabled:opacity-50 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
      >
        Düzenle
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs font-medium text-slate-400 hover:text-rose-400 disabled:opacity-50 px-2 py-1 rounded hover:bg-slate-800 transition-colors"
      >
        Sil
      </button>
    </div>
  );
}
