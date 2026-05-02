'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

function fmt(val: number) {
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AssetDetailModal({ asset }: { asset: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const avgCost = asset.active_quantity > 0 ? asset.active_cost / asset.active_quantity : 0;
  const hasRealized = asset.realized_revenue > 0;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-blue-600 hover:text-blue-800 text-xs font-semibold px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
      >
        Özet
      </button>

      {isOpen && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4" onClick={() => setIsOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            
            {/* Header */}
            <div className="bg-slate-800 px-6 py-5 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-2xl font-black">{asset.symbol}</div>
                  <div className="text-sm text-slate-300">{asset.name}</div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white text-xl font-bold">×</button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {asset.active_quantity > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Aktif Pozisyon</h3>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Güncel Değer</span>
                    <span className="text-sm font-bold">{fmt(asset.active_value)} {asset.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Aktif Brüt Kâr</span>
                    <span className={`text-sm font-bold ${asset.active_gross_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {asset.active_gross_profit >= 0 ? '+' : ''}{fmt(asset.active_gross_profit)} {asset.currency}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-500 text-sm py-2">Bu varlık tamamen satılmıştır.</div>
              )}

              {hasRealized && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Geçmiş Satışlar</h3>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Satışlardan Kâr</span>
                    <span className={`text-sm font-bold ${asset.realized_gross_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {asset.realized_gross_profit >= 0 ? '+' : ''}{fmt(asset.realized_gross_profit)} {asset.currency}
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                <Link href={`/assets/${asset.id}/analysis`} target="_blank" onClick={() => setIsOpen(false)} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
                  Detaylı Analiz Raporu
                </Link>
              </div>
            </div>

          </div>
        </div>
      , document.body)}
    </>
  );
}
