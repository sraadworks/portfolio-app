import { API_URL } from "../../../apiConfig";
import Link from 'next/link';

async function getAsset(id: string) {
  const res = await fetch(`${API_URL}/assets/`, { cache: 'no-store' });
  const assets = await res.json();
  return assets.find((a: any) => a.id.toString() === id);
}

async function getTransactions(id: string) {
  const res = await fetch(`${API_URL}/transactions/${id}`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

function fmt(val: number) {
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default async function AssetAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAsset(id);
  const transactions = await getTransactions(id);

  if (!asset) {
    return <div className="p-10 text-center">Varlık bulunamadı.</div>;
  }

  // Calculate monthly percentage
  let monthlyPercent = 0;
  const buyTxs = transactions.filter((t: any) => t.transaction_type === 'BUY');
  if (buyTxs.length > 0) {
    // Sort to find the first buy date
    const sortedBuys = [...buyTxs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstBuyDate = new Date(sortedBuys[0].date);
    
    // Determine end date: if fully sold, the last sell date. Otherwise, today.
    let endDate = new Date();
    if (asset.active_quantity === 0) {
      const sellTxs = transactions.filter((t: any) => t.transaction_type === 'SELL');
      if (sellTxs.length > 0) {
        const sortedSells = [...sellTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        endDate = new Date(sortedSells[0].date);
      }
    }
    
    const daysDiff = (endDate.getTime() - firstBuyDate.getTime()) / (1000 * 3600 * 24);
    const months = daysDiff / 30.44; // Average days in month
    
    if (months > 0 && asset.total_cost > 0) {
      const totalPercent = (asset.total_gross_profit / asset.total_cost) * 100;
      monthlyPercent = totalPercent / months;
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/assets" className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full flex items-center justify-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900">{asset.symbol}</h1>
            <p className="text-slate-500 font-medium">{asset.name} · {asset.asset_type}</p>
          </div>
        </div>
      </div>

      {/* TOP CARDS: TOTAL HISTORY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Toplam Yatırım (Maliyet)</div>
          <div className="text-2xl font-black text-slate-800">{fmt(asset.total_cost)} {asset.currency}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Toplam Gerçekleşen Gelir</div>
          <div className="text-2xl font-black text-slate-800">{fmt(asset.realized_revenue)} {asset.currency}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Toplam Brüt Kâr</div>
          <div className={`text-2xl font-black ${asset.total_gross_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {asset.total_gross_profit >= 0 ? '+' : ''}{fmt(asset.total_gross_profit)} {asset.currency}
          </div>
          <div className="text-sm font-medium text-slate-500 mt-1">
            Yatırım Getirisi: <span className={asset.total_gross_profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}>{(asset.total_cost > 0 ? (asset.total_gross_profit / asset.total_cost * 100) : 0).toFixed(2)}%</span>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 shadow-lg text-white">
          <div className="text-xs text-slate-300 font-bold uppercase tracking-wider mb-1">Reel Net Kâr (Tarihsel)</div>
          <div className={`text-3xl font-black ${asset.total_real_net_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {asset.total_real_net_profit >= 0 ? '+' : ''}{fmt(asset.total_real_net_profit)} <span className="text-lg">{asset.currency}</span>
          </div>
          <div className="text-sm text-slate-400 mt-1 flex justify-between items-center">
            <span>Enflasyon Düşülmüş</span>
            <span className="font-bold bg-white/10 px-2 py-0.5 rounded text-xs">{monthlyPercent > 0 ? '+' : ''}{monthlyPercent.toFixed(2)}% Aylık Getiri</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AKTİF POZİSYON */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-4 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <h2 className="font-bold text-emerald-900">Aktif (Gerçekleşmeyen) Pozisyon</h2>
          </div>
          <div className="p-6 space-y-4">
            {asset.active_quantity > 0 ? (
              <>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Kalan Adet</span>
                  <span className="font-bold">{asset.active_quantity}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Güncel Fiyat</span>
                  <span className="font-bold">{fmt(asset.current_price)} {asset.currency}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Aktif Maliyet (Ana Para)</span>
                  <span className="font-bold text-slate-700">{fmt(asset.active_cost)} {asset.currency}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Güncel Toplam Değer</span>
                  <span className="font-bold text-slate-900">{fmt(asset.active_value)} {asset.currency}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Elde Tutma Süresi (Yaş)</span>
                  <span className="font-bold text-slate-600">{asset.active_holding_days} Gün</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-slate-50 -mx-2 px-2 rounded">
                  <span className="text-sm font-semibold text-slate-700">Aktif Brüt Kâr</span>
                  <span className={`font-bold ${asset.active_gross_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {asset.active_gross_profit >= 0 ? '+' : ''}{fmt(asset.active_gross_profit)} {asset.currency}
                  </span>
                </div>
                {asset.active_gross_profit - asset.active_net_profit > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50 text-slate-500">
                    <span className="text-sm font-medium">Tahmini Giderler (Vergi/Komisyon)</span>
                    <span className="font-bold">-{fmt(asset.active_gross_profit - asset.active_net_profit)} {asset.currency}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-slate-50 text-amber-700">
                  <span className="text-sm font-medium">Bu Kısmın Enflasyon Erimesi</span>
                  <span className="font-bold">-{fmt(asset.active_inflation_diff)} {asset.currency}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-slate-900">Aktif Reel Kâr</span>
                  <span className={`font-black ${asset.active_real_net_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {asset.active_real_net_profit >= 0 ? '+' : ''}{fmt(asset.active_real_net_profit)} {asset.currency}
                  </span>
                </div>
                {asset.risk_margin_rate > 0 && asset.active_real_net_profit > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-slate-100 text-indigo-600 mt-2 bg-indigo-50 -mx-2 px-2 rounded">
                    <span className="text-sm font-medium">Arındırma (Kârdan %{asset.risk_margin_rate} Bağış)</span>
                    <span className="font-bold">-{fmt(asset.active_real_net_profit - asset.active_risk_margin_profit)} {asset.currency}</span>
                  </div>
                )}
                {asset.risk_margin_rate > 0 && asset.active_real_net_profit > 0 && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-slate-900">Arındırılmış Nihai Kâr</span>
                    <span className={`font-black ${asset.active_risk_margin_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {asset.active_risk_margin_profit >= 0 ? '+' : ''}{fmt(asset.active_risk_margin_profit)} {asset.currency}
                    </span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-slate-400 py-10">
                Bu varlığa ait aktif pozisyon bulunmamaktadır (Tamamı satılmış).
              </div>
            )}
          </div>
        </div>

        {/* KAPANAN POZİSYON */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
            <h2 className="font-bold text-slate-700">Kapanan (Gerçekleşen) İşlemler</h2>
          </div>
          <div className="p-6 space-y-4">
            {asset.realized_revenue > 0 ? (
              <>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Satılan Kısmın Maliyeti</span>
                  <span className="font-bold text-slate-700">{fmt(asset.realized_cost)} {asset.currency}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Satışlardan Elde Edilen Gelir</span>
                  <span className="font-bold text-slate-900">{fmt(asset.realized_revenue)} {asset.currency}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm text-slate-500">Elde Tutma Süresi (Yaş)</span>
                  <span className="font-bold text-slate-600">{asset.realized_holding_days} Gün</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-slate-50 -mx-2 px-2 rounded">
                  <span className="text-sm font-semibold text-slate-700">Kesinleşen Brüt Kâr</span>
                  <span className={`font-bold ${asset.realized_gross_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {asset.realized_gross_profit >= 0 ? '+' : ''}{fmt(asset.realized_gross_profit)} {asset.currency}
                  </span>
                </div>
                {asset.realized_gross_profit - asset.realized_net_profit > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-slate-50 text-slate-500">
                    <span className="text-sm font-medium">Ödenen Giderler (Vergi/Komisyon)</span>
                    <span className="font-bold">-{fmt(asset.realized_gross_profit - asset.realized_net_profit)} {asset.currency}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-slate-50 text-amber-700">
                  <span className="text-sm font-medium">Satış Tarihindeki Enflasyon Erimesi</span>
                  <span className="font-bold">-{fmt(asset.realized_inflation_diff)} {asset.currency}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-sm font-bold text-slate-900">Gerçekleşen Reel Kâr</span>
                  <span className={`font-black ${asset.realized_real_net_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {asset.realized_real_net_profit >= 0 ? '+' : ''}{fmt(asset.realized_real_net_profit)} {asset.currency}
                  </span>
                </div>
                {asset.risk_margin_rate > 0 && asset.realized_real_net_profit > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-slate-100 text-indigo-600 mt-2 bg-indigo-50 -mx-2 px-2 rounded">
                    <span className="text-sm font-medium">Arındırma (Kârdan %{asset.risk_margin_rate} Bağış)</span>
                    <span className="font-bold">-{fmt(asset.realized_real_net_profit - asset.realized_risk_margin_profit)} {asset.currency}</span>
                  </div>
                )}
                {asset.risk_margin_rate > 0 && asset.realized_real_net_profit > 0 && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-sm font-bold text-slate-900">Arındırılmış Nihai Kâr</span>
                    <span className={`font-black ${asset.realized_risk_margin_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {asset.realized_risk_margin_profit >= 0 ? '+' : ''}{fmt(asset.realized_risk_margin_profit)} {asset.currency}
                    </span>
                  </div>
                )}
                {asset.realized_cost === 0 && (
                   <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100">
                     Sistem güncellemesi öncesindeki satışlar için gerçekleşen maliyet 0 olarak kabul edilmiştir. Yeni satışlarda maliyet ve enflasyon verisi tam tutulacaktır.
                   </div>
                )}
              </>
            ) : (
              <div className="text-center text-slate-400 py-10">
                Bu varlık için henüz gerçekleşmiş bir satış işlemi (kâr realizasyonu) bulunmamaktadır.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* İŞLEM GEÇMİŞİ TABLOSU */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mt-4">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-800 text-lg">İşlem Geçmişi</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-base uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-bold">Tarih</th>
                <th className="px-6 py-4 font-bold">İşlem Tipi</th>
                <th className="px-6 py-4 font-bold text-right">Adet / Tutar</th>
                <th className="px-6 py-4 font-bold text-right">Fiyat</th>
                <th className="px-6 py-4 font-bold text-right">Vergi/Komisyon</th>
              </tr>
            </thead>
            <tbody className="text-lg divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">İşlem kaydı yok.</td>
                </tr>
              ) : (
                transactions.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-600">{tx.date}</td>
                    <td className="px-6 py-4">
                      {tx.transaction_type === 'BUY' && <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md text-xs font-bold">ALIŞ</span>}
                      {tx.transaction_type === 'SELL' && <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-md text-xs font-bold">SATIŞ</span>}
                      {tx.transaction_type === 'DIVIDEND' && <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-md text-xs font-bold">TEMETTÜ</span>}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">{tx.amount.toLocaleString()} {tx.transaction_type === 'DIVIDEND' ? asset.currency : ''}</td>
                    <td className="px-6 py-4 text-right text-slate-600">{tx.price > 0 ? fmt(tx.price) + ' ' + asset.currency : '-'}</td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      {tx.tax > 0 && <div>Vergi: {tx.tax}</div>}
                      {tx.commission > 0 && <div>Kom: {tx.commission}</div>}
                      {tx.tax === 0 && tx.commission === 0 && '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
