'use client';

import { useState, useEffect } from 'react';
import { createTransaction } from './actions';
import { API_URL } from '../apiConfig';

export default function AddTransactionForm({ assets }: { assets: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usdRate, setUsdRate] = useState<string>('');

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
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium text-sm transition-colors"
      >
        İşlem Ekle (Al/Sat)
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Yeni İşlem Ekle</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            
            <form action={action} className="p-6 flex flex-col gap-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Varlık Seçimi</label>
                <select name="asset_id" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {assets.map((a: any) => (
                    <option key={a.id} value={a.id}>{a.symbol} - {a.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">İşlem Tipi</label>
                  <select name="transaction_type" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="BUY">AL (Buy)</option>
                    <option value="SELL">SAT (Sell)</option>
                    <option value="DIVIDEND">TEMETTÜ (Dividend)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">İşlem Tarihi</label>
                  <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adet</label>
                  <input required min="1" step="0.01" name="amount" type="number" placeholder="Örn: 100" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Birim Fiyat (Temettü ise 0)</label>
                  <input required min="0" step="0.01" name="price" type="number" placeholder="Örn: 15.50" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Yönetim Ücreti %</label>
                  <input min="0" step="0.01" name="commission" type="number" placeholder="Örn: 1.5" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Stopaj Oranı %</label>
                  <input min="0" step="0.01" name="tax" type="number" placeholder="Örn: 17.5" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-slate-700 mb-1">Arındırma Bağış %</label>
                  <input min="0" step="0.01" name="risk_margin" type="number" defaultValue="5.0" placeholder="Örn: 5" className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-blue-700 mb-1">İşlem Günü USD Kuru</label>
                  <input 
                    min="0" 
                    step="0.0001" 
                    name="usd_rate" 
                    type="number" 
                    value={usdRate}
                    onChange={(e) => setUsdRate(e.target.value)}
                    placeholder="Otomatik çekiliyor..." 
                    className="w-full border border-blue-200 bg-blue-50 rounded-md px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">İptal</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">İşlemi Onayla</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
