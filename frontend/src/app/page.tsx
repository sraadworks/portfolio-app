import PerformanceChart from './PerformanceChart';
import DistributionChart from './DistributionChart';
import { API_URL } from './apiConfig';

async function getAssets() {
  const res = await fetch(`${API_URL}/assets/`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

async function getCashSummary() {
  const res = await fetch(`${API_URL}/cash-ledger/summary`, { cache: 'no-store' });
  if (!res.ok) return { TRY: 0, USD: 0 };
  return res.json();
}

async function getPerformanceData() {
  const res = await fetch(`${API_URL}/portfolio/performance`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function Home() {
  const assets = await getAssets();
  const cashSummary = await getCashSummary();
  const performanceData = await getPerformanceData();

  const totalCashTRY = cashSummary.TRY;
  const totalCashUSD = cashSummary.USD;

  const activeAssets = assets.filter((a: any) => a.active_quantity > 0);

  // Calculate portfolio totals (converting USD to TRY for total view using a dummy rate if no live rate)
  // For MVP, just sum up the TRY assets and USD assets separately, or we can just show Total Value for TRY assets.
  const tryAssets = assets.filter((a: any) => a.currency === 'TRY');
  const usdAssets = assets.filter((a: any) => a.currency === 'USD');

  const totalTRYValue = tryAssets.reduce((acc: number, curr: any) => acc + (curr.active_value || 0), 0);
  const totalTRYCost = tryAssets.reduce((acc: number, curr: any) => acc + (curr.active_cost || 0), 0);
  const totalTRYGrossProfit = tryAssets.reduce((acc: number, curr: any) => acc + (curr.active_gross_profit || 0), 0);
  const totalTRYRealProfit = tryAssets.reduce((acc: number, curr: any) => acc + (curr.active_real_net_profit || 0), 0);
  const tryPercent = totalTRYCost > 0 ? (totalTRYGrossProfit / totalTRYCost) * 100 : 0;
  
  const totalUSDValue = usdAssets.reduce((acc: number, curr: any) => acc + (curr.active_value || 0), 0) + 
                       tryAssets.reduce((acc: number, curr: any) => acc + (curr.active_usd_value || 0), 0);
  
  const totalUSDCost = usdAssets.reduce((acc: number, curr: any) => acc + (curr.active_cost || 0), 0) + 
                       tryAssets.reduce((acc: number, curr: any) => acc + (curr.active_usd_cost || 0), 0);
  
  const totalUSDProfit = totalUSDValue - totalUSDCost;
  const usdPercent = totalUSDCost > 0 ? (totalUSDProfit / totalUSDCost) * 100 : 0;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10 w-full">
          <h1 className="text-3xl font-extrabold tracking-tight mb-6">Yatırım Performansı Özet</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <div className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">TL YATIRIMLAR</div>
              <div className="flex items-baseline gap-3">
                <div className="text-4xl font-black">₺{totalTRYGrossProfit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                <div className={`text-sm font-bold px-2 py-0.5 rounded ${tryPercent >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {tryPercent >= 0 ? '▲' : '▼'} %{Math.abs(tryPercent).toFixed(2)}
                </div>
              </div>
              <div className="text-sm text-blue-100/60 mt-2 font-medium">Toplam Portföy: ₺{totalTRYValue.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}</div>
              <div className="flex gap-2 mt-3">
                <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${totalTRYRealProfit >= 0 ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10' : 'border-rose-500/30 text-rose-300 bg-rose-500/10'}`}>
                  REEL: {totalTRYRealProfit >= 0 ? '+' : ''}{totalTRYRealProfit.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} ₺
                </div>
              </div>
            </div>

            <div className="md:border-l md:border-white/10 md:pl-12">
              <div className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">DÖVİZ YATIRIMLAR</div>
              <div className="flex items-baseline gap-3">
                <div className="text-4xl font-black">${totalUSDProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                <div className={`text-sm font-bold px-2 py-0.5 rounded ${usdPercent >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {usdPercent >= 0 ? '▲' : '▼'} %{Math.abs(usdPercent).toFixed(2)}
                </div>
              </div>
              <div className="text-sm text-blue-100/60 mt-2 font-medium">Toplam Portföy: ${totalUSDValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Toplam Varlık Sayısı</div>
          <div className="text-4xl font-black text-gray-800 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">{assets.length} <span className="text-xl text-gray-400 font-medium">Adet</span></div>
        </div>
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Nakit (TL)</div>
          <div className="text-3xl font-bold text-gray-900">₺{totalCashTRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-white/70 backdrop-blur-md p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider mb-2">Nakit (USD)</div>
          <div className="text-3xl font-bold text-gray-900">${totalCashUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PerformanceChart performancePayload={performanceData} />
        </div>
        <div className="lg:col-span-1">
          <DistributionChart assets={activeAssets} cashSummary={cashSummary} />
        </div>
      </div>
    </div>
  );
}
