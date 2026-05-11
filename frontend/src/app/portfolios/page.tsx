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
      <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight mb-2">Portföy Gruplarım</h1>
      <p className="text-sm text-slate-500 mb-8">Varlıklarınızı mantıksal gruplara ayırarak daha düzenli takip edin.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Column 1: New Portfolio Form */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-8 h-fit shadow-xl shadow-black/5 dark:shadow-black/20">
          <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-6">Yeni Portföy Oluştur</h2>
          <form id="portfolio-form" action={handleCreate} className="flex flex-col gap-5">
            {error && <div className="text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg font-medium">{error}</div>}
            <div>
              <label className="block text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Portföy Adı</label>
              <input required name="name" type="text" placeholder="Örn: BIST Yan Tahta" className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-2 font-bold uppercase tracking-wider">Açıklama (Opsiyonel)</label>
              <textarea name="description" rows={3} placeholder="Bu portföyün amacı..." className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-sm font-bold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98]">Portföy Oluştur</button>
          </form>
        </div>

        {/* Column 2: Portfolio List */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-2 px-2">Mevcut Portföyler</h2>
          {isLoading ? (
            <div className="text-slate-500 text-sm italic p-4">Yükleniyor...</div>
          ) : portfolios.length === 0 ? (
            <div className="text-slate-500 text-sm italic bg-[var(--bg-card)] border border-dashed border-[var(--border-main)] rounded-2xl p-10 text-center">Henüz bir portföy grubu oluşturulmadı.</div>
          ) : (
            portfolios.map(p => (
              <div key={p.id} className="bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl p-5 flex justify-between items-center group hover:border-blue-500/50 hover:shadow-lg hover:shadow-black/5 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                    {p.name[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">{p.name}</h3>
                    {p.description && <p className="text-xs text-slate-500 mt-0.5">{p.description}</p>}
                  </div>
                </div>
                <button onClick={() => handleDelete(p.id)} className="text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 p-2.5 rounded-lg transition-all active:scale-90">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
