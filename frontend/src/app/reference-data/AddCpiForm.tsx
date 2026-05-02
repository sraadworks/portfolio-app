'use client';

import { useState } from 'react';
import { addCpiEntry } from './actions';

export default function AddCpiForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    const result = await addCpiEntry(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      setError(null);
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
      >
        Enflasyon Oranı Ekle
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Aylık Enflasyon Oranı Ekle</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            
            <form action={action} className="p-6 flex flex-col gap-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Ay (Tarih Seçimi)</label>
                <input required name="date" type="month" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-slate-400 mt-1">Enflasyonun açıklandığı ayı seçiniz.</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Para Birimi</label>
                <select name="currency" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="TRY">TRY (TL Enflasyonu)</option>
                  <option value="USD">USD (Dolar Enflasyonu)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aylık Enflasyon Oranı (%)</label>
                <input required step="0.01" name="cpi_value" type="number" placeholder="Örn: 2.90" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-slate-400 mt-1">İlgili para birimi için açıklanan aylık enflasyon oranını giriniz. Ör: %0.5 ise <strong>0.50</strong> yazınız.</p>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">İptal</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
