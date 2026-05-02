import AddAssetForm from './AddAssetForm';
import AddTransactionForm from './AddTransactionForm';
import AssetDetailModal from './AssetDetailModal';
import AssetActions from './AssetActions';

async function getAssets() {
  const res = await fetch('http://127.0.0.1:8000/assets/', { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function AssetsPage() {
  const allAssets = await getAssets();
  
  const activeAssets = allAssets.filter((a: any) => a.active_quantity > 0);
  const closedAssets = allAssets.filter((a: any) => a.active_quantity <= 0);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Varlıklar</h1>
          <p className="text-slate-500 mt-1">Portföyünüzdeki tüm aktif yatırımlar ve geçmiş işlemleriniz.</p>
        </div>
        <div className="flex gap-2">
          <AddTransactionForm assets={allAssets} />
          <AddAssetForm />
        </div>
      </div>
      
      {/* 1. AKTİF VARLIKLAR */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          Aktif Varlıklar (Mevcut Portföy)
        </h2>
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-base uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-bold">Sembol</th>
                  <th className="px-6 py-4 font-bold">Adı</th>
                  <th className="px-6 py-4 font-bold">Tip</th>
                  <th className="px-6 py-4 font-bold text-right">Adet</th>
                  <th className="px-6 py-4 font-bold text-right">Ort. Maliyet</th>
                  <th className="px-6 py-4 font-bold text-right">Güncel Fiyat</th>
                  <th className="px-6 py-4 font-bold text-right">Aktif Brüt Kâr</th>
                  <th className="px-6 py-4 font-bold text-right">Reel Net Kâr</th>
                  <th className="px-6 py-4 font-bold text-center">Detay</th>
                  <th className="px-6 py-4 font-bold text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody className="text-lg divide-y divide-slate-100">
                {activeAssets.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Henüz aktif bir varlığınız bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  activeAssets.map((asset: any) => {
                    const avgCost = asset.active_cost / asset.active_quantity;
                    const isGrossProfit = asset.active_gross_profit >= 0;
                    const isRealProfit = asset.active_real_net_profit >= 0;
                    return (
                    <tr key={asset.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-900">{asset.symbol}</td>
                      <td className="px-6 py-4 text-slate-600 font-medium">{asset.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs font-semibold">{asset.asset_type}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-700">{asset.active_quantity}</td>
                      <td className="px-6 py-4 text-right text-slate-500">{avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {asset.currency}</td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-900">
                        <div className="flex flex-col items-end">
                          <span>{asset.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {asset.currency}</span>
                          {asset.manual_price > 0 && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1">Manuel</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`font-bold ${isGrossProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isGrossProfit ? '+' : ''}{asset.active_gross_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs font-medium mt-0.5 ${isGrossProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isGrossProfit ? '▲' : '▼'} {Math.abs(asset.active_profit_loss_percent).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`font-bold ${isRealProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isRealProfit ? '+' : ''}{asset.active_real_net_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">Enflasyon düzeltilmiş</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <AssetDetailModal asset={asset} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <AssetActions asset={asset} />
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

      {/* 2. KAPANAN POZİSYONLAR */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
          Kapanan Pozisyonlar (İşlem Geçmişi)
        </h2>
        <div className="bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden grayscale-[30%] opacity-90">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-base uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-bold">Sembol</th>
                  <th className="px-6 py-4 font-bold">Adı</th>
                  <th className="px-6 py-4 font-bold">Tip</th>
                  <th className="px-6 py-4 font-bold text-right">Toplam Maliyet</th>
                  <th className="px-6 py-4 font-bold text-right">Satış Geliri</th>
                  <th className="px-6 py-4 font-bold text-right">Gerçekleşen Kâr</th>
                  <th className="px-6 py-4 font-bold text-right">Reel Net Kâr</th>
                  <th className="px-6 py-4 font-bold text-center">Detay</th>
                  <th className="px-6 py-4 font-bold text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody className="text-lg divide-y divide-slate-100">
                {closedAssets.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Kapanmış bir pozisyonunuz bulunmuyor.
                    </td>
                  </tr>
                ) : (
                  closedAssets.map((asset: any) => {
                    const isProfit = asset.total_gross_profit >= 0;
                    const isRealProfit = asset.total_real_net_profit >= 0;
                    const percent = asset.total_cost > 0 ? (asset.total_gross_profit / asset.total_cost) * 100 : 0;
                    
                    return (
                    <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-700">{asset.symbol}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{asset.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-semibold">{asset.asset_type}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-500">{asset.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {asset.currency}</td>
                      <td className="px-6 py-4 text-right font-medium text-slate-700">
                        {(asset.total_cost + asset.total_gross_profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {asset.currency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`font-bold ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isProfit ? '+' : ''}{asset.total_gross_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-xs font-medium mt-0.5 ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {isProfit ? '▲' : '▼'} {Math.abs(percent).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className={`font-bold ${isRealProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {isRealProfit ? '+' : ''}{asset.total_real_net_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">Enflasyon düzeltilmiş</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <AssetDetailModal asset={asset} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <AssetActions asset={asset} />
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
    </div>
  );
}
