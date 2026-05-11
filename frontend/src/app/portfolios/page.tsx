'use client';

import { useState, useEffect } from 'react';
import { API_URL } from '../apiConfig';
import { createPortfolio, deletePortfolio } from '../assets/actions';

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  async function fetchPortfolios() {
    try {
      const res = await fetch(`${API_URL}/portfolios/`, { cache: 'no-store' });
      if (res.ok) {
        setPortfolios(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(formData: FormData) {
    const result = await createPortfolio(formData);
    if (result.error) {
      setError(result.error);
    } else {
      setError(null);
      fetchPortfolios();
      (document.getElementById('portfolio-form') as HTMLFormElement)?.reset();
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Bu portföyü silmek istediğinize emin misiniz? Varlıklar silinmeyecek, sadece genel gruba taşınacaktır.')) return;
    const result = await deletePortfolio(id);
    if (result.error) {
      alert(result.error);
    } else {
      fetchPortfolios();
    }
  }

  return (
    <div className="max-w-4xl w-full">
      <h1 className="text-2xl font-semibold text-white tracking-tight mb-2">Portföy Gruplarım</h1>
      <p className="text-sm text-slate-400 mb-8">Varlıklarınızı mantıksal gruplara ayırarak daha düzenli takip edin.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Column 1: New Portfolio Form */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-xl p-6 h-fit">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Yeni Portföy Oluştur</h2>
          <form id="portfolio-form" action={handleCreate} className="flex flex-col gap-4">
            {error && <div className="text-xs text-rose-400 bg-rose-400/10 border border-rose-400/20 p-2 rounded">{error}</div>}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Portföy Adı</label>
              <input required name="name" type="text" placeholder="Örn: BIST Yan Tahta" className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5 font-medium">Açıklama (Opsiyonel)</label>
              <textarea name="description" rows={3} placeholder="Bu portföyün amacı..." className="w-full bg-[#0B0F19] border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-all" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium transition-colors shadow-lg shadow-blue-500/20">Oluştur</button>
          </form>
        </div>

        {/* Column 2: Portfolio List */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Mevcut Portföyler</h2>
          {isLoading ? (
            <div className="text-slate-500 text-sm italic">Yükleniyor...</div>
          ) : portfolios.length === 0 ? (
            <div className="text-slate-500 text-sm italic bg-slate-900/40 border border-dashed border-slate-800 rounded-xl p-8 text-center">Henüz bir portföy grubu oluşturulmadı.</div>
          ) : (
            portfolios.map(p => (
              <div key={p.id} className="bg-[#0B0F19] border border-slate-800 rounded-xl p-4 flex justify-between items-center group hover:border-slate-700 transition-all">
                <div>
                  <h3 className="text-sm font-semibold text-white">{p.name}</h3>
                  {p.description && <p className="text-xs text-slate-500 mt-1">{p.description}</p>}
                </div>
                <button onClick={() => handleDelete(p.id)} className="text-slate-600 hover:text-rose-500 p-2 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
