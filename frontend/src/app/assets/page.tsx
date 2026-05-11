import { API_URL } from "../apiConfig";
import AddAssetForm from './AddAssetForm';
import AddTransactionForm from './AddTransactionForm';
import Link from 'next/link';
import AssetActions from './AssetActions';

interface Asset {
  id: number;
  symbol: string;
  name: string;
  currency: string;
  asset_type: string;
  active_quantity: number;
  active_cost: number;
  active_value: number;
  active_usd_value: number;
  active_usd_cost: number;
  active_usd_profit: number;
  active_usd_percent: number;
  active_real_net_profit: number;
}

export default async function AssetsPage() {
  let allAssets: Asset[] = [];
  let portfolios: any[] = [];
  try {
    const [assetsRes, portfoliosRes] = await Promise.all([
      fetch(`${API_URL}/assets/`, { cache: 'no-store' }),
      fetch(`${API_URL}/portfolios/`, { cache: 'no-store' })
    ]);
    
    if (assetsRes.ok) {
      allAssets = await assetsRes.json();
    }
    if (portfoliosRes.ok) {
      portfolios = await portfoliosRes.json();
    }
  } catch (err) {
    console.error("Failed to fetch assets/portfolios:", err);
  }

  const activeAssets = allAssets.filter((a: any) => a.active_quantity > 0);
  const closedAssets = allAssets.filter((a: any) => a.active_quantity <= 0);

  const groupedAssets = activeAssets.reduce((acc: any, asset: any) => {
    const portfolio = asset.portfolio_name || 'Genel Portföy';
    if (!acc[portfolio]) acc[portfolio] = [];
    acc[portfolio].push(asset);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full max-w-7xl w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Varlıklarım</h1>
          <p className="text-sm text-slate-400 mt-1">Portföyünüzdeki tüm yatırımların performansı ve işlem geçmişi.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <AddTransactionForm assets={allAssets} />
          <AddAssetForm portfolios={portfolios} />
        </div>
      </div>

      {/* Search/Filter Bar Placeholder */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-md">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" placeholder="Varlık ara..." className="pl-9 pr-4 py-2 bg-transparent border border-slate-800 rounded-md text-sm text-white placeholder-slate-500 focus:outline-none focus:border-slate-600 focus:ring-1 focus:ring-slate-600 w-full transition-all" />
        </div>
        <div className="flex gap-2">
          <button className="flex-1 sm:flex-none px-4 py-2 bg-transparent border border-slate-800 rounded-md text-sm text-slate-300 hover:bg-slate-800/50 transition-colors flex items-center justify-center gap-2">
            <span>Filtrele</span>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button className="flex-1 sm:flex-none px-4 py-2 bg-transparent border border-slate-800 rounded-md text-sm text-slate-300 hover:bg-slate-800/50 transition-colors flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* Portfolios Cards */}
      {activeAssets.length === 0 ? (
        <div className="border border-slate-800 rounded-lg bg-[#0B0F19] p-12 text-center text-slate-500 italic">
          Henüz aktif bir varlığınız bulunmuyor.
        </div>
      ) : (
        Object.entries(groupedAssets).map(([portfolioName, assets]: [string, any]) => (
          <div key={portfolioName} className="mb-8 border border-slate-800 rounded-xl overflow-hidden bg-[#0B0F19] text-left text-sm shadow-xl shadow-black/20">
            <div className="bg-slate-900/40 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <h2 className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">{portfolioName}</h2>
              </div>
              <span className="text-[10px] font-medium text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-full">{assets.length} Varlık</span>
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-900/20">
                    <th className="px-6 py-4 font-semibold text-left">Sembol</th>
                    <th className="px-6 py-4 font-semibold text-left">Tip</th>
                    <th className="px-6 py-4 font-semibold text-right">Adet</th>
                    <th className="px-6 py-4 font-semibold text-right">Ort. Maliyet</th>
                    <th className="px-6 py-4 font-semibold text-right">Fiyat</th>
                    <th className="px-6 py-4 font-semibold text-right">USD Değer</th>
                    <th className="px-6 py-4 font-semibold text-right">USD Getiri</th>
                    <th className="px-6 py-4 font-semibold text-right">Reel Net Kâr</th>
                    <th className="px-6 py-4 font-semibold text-center">Durum</th>
                    <th className="px-6 py-4 font-semibold text-center">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset: any) => {
                    const avgCost = asset.active_quantity > 0 ? asset.active_cost / asset.active_quantity : 0;
                    const isUSDProfit = asset.active_usd_profit >= 0;
                    const currentPrice = asset.active_quantity > 0 ? asset.active_value / asset.active_quantity : 0;
                    
                    return (
                      <tr key={asset.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{asset.symbol}</div>
                          <div className="text-[10px] text-slate-500">{asset.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full text-[9px] font-bold tracking-wider bg-slate-800/50 text-slate-400 border border-slate-700/50 uppercase">
                            {asset.asset_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-white">{asset.active_quantity}</td>
                        <td className="px-6 py-4 text-right text-slate-400">
                          {avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-slate-600 text-[10px]">{asset.currency}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-white font-bold">
                          {currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-slate-600 text-[10px]">{asset.currency}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-bold text-white">${asset.active_usd_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                          <div className="text-[9px] text-slate-500 mt-0.5">Maliyet: ${asset.active_usd_cost?.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`font-bold ${isUSDProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isUSDProfit ? '+' : ''}${asset.active_usd_profit?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                          <div className={`text-[9px] mt-0.5 font-bold ${isUSDProfit ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                            {isUSDProfit ? '▲' : '▼'} %{asset.active_usd_percent?.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className={`font-bold ${asset.active_real_net_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {asset.active_real_net_profit >= 0 ? '+' : ''}₺{asset.active_real_net_profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <Link href={`/assets/${asset.id}/analysis`} className="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                            Açık
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-center">
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

      {/* Closed Assets Card */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0B0F19] text-left text-sm shadow-xl shadow-black/20 opacity-80">
        <div className="bg-slate-900/20 px-6 py-3 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Kapanan Pozisyonlar</h2>
          <span className="text-[10px] font-medium text-slate-600 bg-slate-800/30 px-2 py-0.5 rounded-full">{closedAssets.length}</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-600 uppercase tracking-widest bg-slate-900/10">
                <th className="px-6 py-4 font-semibold text-left">Sembol</th>
                <th className="px-6 py-4 font-semibold text-left">Tip</th>
                <th className="px-6 py-4 font-semibold text-right">Maliyet</th>
                <th className="px-6 py-4 font-semibold text-right">Satış</th>
                <th className="px-6 py-4 font-semibold text-right">Net Kâr (Birim)</th>
                <th className="px-6 py-4 font-semibold text-right">Reel Net Kâr</th>
                <th className="px-6 py-4 font-semibold text-center">Durum</th>
                <th className="px-6 py-4 font-semibold text-center">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {closedAssets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-600 italic">Kapanmış bir pozisyonunuz bulunmuyor.</td>
                </tr>
              ) : (
                closedAssets.map((asset: any) => {
                  const isProfit = asset.total_gross_profit >= 0;
                  const isRealProfit = asset.total_real_net_profit >= 0;
                  const percent = asset.total_cost > 0 ? (asset.total_gross_profit / asset.total_cost) * 100 : 0;
                  
                  return (
                    <tr key={asset.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-400 group-hover:text-slate-300 transition-colors">{asset.symbol}</div>
                        <div className="text-[9px] text-slate-600">{asset.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 py-0.5 px-2 rounded-full text-[9px] font-bold tracking-wider bg-slate-800/30 text-slate-500 border border-slate-700/30 uppercase">
                          {asset.asset_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500">
                        {asset.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-slate-600 text-[9px]">{asset.currency}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 font-bold">
                        {(asset.total_cost + asset.total_gross_profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-slate-600 text-[9px]">{asset.currency}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isProfit ? '+' : ''}{asset.total_gross_profit.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-[9px]">{asset.currency}</span>
                        </div>
                        <div className={`text-[9px] mt-0.5 font-bold ${isProfit ? 'text-emerald-700/70' : 'text-rose-700/70'}`}>
                          {isProfit ? '▲' : '▼'} %{percent.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`font-bold ${isRealProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isRealProfit ? '+' : ''}₺{asset.total_real_net_profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Link href={`/assets/${asset.id}/analysis`} className="inline-flex items-center gap-1.5 py-0.5 px-2.5 rounded-full text-[10px] font-bold bg-slate-800/50 text-slate-500 border border-slate-700/50 hover:bg-slate-700 transition-colors">
                          Kapalı
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-center opacity-50">
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
