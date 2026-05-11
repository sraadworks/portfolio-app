'use client';

import { API_URL } from "../../../apiConfig";
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

interface Asset {
  id: number;
  symbol: string;
  name: string;
  currency: string;
  asset_type: string;
  active_quantity: number;
  active_cost: number;
  active_value: number;
  active_holding_days: number;
  active_gross_profit: number;
  active_commission: number;
  active_tax: number;
  active_net_profit: number;
  active_inflation_diff: number;
  active_real_net_profit: number;
  active_risk_margin_profit: number;
  active_usd_cost: number;
  active_usd_value: number;
  active_usd_profit: number;
  active_usd_percent: number;
  risk_margin_rate: number;
  total_cost: number;
  total_gross_profit: number;
  total_net_profit: number;
  total_real_net_profit: number;
  total_risk_margin_profit: number;
  realized_revenue: number;
  realized_cost: number;
  realized_holding_days: number;
  realized_gross_profit: number;
  realized_commission: number;
  realized_tax: number;
  realized_net_profit: number;
  realized_inflation_diff: number;
  realized_real_net_profit: number;
  realized_risk_margin_profit: number;
  current_price: number;
}

interface Transaction {
  id: number;
  date: string;
  transaction_type: string;
  amount: number;
  price: number;
  usd_rate: number;
  tax: number;
  commission: number;
}

