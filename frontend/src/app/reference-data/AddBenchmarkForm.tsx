import { API_URL } from "../apiConfig";
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddBenchmarkForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      date: formData.get('date'),
      name: formData.get('name'),
      value: parseFloat(formData.get('value') as string),
    };

    const res = await fetch(`${API_URL}/benchmark-data/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      setIsOpen(false);
      router.refresh();
    }
    setLoading(false);
  }

  async function handleSync(name: string) {
    setLoading(true);
    const res = await fetch(`${API_URL}/benchmark-data/sync/${name}`);
    if (res.ok) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex gap-2">
      <div className="flex bg-slate-100 p-1 rounded-xl mr-2">
        <button onClick={() => handleSync('BIST100')} disabled={loading} className="px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm rounded-lg transition-all">BIST100 SYNC</button>
        <button onClick={() => handleSync('SP500')} disabled={loading} className="px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm rounded-lg transition-all">SP500 SYNC</button>
        <button onClick={() => handleSync('GOLD')} disabled={loading} className="px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm rounded-lg transition-all">GOLD SYNC</button>
        <button onClick={() => handleSync('USDTRY')} disabled={loading} className="px-3 py-1.5 text-[10px] font-bold text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm rounded-lg transition-all">USDTRY SYNC</button>
      </div>

      <button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14"/></svg>
        Piyasa Verisi Ekle
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-800">Endeks Verisi Ekle</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl transition-colors">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Tarih</label>
                <input required name="date" type="date" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Endeks / Varlık Adı</label>
                <select required name="name" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all">
                  <option value="BIST100">BIST 100</option>
                  <option value="ALTIN">Gram Altın (TRY)</option>
                  <option value="S&P 500">S&P 500</option>
                  <option value="USD/TRY">USD/TRY</option>
                  <option value="BITCOIN">Bitcoin (USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Değer (Endeks veya Fiyat)</label>
                <input required step="0.0001" name="value" type="number" placeholder="Örn: 9250.45" className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="flex-1 px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">İptal</button>
                <button type="submit" disabled={loading} className="flex-1 px-6 py-3 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 disabled:opacity-50 transition-all">
                  {loading ? 'Kaydediliyor...' : 'Veriyi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
