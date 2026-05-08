'use client';

import { API_URL } from "../apiConfig";
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
    <div className="flex gap-3">
      <div className="flex bg-slate-900/40 p-1 rounded-xl mr-2 border border-slate-800/60">
        <button onClick={() => handleSync('BIST100')} disabled={loading} className="px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-all">BIST100 SYNC</button>
        <button onClick={() => handleSync('SP500')} disabled={loading} className="px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-all">SP500 SYNC</button>
        <button onClick={() => handleSync('GOLD')} disabled={loading} className="px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-all">GOLD SYNC</button>
        <button onClick={() => handleSync('USDTRY')} disabled={loading} className="px-3 py-1.5 text-[10px] font-bold text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-all">USDTRY SYNC</button>
      </div>

      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 border border-transparent"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-7-7v14"/></svg>
        Piyasa Verisi Ekle
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false); }}>
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h2 className="text-lg font-semibold text-white tracking-tight">Endeks Verisi Ekle</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-xl transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tarih</label>
                <input required name="date" type="date" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Endeks / Varlık Adı</label>
                <select required name="name" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                  <option value="BIST100">BIST 100</option>
                  <option value="ALTIN">Gram Altın (TRY)</option>
                  <option value="S&P 500">S&P 500</option>
                  <option value="USD/TRY">USD/TRY</option>
                  <option value="BITCOIN">Bitcoin (USD)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Değer (Endeks veya Fiyat)</label>
                <input required step="0.0001" name="value" type="number" placeholder="Örn: 9250.45" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              </div>

              <div className="pt-2 flex gap-3 justify-end">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-transparent border border-slate-800 rounded-md hover:bg-slate-800 transition-colors">İptal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-colors">
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