function fmt(val: number) {
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AssetAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [assetsRes, txsRes] = await Promise.all([
          fetch(`${API_URL}/assets/`),
          fetch(`${API_URL}/transactions/${id}`)
        ]);

        if (assetsRes.ok) {
          const assetsData = await assetsRes.json();
          if (Array.isArray(assetsData)) {
            const found = assetsData.find((a: any) => a.id.toString() === id);
            if (found) setAsset(found);
          }
        }

        if (txsRes.ok) {
          const txsData = await txsRes.json();
          if (Array.isArray(txsData)) {
            setTransactions(txsData);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center font-bold text-slate-400 animate-pulse">Analiz Verileri Yükleniyor...</div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-10 border border-rose-500/20 rounded-xl bg-rose-500/10 text-center text-rose-400 font-medium">
        Özet sayfası yüklenemedi. (Varlık bulunamadı veya sunucuya bağlanılamadı)
      </div>
    );
  }

  // Calculate monthly percentage
  let monthlyPercent = 0;
  const buyTxs = transactions.filter((t: Transaction) => t.transaction_type === 'BUY');
  if (buyTxs.length > 0) {
    const sortedBuys = [...buyTxs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstBuyDate = new Date(sortedBuys[0].date);
    let endDate = new Date();
    if (asset.active_quantity === 0) {
      const sellTxs = transactions.filter((t: Transaction) => t.transaction_type === 'SELL');
      if (sellTxs.length > 0) {
        const sortedSells = [...sellTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        endDate = new Date(sortedSells[0].date);
      }
    }
    const daysDiff = (endDate.getTime() - firstBuyDate.getTime()) / (1000 * 3600 * 24);
    const months = daysDiff / 30.44;
    if (months > 0 && asset.total_cost > 0) {
      const totalPercent = (asset.total_gross_profit / asset.total_cost) * 100;
      monthlyPercent = totalPercent / months;
    }
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full pb-10">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Link href="/assets">
          <button className="flex items-center justify-center w-10 h-10 bg-slate-900/40 border border-slate-800 rounded-xl hover:text-white text-slate-400 hover:bg-slate-800 transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">{asset.symbol}</h1>
          <p className="text-sm font-medium text-slate-400 mt-1">{asset.name} <span className="text-slate-600 px-1">•</span> {asset.asset_type}</p>
        </div>
      </div>

      {/* KPI Grid 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 border border-slate-800/60 rounded-xl bg-[#0B0F19] shadow-2xl shadow-black/40 relative overflow-hidden group hover:border-slate-700/80 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50"></div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Toplam Maliyet</div>
          <div className="text-2xl font-semibold text-white tracking-tight">{fmt(asset.total_cost)} {asset.currency}</div>
        </div>
        
        <div className="p-6 border border-slate-800/60 rounded-xl bg-[#0B0F19] shadow-2xl shadow-black/40 relative overflow-hidden group hover:border-slate-700/80 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50"></div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Toplam Brüt Kâr</div>
          <div className="flex items-end justify-between">
            <div className="text-2xl font-semibold text-white tracking-tight">
              {asset.total_gross_profit >= 0 ? "+" : ""}{fmt(asset.total_gross_profit)}
            </div>
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${asset.total_gross_profit >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
              {asset.total_gross_profit >= 0 ? '▲' : '▼'} %{(asset.total_cost > 0 ? (asset.total_gross_profit / asset.total_cost * 100) : 0).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="p-6 border border-slate-800/60 rounded-xl bg-[#0B0F19] shadow-2xl shadow-black/40 relative overflow-hidden group hover:border-slate-700/80 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-500/50"></div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Reel Net Kâr <span className="normal-case font-normal text-slate-500">(Enflasyon Arındırılmış)</span></div>
          <div className="text-[10px] text-slate-600 mb-3">Komisyon + Stopaj + Enflasyon düşüldü</div>
          <div className={`text-2xl font-semibold tracking-tight ${asset.total_real_net_profit >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {asset.total_real_net_profit >= 0 ? "+" : ""}{fmt(asset.total_real_net_profit)}
          </div>
          {asset.risk_margin_rate > 0 && (
            <div className="mt-2 text-[10px] text-slate-600">
              Arındırma sonrası: <span className={asset.total_risk_margin_profit >= 0 ? 'text-slate-400' : 'text-rose-500'}>
                {asset.total_risk_margin_profit >= 0 ? '+' : ''}{fmt(asset.total_risk_margin_profit)}
              </span> <span className="text-slate-700">(Bağış/Risk %{asset.risk_margin_rate.toFixed(1)} düşüldü)</span>
            </div>
          )}
        </div>

        <div className="p-6 border border-slate-800/60 rounded-xl bg-[#0B0F19] shadow-2xl shadow-black/40 relative overflow-hidden group hover:border-slate-700/80 transition-colors">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50"></div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Aylık Ortalama Getiri</div>
          <div className={`text-2xl font-semibold tracking-tight ${monthlyPercent >= 0 ? 'text-white' : 'text-rose-400'}`}>
            {monthlyPercent >= 0 ? "+" : ""}{monthlyPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Main Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 border border-slate-800/60 rounded-xl bg-[#0B0F19] shadow-2xl shadow-black/40">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/60">
            <h2 className="text-lg font-semibold text-white tracking-tight">Aktif Pozisyon</h2>
            {asset.active_quantity > 0 ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">Açık</span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20 uppercase tracking-wider">Kapalı</span>
            )}
          </div>
          
          {asset.active_quantity > 0 ? (
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Kalan Adet</span>
                <span className="font-semibold text-white">{asset.active_quantity}</span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Güncel Fiyat</span>
                <span className="font-semibold text-white">{fmt(asset.current_price)} <span className="text-slate-500 font-normal ml-0.5">{asset.currency}</span></span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Toplam Değer</span>
                <span className="font-semibold text-white">{fmt(asset.active_value)} <span className="text-slate-500 font-normal ml-0.5">{asset.currency}</span></span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Elde Tutma Süresi</span>
                <span className="font-semibold text-white">{asset.active_holding_days} Gün</span>
              </li>
              <div className="h-px bg-slate-800/60 my-4"></div>

              {/* Profit waterfall */}
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-300 font-bold">Aktif Brüt Kâr</span>
                <span className={`font-black text-xl tracking-tight ${asset.active_gross_profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {asset.active_gross_profit >= 0 ? "+" : ""}{fmt(asset.active_gross_profit)} <span className="text-sm font-normal opacity-50">{asset.currency}</span>
                </span>
              </li>
              {asset.active_commission > 0 && (
                <li className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">- Yönetim Ücreti</span>
                  <span className="font-medium text-rose-500/80">
                    -{fmt(asset.active_commission)} <span className="text-xs opacity-60">{asset.currency}</span>
                  </span>
                </li>
              )}
              {asset.active_tax > 0 && (
                <li className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">- Stopaj</span>
                  <span className="font-medium text-rose-500/80">
                    -{fmt(asset.active_tax)} <span className="text-xs opacity-60">{asset.currency}</span>
                  </span>
                </li>
              )}
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">- Enflasyon Kaybı</span>
                <span className="font-medium text-amber-500/80">-{fmt(asset.active_inflation_diff)} <span className="text-xs opacity-60">{asset.currency}</span></span>
              </li>
              <li className="flex justify-between items-center text-sm border-t border-slate-800/60 pt-3 mt-1">
                <span className="text-slate-300 font-semibold">Reel Net Kâr</span>
                <span className={`font-bold text-lg ${asset.active_real_net_profit >= 0 ? 'text-white' : 'text-rose-400'}`}>
                  {asset.active_real_net_profit >= 0 ? '+' : ''}{fmt(asset.active_real_net_profit)} <span className="text-sm font-normal opacity-50">{asset.currency}</span>
                </span>
              </li>
              {asset.risk_margin_rate > 0 && (
                <>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">- Bağış / Risk Arındırma (%{asset.risk_margin_rate.toFixed(1)})</span>
                    <span className="font-medium text-slate-500">
                      -{fmt(asset.active_real_net_profit - asset.active_risk_margin_profit)} <span className="text-xs opacity-60">{asset.currency}</span>
                    </span>
                  </li>
                  <li className="flex justify-between items-center text-sm border-t border-slate-800/60 pt-3">
                    <span className="text-white font-bold">Nihai Net Kâr</span>
                    <span className={`font-black text-xl tracking-tight ${asset.active_risk_margin_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {asset.active_risk_margin_profit >= 0 ? '+' : ''}{fmt(asset.active_risk_margin_profit)} <span className="text-sm font-normal opacity-50">{asset.currency}</span>
                    </span>
                  </li>
                </>
              )}

              {asset.currency === 'TRY' && (
                <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
                  <div className="flex justify-between items-center pl-2">
                    <div>
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Dolar Bazlı Getiri</div>
                      <div className="text-2xl font-bold text-blue-400 tracking-tight">
                        {asset.active_usd_profit >= 0 ? "+" : ""}${fmt(asset.active_usd_profit)}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${asset.active_usd_percent >= 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                      {asset.active_usd_percent >= 0 ? '▲' : '▼'} %{asset.active_usd_percent?.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </ul>
          ) : (
            <div className="py-12 text-center italic text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl bg-slate-900/20">Aktif pozisyon bulunmamaktadır.</div>
          )}
        </div>

        <div className="p-6 border border-slate-800/60 rounded-xl bg-[#0B0F19] shadow-2xl shadow-black/40">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-800/60">
            <h2 className="text-lg font-semibold text-white tracking-tight">Kapanan (Gerçekleşen) İşlemler</h2>
          </div>
          
          {asset.realized_revenue > 0 ? (
            <ul className="space-y-3">
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Satış Geliri</span>
                <span className="font-semibold text-white">{fmt(asset.realized_revenue)} <span className="text-slate-500 font-normal ml-0.5">{asset.currency}</span></span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Satılan Maliyet</span>
                <span className="font-semibold text-white">{fmt(asset.realized_cost)} <span className="text-slate-500 font-normal ml-0.5">{asset.currency}</span></span>
              </li>
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-400 font-medium">Gerçekleşen Brüt Kâr</span>
                <span className={`font-bold ${asset.realized_gross_profit >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {asset.realized_gross_profit >= 0 ? "+" : ""}{fmt(asset.realized_gross_profit)} <span className="opacity-50 font-normal ml-0.5">{asset.currency}</span>
                </span>
              </li>
              {asset.realized_commission > 0 && (
                <li className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">- Yönetim Ücreti</span>
                  <span className="font-medium text-rose-500/80">
                    -{fmt(asset.realized_commission)} <span className="text-xs opacity-60">{asset.currency}</span>
                  </span>
                </li>
              )}
              {asset.realized_tax > 0 && (
                <li className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">- Stopaj</span>
                  <span className="font-medium text-rose-500/80">
                    -{fmt(asset.realized_tax)} <span className="text-xs opacity-60">{asset.currency}</span>
                  </span>
                </li>
              )}
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">- Enflasyon Erimesi</span>
                <span className="font-medium text-amber-500/80">-{fmt(asset.realized_inflation_diff)} <span className="text-xs opacity-60">{asset.currency}</span></span>
              </li>
              <div className="h-px bg-slate-800/60 my-3"></div>
              <li className="flex justify-between items-center text-sm">
                <span className="text-slate-300 font-semibold">Gerçekleşen Reel Kâr</span>
                <span className={`font-bold text-lg ${asset.realized_real_net_profit >= 0 ? "text-white" : "text-rose-400"}`}>
                  {asset.realized_real_net_profit >= 0 ? "+" : ""}{fmt(asset.realized_real_net_profit)} <span className="text-sm font-normal opacity-50">{asset.currency}</span>
                </span>
              </li>
              {asset.risk_margin_rate > 0 && (
                <>
                  <li className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">- Bağış / Risk Arındırma (%{asset.risk_margin_rate.toFixed(1)})</span>
                    <span className="font-medium text-slate-500">
                      -{fmt(asset.realized_real_net_profit - asset.realized_risk_margin_profit)} <span className="text-xs opacity-60">{asset.currency}</span>
                    </span>
                  </li>
                  <li className="flex justify-between items-center text-sm border-t border-slate-800/60 pt-3">
                    <span className="text-white font-bold">Nihai Net Kâr</span>
                    <span className={`font-black text-xl tracking-tight ${asset.realized_risk_margin_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {asset.realized_risk_margin_profit >= 0 ? '+' : ''}{fmt(asset.realized_risk_margin_profit)} <span className="text-sm font-normal opacity-50">{asset.currency}</span>
                    </span>
                  </li>
                </>
              )}
            </ul>
          ) : (
            <div className="py-12 text-center italic text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl bg-slate-900/20">Gerçekleşmiş bir satış işlemi bulunmamaktadır.</div>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0B0F19] text-left text-sm shadow-2xl shadow-black/40">
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/40">
          <h2 className="text-lg font-semibold text-white tracking-tight">İşlem Geçmişi</h2>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-900/20">
                <th className="px-6 py-4 text-left">Tarih</th>
                <th className="px-6 py-4 text-left">İşlem</th>
                <th className="px-6 py-4 text-right">Adet/Tutar</th>
                <th className="px-6 py-4 text-right">Fiyat</th>
                <th className="px-6 py-4 text-right">USD Kuru</th>
                <th className="px-6 py-4 text-right">Giderler</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500 italic">İşlem bulunmamaktadır.</td>
                </tr>
              ) : (
                transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => {
                  let badgeStyles = 'bg-slate-500/10 text-slate-400 border-slate-500/20';
                  let dotBg = 'bg-slate-500';
                  let label = 'DİĞER';
                  
                  if (tx.transaction_type === 'BUY') {
                    badgeStyles = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                    dotBg = 'bg-blue-500';
                    label = 'ALIŞ';
                  } else if (tx.transaction_type === 'SELL') {
                    badgeStyles = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    dotBg = 'bg-amber-500';
                    label = 'SATIŞ';
                  } else if (tx.transaction_type === 'DIVIDEND') {
                    badgeStyles = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                    dotBg = 'bg-purple-500';
                    label = 'TEMETTÜ';
                  }

                  return (
                    <tr key={tx.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-300 font-medium">{tx.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-md text-[10px] font-bold tracking-wider border uppercase ${badgeStyles}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotBg}`}></span>
                          {label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-white">{tx.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                      <td className="px-6 py-4 text-right text-slate-300">{tx.price > 0 ? <><span className="font-medium text-white">{fmt(tx.price)}</span> <span className="text-[10px] text-slate-500 ml-1">{asset.currency}</span></> : '-'}</td>
                      <td className="px-6 py-4 text-right text-blue-400 font-medium">{tx.usd_rate ? <><span className="text-[10px] text-blue-400/50 mr-1">$</span>{fmt(tx.usd_rate)}</> : '-'}</td>
                      <td className="px-6 py-4 text-right text-slate-500 font-medium">{tx.tax + tx.commission > 0 ? fmt(tx.tax + tx.commission) : '-'}</td>
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
