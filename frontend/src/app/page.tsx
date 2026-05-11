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

export default async function Home() {
  let data: any = null;

  try {
    const [assetsRes, cashRes, perfRes] = await Promise.all([
      fetch(`${API_URL}/assets/`, { cache: 'no-store' }),
      fetch(`${API_URL}/cash-ledger/summary`, { cache: 'no-store' }),
      fetch(`${API_URL}/portfolio/performance`, { cache: 'no-store' })
    ]);

    if (assetsRes.ok && cashRes.ok && perfRes.ok) {
      const assets = await assetsRes.json();
      const cashSummary = await cashRes.json();
      const performancePayload = await perfRes.json();
      data = { assets, cashSummary, performancePayload };
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }

  if (!data) return <div className="p-10 text-center text-rose-500">Veri alınamadı veya sunucuya bağlanılamadı.</div>;

  const { assets, cashSummary, performancePayload } = data;
  const totalCashTRY = cashSummary?.TRY || 0;
  const totalCashUSD = cashSummary?.USD || 0;

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

  return (
    <div className="flex flex-col h-full max-w-6xl w-full">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] tracking-tight">Portföy Özeti</h1>
          <p className="text-sm text-slate-500 mt-1">Son güncelleme: {new Date().toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' })}</p>
        </div>
        <div className="flex gap-4">
          <button className="px-4 py-2 border border-[var(--border-main)] bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] rounded-md text-sm font-medium text-[var(--text-secondary)] transition-colors">
            Filtreler
          </button>
        </div>
      </div>

      {/* Main KPI Board */}
      <div className="border border-[var(--border-main)] rounded-2xl overflow-hidden bg-[var(--bg-card)] shadow-xl shadow-black/5 dark:shadow-black/40 transition-colors duration-300">
        
        {/* ROW 1: PRIMARY METRIC (TL VALUE) */}
        <div className="p-8 border-b border-[var(--border-main)] hover:bg-[var(--bg-hover)]/30 transition-colors relative group">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
            Toplam TL Varlık
            <svg className="w-3.5 h-3.5 text-slate-400 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div className="flex flex-wrap items-end gap-5">
            <div className="text-5xl font-bold text-[var(--text-primary)] tracking-tight">
              ₺{totalTRYValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
            <div className={`flex items-center gap-1.5 text-lg font-bold pb-1.5 ${tryPercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {tryPercent >= 0 ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
              )}
              %{Math.abs(tryPercent).toFixed(2)}
            </div>
          </div>
          <div className="mt-3 text-sm text-slate-500 font-semibold">
            Brüt Kâr: <span className={totalTRYGrossProfit >= 0 ? "text-emerald-600" : "text-rose-600"}>
              {totalTRYGrossProfit >= 0 ? "+" : ""}₺{totalTRYGrossProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
          </div>
        </div>

        {/* ROW 2: SPLIT METRICS (USD & CASH) */}
        <div className="grid grid-cols-1 md:grid-cols-2 border-b border-[var(--border-main)]">
          <div className="p-8 border-b md:border-b-0 md:border-r border-[var(--border-main)] hover:bg-[var(--bg-hover)]/30 transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Toplam USD Portföy
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <div className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
                ${totalUSDValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold pb-1 ${usdPercent >= 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                {usdPercent >= 0 ? '▲' : '▼'} %{Math.abs(usdPercent).toFixed(2)}
              </div>
            </div>
            <div className="mt-3 text-sm text-slate-500 font-semibold">
              Net USD Kâr: <span className={totalUSDProfit >= 0 ? "text-emerald-600" : "text-rose-600"}>
                {totalUSDProfit >= 0 ? "+" : ""}${totalUSDProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
            </div>
          </div>

          <div className="p-8 hover:bg-[var(--bg-hover)]/30 transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Toplam Nakit
            </div>
            <div className="text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              ₺{totalCashTRY.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
            <div className="mt-3 text-sm text-slate-500 font-semibold">
              USD Kasa: <span className="text-blue-500/80">${totalCashUSD.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
            </div>
          </div>
        </div>

        {/* ROW 3: HEALTH INDICATORS */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 border-b md:border-b-0 md:border-r border-[var(--border-main)] hover:bg-[var(--bg-hover)]/30 transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              Reel Getiri (Enflasyon Arındırılmış)
            </div>
            <div className={`text-3xl font-bold tracking-tight ${totalTRYRealProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {totalTRYRealProfit >= 0 ? "+" : ""}₺{totalTRYRealProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
            <div className="mt-4 w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${totalTRYRealProfit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                style={{ width: `${Math.min(100, Math.max(0, Math.abs(tryPercent)))}%` }}
              />
            </div>
          </div>

          <div className="p-8 hover:bg-[var(--bg-hover)]/30 transition-colors">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
              TL Varlıkların Döviz (USD) Performansı
            </div>
            <div className={`text-3xl font-bold tracking-tight ${tryUSDPercent >= 0 ? 'text-blue-500' : 'text-rose-500'}`}>
              {tryUSDPercent >= 0 ? "+" : ""}%{tryUSDPercent.toFixed(2)}
            </div>
            <div className="mt-4 w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
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
