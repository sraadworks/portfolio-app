'use client';

import { useState } from 'react';
import { createAsset } from './actions';

export default function AddAssetForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function action(formData: FormData) {
    const result = await createAsset(formData);
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
        Yeni Varlık Ekle
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">Yeni Varlık Ekle</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            
            <form action={action} className="p-6 flex flex-col gap-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sembol (Örn: THYAO, AAPL)</label>
                <input required name="symbol" type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Varlık Adı</label>
                <input required name="name" type="text" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
                <select name="asset_type" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="BIST">BIST Hisse</option>
                  <option value="US">ABD Hisse</option>
                  <option value="FUND">Yatırım Fonu (TEFAS)</option>
                  <option value="ETF">ETF</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sektör / Endüstri</label>
                <input name="sector" type="text" placeholder="Örn: Havacılık, Bankacılık" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
                <select name="currency" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="TRY">TRY (Türk Lirası)</option>
                  <option value="USD">USD (Dolar)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Güncel Fiyat (Manuel, İsteğe Bağlı)</label>
                <input name="manual_price" type="number" step="0.0001" min="0" placeholder="Örn: 25.50" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <p className="text-xs text-gray-400 mt-1">Sadece TEFAS fonları gibi otomatik fiyatı çekilemeyen varlıklar için doldurun.</p>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">İptal</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
