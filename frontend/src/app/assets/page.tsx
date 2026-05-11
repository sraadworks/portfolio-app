'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { API_URL } from '../apiConfig';
import AddAssetForm from './AddAssetForm';
import AddTransactionForm from './AddTransactionForm';
import AssetActions from './AssetActions';

export default function AssetsPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/assets/`, { cache: 'no-store' }),
      fetch(`${API_URL}/portfolios/`, { cache: 'no-store' })
    ]).then(async ([assetsRes, portfoliosRes]) => {
      if (assetsRes.ok) setAssets(await assetsRes.json());
      if (portfoliosRes.ok) setPortfolios(await portfoliosRes.json());
      setIsLoading(false);
    }).catch(err => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <span className="text-sm font-medium text-slate-500">Varlıklar yükleniyor...</span>
        </div>
      </div>
    );
  }

  const activeAssets = assets.filter(a => a.active_quantity > 0);
  const closedAssets = assets.filter(a => a.active_quantity === 0);
  const allAssets = assets; // for forms

  // Group active assets by portfolio
  const groupedAssets = activeAssets.reduce((acc: any, asset: any) => {
    const portfolio = asset.portfolio_name || 'Genel Portföy';
    if (!acc[portfolio]) acc[portfolio] = [];
    acc[portfolio].push(asset);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full max-w-7xl w-full pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Varlıklarım</h1>
          <p className="text-sm text-slate-500 mt-1">Yatırımlarınızın güncel performansı ve portföy dağılımı.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <AddTransactionForm assets={allAssets} />
          <AddAssetForm portfolios={portfolios} />
        </div>
      </div>

      {/* Search/Filter Bar Placeholder */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Varlık ara..." className="pl-9 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-sm text-[var(--text-primary)] placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full transition-all shadow-sm" />
        </div>
        <div className="flex gap-2">
          <button className="flex-1 sm:flex-none px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-sm font-bold text-slate-500 hover:text-blue-500 hover:border-blue-500 transition-all flex items-center justify-center gap-2 shadow-sm">
            <span>Filtrele</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-sm font-bold text-slate-500 hover:text-blue-500 hover:border-blue-500 transition-all flex items-center justify-center gap-2 shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* Portfolios Cards */}
      {activeAssets.length === 0 ? (
        <div className="border border-[var(--border-main)] border-dashed rounded-2xl bg-[var(--bg-card)] p-20 text-center text-slate-500 italic shadow-sm">
          Henüz aktif bir varlığınız bulunmuyor. Yeni bir varlık ekleyerek başlayın!
        </div>
      ) : (
        Object.entries(groupedAssets).map(([portfolioName, assets]: [string, any]) => (
          <div key={portfolioName} className="mb-10 border border-[var(--border-main)] rounded-2xl overflow-hidden bg-[var(--bg-card)] shadow-xl shadow-black/5 dark:shadow-black/20 transition-all hover:shadow-2xl">
            <div className="bg-slate-500/5 px-6 py-4 border-b border-[var(--border-main)] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/40"></div>
                <h2 className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em]">{portfolioName}</h2>
              </div>
              <span className="text-[10px] font-black text-slate-500 bg-slate-500/10 px-3 py-1 rounded-full uppercase tracking-wider">{assets.length} Varlık</span>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[var(--border-main)] text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-500/5">
                    <th className="px-6 py-5 font-bold text-left">Sembol</th>
                    <th className="px-6 py-5 font-bold text-left">Tip</th>
                    <th className="px-6 py-5 font-bold text-right">Adet</th>
                    <th className="px-6 py-5 font-bold text-right">Ort. Maliyet</th>
                    <th className="px-6 py-5 font-bold text-right">Güncel Fiyat</th>
                    <th className="px-6 py-5 font-bold text-right">Piyasa Değeri</th>
                    <th className="px-6 py-5 font-bold text-right">Toplam Getiri</th>
                    <th className="px-6 py-5 font-bold text-right">Reel Net Kâr</th>
                    <th className="px-6 py-5 font-bold text-center">Durum</th>
                    <th className="px-6 py-5 font-bold text-center">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-main)]/50">
                  {assets.map((asset: any) => {
                    const avgCost = asset.active_quantity > 0 ? asset.active_cost / asset.active_quantity : 0;
                    const isUSDProfit = asset.active_usd_profit >= 0;
                    const isRealProfit = asset.active_real_net_profit >= 0;
                    const currentPrice = asset.active_quantity > 0 ? asset.active_value / asset.active_quantity : 0;
                    
                    return (
                      <tr key={asset.id} className="hover:bg-[var(--bg-hover)]/30 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="font-black text-[var(--text-primary)] group-hover:text-blue-600 transition-colors text-base">{asset.symbol}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{asset.name}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/10 uppercase">
                            {asset.asset_type}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-black text-[var(--text-primary)]">{asset.active_quantity}</td>
                        <td className="px-6 py-5 text-right text-slate-500 font-medium">
                          {avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[10px] opacity-60">{asset.currency}</span>
                        </td>
                        <td className="px-6 py-5 text-right text-[var(--text-primary)] font-black">
                          {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-slate-400 text-[10px]">{asset.currency}</span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="font-black text-[var(--text-primary)] text-base">${asset.active_usd_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          <div className="text-[9px] text-slate-500 mt-1 font-bold">Maliyet: ${asset.active_usd_cost?.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className={`font-black text-base ${isUSDProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isUSDProfit ? '+' : ''}${asset.active_usd_profit?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                          <div className={`text-[10px] mt-1 font-black ${isUSDProfit ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
                            {isUSDProfit ? '▲' : '▼'} %{asset.active_usd_percent?.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className={`font-black text-base ${isRealProfit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isRealProfit ? '+' : ''}₺{asset.active_real_net_profit?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                            Açık
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <AssetActions asset={asset} portfolios={portfolios} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}

      {/* Closed Positions Section */}
      <div className="mt-12 border border-[var(--border-main)] rounded-2xl overflow-hidden bg-[var(--bg-card)] shadow-xl shadow-black/5 dark:shadow-black/20">
        <div className="bg-slate-500/5 px-6 py-4 border-b border-[var(--border-main)] flex justify-between items-center">
          <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Kapanan Pozisyonlar</h2>
          <span className="text-[10px] font-black text-slate-400 bg-slate-500/10 px-3 py-1 rounded-full uppercase tracking-wider">{closedAssets.length}</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border-main)] text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-500/5">
                <th className="px-6 py-5 font-bold text-left">Sembol</th>
                <th className="px-6 py-5 font-bold text-left">Tip</th>
                <th className="px-6 py-5 font-bold text-right">Maliyet</th>
                <th className="px-6 py-5 font-bold text-right">Satış</th>
                <th className="px-6 py-5 font-bold text-right">Net Kâr</th>
                <th className="px-6 py-5 font-bold text-right">Reel Net Kâr</th>
                <th className="px-6 py-5 font-bold text-center">Durum</th>
                <th className="px-6 py-5 font-bold text-center">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]/50">
              {closedAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 italic font-medium">Kapanmış bir pozisyonunuz bulunmuyor.</td>
                </tr>
              ) : (
                closedAssets.map((asset: any) => {
                  const isProfit = asset.total_gross_profit >= 0;
                  const isRealProfit = asset.total_real_net_profit >= 0;
                  const percent = asset.total_cost > 0 ? (asset.total_gross_profit / asset.total_cost) * 100 : 0;
                  
                  return (
                    <tr key={asset.id} className="hover:bg-[var(--bg-hover)]/30 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-black text-slate-400 dark:text-slate-500 text-base">{asset.symbol}</div>
                        <div className="text-[10px] text-slate-500">{asset.name}</div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black tracking-widest bg-slate-500/10 text-slate-400 border border-slate-500/10 uppercase">
                          {asset.asset_type}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right text-slate-500 font-bold">
                        {asset.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px] opacity-60">{asset.currency}</span>
                      </td>
                      <td className="px-6 py-5 text-right text-slate-500 font-black">
                        {(asset.total_cost + asset.total_gross_profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-[9px] opacity-60">{asset.currency}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className={`font-black text-base ${isProfit ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                          {isProfit ? '+' : ''}{asset.total_gross_profit.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-[9px] opacity-60">{asset.currency}</span>
                        </div>
                        <div className={`text-[10px] mt-1 font-black ${isProfit ? 'text-emerald-600/50' : 'text-rose-600/50'}`}>
                          {isProfit ? '▲' : '▼'} %{percent.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className={`font-black text-base ${isRealProfit ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                          {isRealProfit ? '+' : ''}₺{asset.total_real_net_profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-500/10 text-slate-400 border border-slate-500/20 uppercase tracking-widest">
                          Kapalı
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center opacity-50 hover:opacity-100 transition-opacity">
                        <AssetActions asset={asset} portfolios={portfolios} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
