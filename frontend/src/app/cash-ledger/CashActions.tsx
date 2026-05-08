'use client';

import { useState } from 'react';
import { updateCashTransaction, deleteCashTransaction } from './actions';

export default function CashActions({ item }: { item: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // System generated transactions (BUY, SELL, DIVIDEND) should be handled with care
  const isSystemGenerated = ['BUY', 'SELL', 'DIVIDEND'].includes(item.transaction_type);

  const handleDelete = async () => {
    setLoading(true);
    await deleteCashTransaction(item.id);
    setIsDeleteOpen(false);
    setLoading(false);
  };

  const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      description: formData.get('description'),
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date'),
    };
    await updateCashTransaction(item.id, data);
    setIsEditOpen(false);
    setLoading(false);
  };

  return (
    <div className="flex gap-1 justify-end">
      <button 
        onClick={() => setIsEditOpen(true)}
        className="text-slate-400 hover:text-blue-400 transition-colors p-1 rounded-md hover:bg-slate-800/50"
        title="Düzenle"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
      </button>
      <button 
        onClick={() => setIsDeleteOpen(true)}
        className="text-slate-400 hover:text-rose-400 transition-colors p-1 rounded-md hover:bg-slate-800/50"
        title="Sil"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Edit Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={(e) => { if (e.target === e.currentTarget) setIsEditOpen(false); }}>
          <div className="bg-[#0B0F19] border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h2 className="text-lg font-semibold text-white tracking-tight">İşlemi Düzenle</h2>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleEdit} className="p-6 flex flex-col gap-5">
              {isSystemGenerated && (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-3 rounded-lg text-xs font-medium">
                  Bu işlem sistem tarafından (Alım/Satım) otomatik oluşturulmuştur. Değişiklik yaparken dikkatli olun.
                </div>
              )}
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tarih</label>
                <input required name="date" type="date" defaultValue={item.date} className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Açıklama</label>
                <input required name="description" type="text" defaultValue={item.description} className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tutar ({item.currency})</label>
                <input required step="0.01" name="amount" type="number" defaultValue={item.amount} className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                <p className="text-[10px] text-slate-500 mt-1.5">Girişler için pozitif (+), çıkışlar için negatif (-) değer girin.</p>
              </div>

              <div className="mt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsEditOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-transparent border border-slate-800 rounded-md hover:bg-slate-800 transition-colors">İptal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50 transition-colors">
                  {loading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={(e) => { if (e.target === e.currentTarget) setIsDeleteOpen(false); }}>
          <div className="bg-[#0B0F19] border border-slate-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight mb-2">İşlemi Sil?</h3>
              <p className="text-slate-400 text-sm mb-6">Bu nakit hareketini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
              <div className="flex gap-3">
                <button onClick={() => setIsDeleteOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-300 bg-transparent border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors">İptal</button>
                <button onClick={handleDelete} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-rose-600 border border-transparent rounded-lg hover:bg-rose-700 shadow-lg shadow-rose-500/20 disabled:opacity-50 transition-colors">
                  {loading ? 'Siliniyor...' : 'Evet, Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
