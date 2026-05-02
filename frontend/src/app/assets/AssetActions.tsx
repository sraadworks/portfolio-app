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
          className="text-slate-400 hover:text-blue-600 text-xs font-medium px-1.5 py-1 rounded hover:bg-blue-50 transition-colors"
          title="Düzenle"
        >
          ✏️
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          className="text-slate-400 hover:text-rose-600 text-xs font-medium px-1.5 py-1 rounded hover:bg-rose-50 transition-colors"
          title="Sil"
        >
          🗑️
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setShowConfirm(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Varlığı Sil</h3>
              <p className="text-sm text-slate-500 mb-6">
                <strong>{asset.symbol}</strong> ({asset.name}) varlığını ve tüm ilişkili işlemleri silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3 justify-center">
                <button 
                  onClick={() => setShowConfirm(false)} 
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  İptal
                </button>
                <button 
                  onClick={handleDelete} 
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setShowEdit(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Varlık ve İşlemleri Düzenle</h2>
              <button onClick={() => setShowEdit(false)} className="text-slate-400 hover:text-slate-600 text-xl">&times;</button>
            </div>
            
            <div className="overflow-y-auto p-6 flex flex-col gap-8">
              
              {/* Asset Info Section */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Varlık Bilgileri</h3>
                <form action={handleAssetEdit} className="flex flex-col gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Sembol</label>
                      <input required name="symbol" type="text" defaultValue={asset.symbol} className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Ad</label>
                      <input required name="name" type="text" defaultValue={asset.name} className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Tip</label>
                      <select name="asset_type" defaultValue={asset.asset_type} className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="BIST">BIST</option>
                        <option value="US">US</option>
                        <option value="FUND">FON</option>
                        <option value="ETF">ETF</option>
                        <option value="CRYPTO">CRYPTO</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Para Birimi</label>
                      <select name="currency" defaultValue={asset.currency} className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="TRY">TRY</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Sektör / Endüstri</label>
                      <input name="sector" type="text" defaultValue={asset.sector || ''} placeholder="Örn: Havacılık" className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Güncel Fiyat (Manuel, İsteğe Bağlı)</label>
                      <input name="manual_price" type="number" step="0.0001" min="0" defaultValue={asset.manual_price || ''} placeholder="Örn: 25.50" className="w-full border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <p className="text-[10px] text-slate-400 mt-1">Sadece TEFAS fonları gibi otomatik fiyatı çekilemeyen varlıklar için doldurun. Doluysa otomatik fiyat geçersiz sayılır.</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={loading} className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 rounded-md hover:bg-slate-900 disabled:opacity-50">
                      {loading ? 'Kaydediliyor...' : 'Varlığı Güncelle'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Transactions List Section */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">İşlem Geçmişi</h3>
                {transactions.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-slate-100">Henüz işlem bulunmuyor.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {transactions.map(tx => (
                      <form key={tx.id} action={(formData) => handleTxEdit(tx.id, formData)} className="flex flex-col gap-3 p-4 border border-slate-200 rounded-xl shadow-sm relative group">
                        
                        <div className="flex justify-between items-center mb-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tx.transaction_type === 'BUY' ? 'bg-emerald-100 text-emerald-700' : tx.transaction_type === 'SELL' ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                              {tx.transaction_type}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">{tx.date}</span>
                          </div>
                          <button type="button" onClick={() => handleTxDelete(tx.id)} disabled={loading} className="text-rose-400 hover:text-rose-600 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Sil
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tarih</label>
                            <input required name="date" type="date" defaultValue={tx.date} className="w-full border border-slate-300 rounded text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Adet</label>
                            <input required min="0.01" step="0.01" name="amount" type="number" defaultValue={tx.amount} className="w-full border border-slate-300 rounded text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Birim Fiyat</label>
                            <input required min="0" step="0.0001" name="price" type="number" defaultValue={tx.price} className="w-full border border-slate-300 rounded text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Yönetim %</label>
                            <input min="0" step="0.01" name="commission" type="number" defaultValue={tx.commission} className="w-full border border-slate-300 rounded text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Stopaj %</label>
                            <input min="0" step="0.01" name="tax" type="number" defaultValue={tx.tax} className="w-full border border-slate-300 rounded text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Arındırma Bağış %</label>
                            <input min="0" step="0.01" name="risk_margin" type="number" defaultValue={tx.risk_margin ?? 5.0} className="w-full border border-slate-300 rounded text-sm px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-1">
                          <button type="submit" disabled={loading} className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50">
                            {loading ? '...' : 'İşlemi Güncelle'}
                          </button>
                        </div>

                      </form>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button onClick={() => setShowEdit(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100">
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
