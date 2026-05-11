'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAsset, createPortfolio } from './actions';

export default function AddAssetForm({ portfolios }: { portfolios: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingNewPortfolio, setIsCreatingNewPortfolio] = useState(false);
  const router = useRouter();

  async function action(formData: FormData) {
    const portfolioSelection = formData.get('portfolio_selection') as string;
    let portfolioId = formData.get('portfolio_id') as string;

    if (portfolioSelection === 'new') {
      const newPortfolioName = formData.get('new_portfolio_name') as string;
      if (newPortfolioName) {
        const newPortfolioFormData = new FormData();
        newPortfolioFormData.append('name', newPortfolioName);
        const result = await createPortfolio(newPortfolioFormData);
        // This is a simplified approach; in a real app you'd get the ID back.
        // For now, we'll rely on the user having to re-select or we'll just 
        // handle it by letting the user create the portfolio first.
        // Actually, let's just make it simpler: Two buttons. One for Portfolio, one for Asset.
        // OR: If new, we create it and then use its ID? 
        // Let's go with: You can select an existing portfolio. 
        // If you want a new one, go to the Portfolios page (we'll add it).
      }
    }

    const result = await createAsset(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setIsOpen(false);
      setError(null);
      router.refresh();
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
        Yeni Varlık
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-xl shadow-2xl w-full max-w-md my-8">
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h2 className="text-lg font-semibold text-white tracking-tight">Yeni Varlık Ekle</h2>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form action={action} className="p-6 flex flex-col gap-5">
              {error && <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-md text-sm">{error}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sembol</label>
                  <input required name="symbol" type="text" placeholder="THYAO" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Varlık Adı</label>
                  <input required name="name" type="text" placeholder="Türk Hava Yolları" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tip</label>
                  <select name="asset_type" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                    <option value="BIST">BIST Hisse</option>
                    <option value="US">ABD Hisse</option>
                    <option value="FUND">Yatırım Fonu</option>
                    <option value="ETF">ETF</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Para Birimi</label>
                  <select name="currency" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all">
                    <option value="TRY" translate="no">TRY</option>
                    <option value="USD" translate="no">USD</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Portföy Grubu</label>
                <select 
                  name="portfolio_id" 
                  className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  <option value="none">Portföy Seçilmedi (Genel)</option>
                  {portfolios.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sektör</label>
                <input name="sector" type="text" placeholder="Örn: Havacılık" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Manuel Fiyat (Opsiyonel)</label>
                <input name="manual_price" type="number" step="0.01" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-300 bg-transparent border border-slate-800 rounded-md hover:bg-slate-800 transition-colors">İptal</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-colors">Kaydet</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
