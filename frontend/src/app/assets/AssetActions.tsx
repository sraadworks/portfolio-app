'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { deleteAsset, updateAsset, getAssetTransactions, updateTransaction, deleteTransaction } from './actions';

export default function AssetActions({ asset }: { asset: any }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (showEdit) {
      getAssetTransactions(asset.id).then(setTransactions);
    }
  }, [showEdit, asset.id]);

  async function handleDelete() {
    setLoading(true);
    await deleteAsset(asset.id);
    setShowConfirm(false);
    setLoading(false);
  }

  async function handleAssetEdit(formData: FormData) {
    setLoading(true);
    const result = await updateAsset(asset.id, formData);
    if (!result.error) {
      setShowEdit(false);
    }
    setLoading(false);
  }

  async function handleTxEdit(txId: number, formData: FormData) {
    setLoading(true);
    await updateTransaction(txId, formData);
    const txs = await getAssetTransactions(asset.id);
    setTransactions(txs);
    setLoading(false);
  }

  async function handleTxDelete(txId: number) {
    if (!confirm('Bu işlemi silmek istediğinize emin misiniz?')) return;
    setLoading(true);
    await deleteTransaction(txId);
    const txs = await getAssetTransactions(asset.id);
    setTransactions(txs);
    setLoading(false);
  }

  return (
    <>
      <div className="flex gap-1 justify-center">
        <button
          onClick={() => setShowEdit(true)}
          className="text-slate-400 hover:text-blue-400 text-xs font-medium px-2 py-1 rounded-md hover:bg-slate-800/50 transition-colors"
          title="Düzenle"
        >
          ✏️
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="text-slate-400 hover:text-rose-400 text-xs font-medium px-2 py-1 rounded-md hover:bg-slate-800/50 transition-colors"
          title="Sil"
        >
          🗑️
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-white tracking-tight mb-2">Varlığı Sil</h3>
              <p className="text-sm text-slate-400 mb-6">
                <strong className="text-slate-200">{asset.symbol}</strong> ({asset.name}) varlığını ve tüm ilişkili işlemleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setShowConfirm(false)} 
                  className="px-4 py-2 text-sm font-medium text-slate-300 bg-transparent border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  İptal
                </button>
                <button 
                  onClick={handleDelete} 
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 border border-transparent rounded-lg hover:bg-rose-700 disabled:opacity-50 shadow-lg shadow-rose-500/20 transition-colors"
                >
                  {loading ? 'Siliniyor...' : 'Evet, Sil'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit Modal */}
      {showEdit && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setShowEdit(false)}>
          <div className="bg-[#0B0F19] border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h2 className="text-lg font-semibold text-white tracking-tight">Varlık ve İşlemleri Düzenle</h2>
              <button onClick={() => setShowEdit(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-6 flex flex-col gap-8 custom-scrollbar">
              
              {/* Asset Info Section */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Varlık Bilgileri</h3>
                <form action={handleAssetEdit} className="flex flex-col gap-4 bg-slate-900/20 p-5 rounded-xl border border-slate-800/60 shadow-inner">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Sembol</label>
                      <input required name="symbol" type="text" defaultValue={asset.symbol} className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Ad</label>
                      <input required name="name" type="text" defaultValue={asset.name} className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tip</label>
                      <select name="asset_type" defaultValue={asset.asset_type} className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                        <option value="BIST">BIST</option>
                        <option value="US">US</option>
                        <option value="FUND">FON</option>
                        <option value="ETF">ETF</option>
                        <option value="CRYPTO">CRYPTO</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Para Birimi</label>
                      <select name="currency" defaultValue={asset.currency} className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                        <option value="TRY">TRY</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Sektör / Endüstri</label>
                      <input name="sector" type="text" defaultValue={asset.sector || ''} placeholder="Örn: Havacılık" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Güncel Fiyat (Manuel, İsteğe Bağlı)</label>
                      <input name="manual_price" type="number" step="0.0001" min="0" defaultValue={asset.manual_price || ''} placeholder="Örn: 25.50" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                      <p className="text-[10px] text-slate-500 mt-1">Sadece TEFAS fonları gibi otomatik fiyatı çekilemeyen varlıklar için doldurun. Doluysa otomatik fiyat geçersiz sayılır.</p>
                    </div>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button type="submit" disabled={loading} className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors">
                      {loading ? 'Kaydediliyor...' : 'Varlığı Güncelle'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Transactions List Section */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">İşlem Geçmişi</h3>
                {transactions.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-6 bg-slate-900/20 rounded-xl border border-slate-800/60 italic">Henüz işlem bulunmuyor.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {transactions.map(tx => {
                      let badgeStyles = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                      let dotBg = 'bg-slate-500';
                      if (tx.transaction_type === 'BUY') { badgeStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'; dotBg = 'bg-emerald-500'; }
                      else if (tx.transaction_type === 'SELL') { badgeStyles = 'bg-rose-500/10 text-rose-400 border-rose-500/20'; dotBg = 'bg-rose-500'; }
                      else if (tx.transaction_type === 'DIVIDEND') { badgeStyles = 'bg-blue-500/10 text-blue-400 border-blue-500/20'; dotBg = 'bg-blue-500'; }

                      return (
                        <form key={tx.id} action={(formData) => handleTxEdit(tx.id, formData)} className="flex flex-col gap-3 p-4 border border-slate-800/60 bg-[#0B0F19] rounded-xl shadow-lg relative group hover:border-slate-700 transition-colors">
                          
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-3">
                              <span className={`inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full text-[10px] font-semibold tracking-wide border uppercase ${badgeStyles}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${dotBg}`}></span>
                                {tx.transaction_type}
                              </span>
                              <span className="text-xs text-slate-400 font-medium">{tx.date}</span>
                            </div>
                            <button type="button" onClick={() => handleTxDelete(tx.id)} disabled={loading} className="text-rose-400 hover:text-rose-300 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              Sil
                            </button>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Tarih</label>
                              <input required name="date" type="date" defaultValue={tx.date} className="w-full bg-[#0B0F19] border border-slate-800 rounded text-sm text-white px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Adet</label>
                              <input required min="0.01" step="0.01" name="amount" type="number" defaultValue={tx.amount} className="w-full bg-[#0B0F19] border border-slate-800 rounded text-sm text-white px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Birim Fiyat</label>
                              <input required min="0" step="0.0001" name="price" type="number" defaultValue={tx.price} className="w-full bg-[#0B0F19] border border-slate-800 rounded text-sm text-white px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Yönetim %</label>
                              <input min="0" step="0.01" name="commission" type="number" defaultValue={tx.commission} className="w-full bg-[#0B0F19] border border-slate-800 rounded text-sm text-white px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Stopaj %</label>
                              <input min="0" step="0.01" name="tax" type="number" defaultValue={tx.tax} className="w-full bg-[#0B0F19] border border-slate-800 rounded text-sm text-white px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                            </div>
                            <div>
                              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1.5">Arındırma %</label>
                              <input min="0" step="0.01" name="risk_margin" type="number" defaultValue={tx.risk_margin ?? 5.0} className="w-full bg-[#0B0F19] border border-slate-800 rounded text-sm text-white px-2 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-2">
                            <button type="submit" disabled={loading} className="px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors">
                              {loading ? '...' : 'İşlemi Güncelle'}
                            </button>
                          </div>

                        </form>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/40 flex justify-end">
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-transparent border border-slate-800 rounded-md hover:bg-slate-800 transition-colors">
                Kapat
              </button>
            </div>
            
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
