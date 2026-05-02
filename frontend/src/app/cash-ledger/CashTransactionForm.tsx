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
      <div className="flex gap-2">
        <button 
          onClick={() => openModal('WITHDRAW')}
          className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          Para Çek
        </button>
        <button 
          onClick={() => openModal('DEPOSIT')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
        >
          Para Yatır
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">{type === 'DEPOSIT' ? 'Para Yatır' : 'Para Çek'}</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            
            <form action={action} className="p-6 flex flex-col gap-4">
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kasa Seçimi (Para Birimi)</label>
                <select name="currency" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="TRY">TRY (Türk Lirası Kasası)</option>
                  <option value="USD">USD (Döviz Kasası)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tutar</label>
                <input required min="0.01" step="0.01" name="amount" type="number" placeholder="Örn: 15000" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama (İsteğe Bağlı)</label>
                <input name="description" type="text" placeholder="Açıklama giriniz..." className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">İptal</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">İşlemi Onayla</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
