'use client';

import { useState } from 'react';
import { createCashTransaction } from './actions';

export default function CashTransactionForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');
  const [error, setError] = useState<string | null>(null);

  function openModal(t: 'DEPOSIT' | 'WITHDRAW') {
    setType(t);
    setIsOpen(true);
  }

  async function action(formData: FormData) {
    formData.append('transaction_type', type);
    const result = await createCashTransaction(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      setError(null);
    }
  }

  return (
    <>
      <div className="flex gap-3">
        <button 
          onClick={() => openModal('WITHDRAW')}
          className="bg-transparent border border-slate-800 hover:bg-slate-800/50 text-slate-300 px-4 py-2 rounded-md font-medium text-sm transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
          Para Çek
        </button>
        <button 
          onClick={() => openModal('DEPOSIT')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
          Para Yatır
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h2 className="text-lg font-semibold text-white tracking-tight">{type === 'DEPOSIT' ? 'Para Yatır' : 'Para Çek'}</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form action={action} className="p-6 flex flex-col gap-5">
              {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-md text-sm">{error}</div>}
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Kasa Seçimi (Para Birimi)</label>
                <select name="currency" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                  <option value="TRY">TRY (Türk Lirası Kasası)</option>
                  <option value="USD">USD (Döviz Kasası)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tutar</label>
                <input required min="0.01" step="0.01" name="amount" type="number" placeholder="Örn: 15000" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Açıklama (İsteğe Bağlı)</label>
                <input name="description" type="text" placeholder="Açıklama giriniz..." className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-transparent border border-slate-800 rounded-md hover:bg-slate-800 transition-colors">İptal</button>
                <button type="submit" className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md transition-colors shadow-lg ${type === 'DEPOSIT' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'}`}>İşlemi Onayla</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
