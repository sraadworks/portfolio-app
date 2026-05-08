'use client';

import { useEffect, useState } from 'react';
import { API_URL } from './apiConfig';

interface Asset {
  id: number;
  symbol: string;
  name: string;
  currency: string;
  asset_type: string;
  active_value: number;
  active_cost: number;
  active_gross_profit: number;
  active_real_net_profit: number;
  active_usd_profit: number;
  active_usd_cost: number;
  active_usd_value: number;
}

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [assetsRes, cashRes, perfRes] = await Promise.all([
          fetch(`${API_URL}/assets/`),
          fetch(`${API_URL}/cash-ledger/summary`),
          fetch(`${API_URL}/portfolio/performance`)
        ]);

        const assets = await assetsRes.json();
        const cashSummary = await cashRes.json();
        const performancePayload = await perfRes.json();

        setData({ assets, cashSummary, performancePayload });
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold">Portföy Yükleniyor...</div>;
  if (!data) return <div className="p-10 text-center text-rose-500">Veri alınamadı.</div>;

  const { assets, cashSummary, performancePayload } = data;
  const totalCashTRY = cashSummary.TRY;
  const totalCashUSD = cashSummary.USD;

  const tryAssets = assets.filter((a: Asset) => a.currency === 'TRY');
  const usdAssets = assets.filter((a: Asset) => a.currency === 'USD');

  // TRY Metrics
  const totalTRYValue = tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_value || 0), 0);
  const totalTRYCost = tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_cost || 0), 0);
  const totalTRYGrossProfit = tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_gross_profit || 0), 0);
  const totalTRYRealProfit = tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_real_net_profit || 0), 0);
  const tryPercent = totalTRYCost > 0 ? (totalTRYGrossProfit / totalTRYCost) * 100 : 0;
  
  const totalTRYUSDProfit = tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_usd_profit || 0), 0);
  const totalTRYUSDCost = tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_usd_cost || 0), 0);
  const tryUSDPercent = totalTRYUSDCost > 0 ? (totalTRYUSDProfit / totalTRYUSDCost) * 100 : 0;

  // USD Metrics
  const totalUSDValue = usdAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_value || 0), 0) + 
                       tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_usd_value || 0), 0);
  
  const totalUSDCost = usdAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_cost || 0), 0) + 
                       tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_usd_cost || 0), 0);
  
  const totalUSDProfit = totalUSDValue - totalUSDCost;
  const usdPercent = totalUSDCost > 0 ? (totalUSDProfit / totalUSDCost) * 100 : 0;

  // Prepare Distribution Data
  const assetDistribution = assets.map((a: Asset) => ({
    name: a.symbol,
    value: a.currency === 'TRY' ? a.active_value : a.active_value * 32.5,
  }));
  if (totalCashTRY > 0) assetDistribution.push({ name: 'Nakit (TL)', value: totalCashTRY });
  if (totalCashUSD > 0) assetDistribution.push({ name: 'Nakit (USD)', value: totalCashUSD * 32.5 });

  return (
    <div className="flex flex-col h-full max-w-6xl">
      {/* Header Area */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Portföy Özeti</h1>
          <p className="text-sm text-slate-400 mt-1">Son güncelleme: {new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</p>
        </div>
        <div className="flex gap-4">
          {/* Optional Filter/Action Buttons Placeholder */}
          <button className="px-4 py-2 border border-slate-800 bg-slate-900/50 hover:bg-slate-800 rounded-md text-sm font-medium text-slate-300 transition-colors">
            Filtreler
          </button>
        </div>
      </div>

      {/* Main KPI Board */}
      <div className="border border-slate-800/60 rounded-xl overflow-hidden bg-[#0B0F19] shadow-2xl shadow-black/50">
        
        {/* ROW 1: PRIMARY METRIC (TL VALUE) */}
        <div className="p-8 border-b border-slate-800/60 hover:bg-slate-800/20 transition-colors relative group">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Toplam TL Varlık
            <svg className="w-3.5 h-3.5 text-slate-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="flex items-end gap-5">
            <div className="text-5xl font-semibold text-white tracking-tight">
              ₺{totalTRYValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
            <div className={`flex items-center gap-1.5 text-base font-medium pb-1.5 ${tryPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {tryPercent >= 0 ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              )}
              %{Math.abs(tryPercent).toFixed(2)}
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-500 font-medium">
            Brüt Kâr: <span className={totalTRYGrossProfit >= 0 ? "text-emerald-500/80" : "text-rose-500/80"}>
              {totalTRYGrossProfit >= 0 ? "+" : ""}₺{totalTRYGrossProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
          </div>
        </div>

        {/* ROW 2: SPLIT METRICS (USD & CASH) */}
        <div className="grid grid-cols-2 border-b border-slate-800/60">
          <div className="p-8 border-r border-slate-800/60 hover:bg-slate-800/20 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Toplam USD Portföy
            </div>
            <div className="flex items-end gap-4">
              <div className="text-4xl font-semibold text-white tracking-tight">
                ${totalUSDValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium pb-1 ${usdPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {usdPercent >= 0 ? '▲' : '▼'} %{Math.abs(usdPercent).toFixed(2)}
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-500 font-medium">
              Net USD Kâr: <span className={totalUSDProfit >= 0 ? "text-emerald-500/80" : "text-rose-500/80"}>
                {totalUSDProfit >= 0 ? "+" : ""}${totalUSDProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
            </div>
          </div>

          <div className="p-8 hover:bg-slate-800/20 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Toplam Nakit
            </div>
            <div className="text-4xl font-semibold text-white tracking-tight">
              ₺{totalCashTRY.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
            <div className="mt-3 text-sm text-slate-500 font-medium">
              USD Kasa: <span className="text-blue-400/80">${totalCashUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

        {/* ROW 3: HEALTH INDICATORS */}
        <div className="grid grid-cols-2">
          <div className="p-8 border-r border-slate-800/60 hover:bg-slate-800/20 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Reel Getiri (Enflasyon Arındırılmış)
            </div>
            <div className={`text-3xl font-semibold tracking-tight ${totalTRYRealProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalTRYRealProfit >= 0 ? "+" : ""}₺{totalTRYRealProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
            <div className="mt-4 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${totalTRYRealProfit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                style={{ width: `${Math.min(100, Math.max(0, Math.abs(tryPercent)))}%` }}
              />
            </div>
          </div>

          <div className="p-8 hover:bg-slate-800/20 transition-colors">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              TL Varlıkların Döviz (USD) Performansı
            </div>
            <div className={`text-3xl font-semibold tracking-tight ${tryUSDPercent >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
              {tryUSDPercent >= 0 ? "+" : ""}%{tryUSDPercent.toFixed(2)}
            </div>
            <div className="mt-4 w-full h-1 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${tryUSDPercent >= 0 ? 'bg-blue-500' : 'bg-rose-500'}`} 
                style={{ width: `${Math.min(100, Math.max(0, Math.abs(tryUSDPercent)))}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
