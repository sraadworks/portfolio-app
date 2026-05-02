import PerformanceChart from './PerformanceChart';
import DistributionChart from './DistributionChart';

async function getAssets() {
  const res = await fetch('http://127.0.0.1:8000/assets/', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

async function getCashSummary() {
  const res = await fetch('http://127.0.0.1:8000/cash-ledger/summary', { cache: 'no-store' });
  if (!res.ok) return { TRY: 0, USD: 0 };
  return res.json();
}

async function getPerformanceData() {
  const res = await fetch('http://127.0.0.1:8000/portfolio/performance', { cache: 'no-store' });
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
  const totalTRYGrossProfit = tryAssets.reduce((acc: number, curr: any) => acc + (curr.active_gross_profit || 0), 0);
  const totalTRYRealProfit = tryAssets.reduce((acc: number, curr: any) => acc + (curr.active_real_net_profit || 0), 0);
  
  const totalUSDValue = usdAssets.reduce((acc: number, curr: any) => acc + (curr.active_value || 0), 0);
  const totalUSDGrossProfit = usdAssets.reduce((acc: number, curr: any) => acc + (curr.active_gross_profit || 0), 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">Net Değer</h1>
          <div className="text-sm font-medium text-blue-100 mb-6">Tüm varlıklar ve nakit kasalarınızın özeti</div>
          
          <div className="flex gap-12">
            <div>
              <div className="text-sm text-blue-200 mb-1">TL Varlıkları (Kasa + Yatırım)</div>
              <div className="text-3xl font-bold">₺{(totalCashTRY + totalTRYValue).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
              <div className="flex gap-2 mt-2">
                <div className={`text-xs font-medium px-2 py-1 inline-block rounded-md ${totalTRYGrossProfit >= 0 ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}`}>
                  Brüt: {totalTRYGrossProfit >= 0 ? '+' : ''}{Math.abs(totalTRYGrossProfit).toLocaleString('tr-TR', { minimumFractionDigits: 0 })} ₺
                </div>
                <div className={`text-xs font-medium px-2 py-1 inline-block rounded-md ${totalTRYRealProfit >= 0 ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}`}>
                  Reel: {totalTRYRealProfit >= 0 ? '+' : ''}{Math.abs(totalTRYRealProfit).toLocaleString('tr-TR', { minimumFractionDigits: 0 })} ₺
                </div>
              </div>
            </div>
            <div className="w-px bg-white/20"></div>
            <div>
              <div className="text-sm text-blue-200 mb-1">Döviz Varlıkları (Kasa + Yatırım)</div>
              <div className="text-3xl font-bold">${(totalCashUSD + totalUSDValue).toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
              <div className={`text-sm mt-2 font-medium px-2 py-1 inline-block rounded-md ${totalUSDGrossProfit >= 0 ? 'bg-emerald-500/20 text-emerald-200' : 'bg-rose-500/20 text-rose-200'}`}>
                {totalUSDGrossProfit >= 0 ? '▲' : '▼'} {Math.abs(totalUSDGrossProfit).toLocaleString('en-US', { minimumFractionDigits: 2 })} $ Getiri
              </div>
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
