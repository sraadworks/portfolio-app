'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createTransaction } from './actions';
import { API_URL } from '../apiConfig';

export default function AddTransactionForm({ assets }: { assets: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usdRate, setUsdRate] = useState<string>('');
  const router = useRouter();

  const fetchUsdRate = async () => {
    try {
      const res = await fetch(`${API_URL}/market-data/usd-rate`);
      const data = await res.json();
      if (data.rate) {
        setUsdRate(data.rate.toString());
      }
    } catch (e) {
      console.error('USD rate fetch failed', e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsdRate();
    }
  }, [isOpen]);

  async function action(formData: FormData) {
    const result = await createTransaction(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      setError(null);
      setUsdRate('');
      router.refresh();
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-transparent border border-slate-800 hover:bg-slate-800/50 text-slate-300 px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        İşlem Ekle (Al/Sat)
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h2 className="text-lg font-semibold text-white tracking-tight">Yeni İşlem Ekle</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form action={action} className="p-6 flex flex-col gap-5">
              {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-md text-sm">{error}</div>}
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Varlık Seçimi</label>
                <select name="asset_id" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                  {assets.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.symbol} - {a.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">İşlem Tipi</label>
                  <select name="transaction_type" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                    <option value="BUY">AL (Buy)</option>
                    <option value="SELL">SAT (Sell)</option>
                    <option value="DIVIDEND">TEMETTÜ (Dividend)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">İşlem Tarihi</label>
                  <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Adet</label>
                  <input required min="1" step="0.01" name="amount" type="number" placeholder="Örn: 100" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Birim Fiyat</label>
                  <input required min="0" step="0.01" name="price" type="number" placeholder="Örn: 15.50" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Yönetim Ücreti %</label>
                  <input min="0" step="0.01" name="commission" type="number" placeholder="Örn: 1.5" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Stopaj Oranı %</label>
                  <input min="0" step="0.01" name="tax" type="number" placeholder="Örn: 17.5" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Arındırma Bağış %</label>
                  <input min="0" step="0.01" name="risk_margin" type="number" defaultValue="5.0" placeholder="Örn: 5" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">İşlem Günü USD Kuru</label>
                  <input 
                    min="0" 
                    step="0.0001" 
                    name="usd_rate" 
                    type="number" 
                    value={usdRate}
                    onChange={(e) => setUsdRate(e.target.value)}
                    placeholder="Otomatik çekiliyor..." 
                    className="w-full bg-blue-500/10 border border-blue-500/30 rounded-md px-3 py-2 text-sm text-blue-100 placeholder-blue-300/50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                  />
                </div>
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-transparent border border-slate-800 rounded-md hover:bg-slate-800 transition-colors">İptal</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-colors">İşlemi Onayla</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
