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
        <div className="text-center font-bold text-slate-500 animate-pulse text-[15.5px]">Analiz Verileri Yükleniyor...</div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="p-10 border border-rose-500/20 rounded-xl bg-rose-500/10 text-center text-rose-500 font-bold text-[18px]">
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
    <div className="space-y-8 max-w-7xl mx-auto w-full pb-20">
      {/* Header */}
      <div className="flex items-center gap-6">
        <Link href="/assets">
          <button className="flex items-center justify-center w-11 h-11 bg-[var(--bg-card)] border border-[var(--border-main)] rounded-xl text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:border-blue-500 transition-all shadow-sm group">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-active:scale-90 transition-transform"><path d="m15 18-6-6 6-6" /></svg>
          </button>
        </Link>
        <div>
          <h1 className="text-[33px] font-black text-[var(--text-primary)] tracking-tight uppercase">{asset.symbol}</h1>
          <p className="text-[15.5px] font-black text-slate-600 dark:text-slate-400 mt-1 uppercase tracking-widest">{asset.name} <span className="text-slate-300 dark:text-slate-700 px-2">|</span> {asset.asset_type}</p>
        </div>
      </div>

      {/* KPI Grid 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-8 border border-[var(--border-main)] rounded-2xl bg-[var(--bg-card)] shadow-xl shadow-black/5 dark:shadow-black/20 relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-500/40"></div>
          <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-4">Toplam Maliyet</div>
          <div className="text-[26.5px] font-black text-[var(--text-primary)] tracking-tight">{fmt(asset.total_cost)} <span className="text-[13px] opacity-50 font-medium">{asset.currency}</span></div>
        </div>

        <div className="p-8 border border-[var(--border-main)] rounded-2xl bg-[var(--bg-card)] shadow-xl shadow-black/5 dark:shadow-black/20 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500/40"></div>
          <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-4">Toplam Brüt Kâr</div>
          <div className="flex items-end justify-between">
            <div className={`text-[26.5px] font-black tracking-tight ${asset.total_gross_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {asset.total_gross_profit >= 0 ? "+" : ""}{fmt(asset.total_gross_profit)}
            </div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black border uppercase tracking-widest ${asset.total_gross_profit >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
              {asset.total_gross_profit >= 0 ? '▲' : '▼'} %{(asset.total_cost > 0 ? (asset.total_gross_profit / asset.total_cost * 100) : 0).toFixed(1)}
            </span>
          </div>
        </div>

        <div className="p-8 border border-[var(--border-main)] rounded-2xl bg-[var(--bg-card)] shadow-xl shadow-black/5 dark:shadow-black/20 relative overflow-hidden group hover:border-slate-400 transition-all">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-500/40"></div>
          <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-1">Reel Net Kâr</div>
          <div className="text-[10px] text-slate-600 dark:text-slate-400 font-bold mb-4 uppercase tracking-widest">Enflasyon Arındırılmış</div>
          <div className={`text-[26.5px] font-black tracking-tight ${asset.total_real_net_profit >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {asset.total_real_net_profit >= 0 ? "+" : ""}{fmt(asset.total_real_net_profit)}
          </div>
          {asset.risk_margin_rate > 0 && (
            <div className="mt-3 text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">
              Arındırma sonrası: <span className={asset.total_risk_margin_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                {asset.total_risk_margin_profit >= 0 ? '+' : ''}{fmt(asset.total_risk_margin_profit)}
              </span>
            </div>
          )}
        </div>

        <div className="p-8 border border-[var(--border-main)] rounded-2xl bg-[var(--bg-card)] shadow-xl shadow-black/5 dark:shadow-black/20 relative overflow-hidden group hover:border-indigo-500/30 transition-all">
          <div className="absolute top-0 left-0 w-full h-2 bg-indigo-500/40"></div>
          <div className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-4">Aylık Ort. Getiri</div>
          <div className={`text-[26.5px] font-black tracking-tight ${monthlyPercent >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {monthlyPercent >= 0 ? "+" : ""}{monthlyPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Main Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="p-8 border border-[var(--border-main)] rounded-2xl bg-[var(--bg-card)] shadow-xl shadow-black/5 dark:shadow-black/20">
          <div className="flex justify-between items-center mb-8 pb-5 border-b border-[var(--border-main)]">
            <h2 className="text-[15.5px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">Aktif Pozisyon</h2>
            {asset.active_quantity > 0 ? (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-widest animate-pulse">Açık</span>
            ) : (
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[11px] font-black bg-slate-500/10 text-slate-500 border border-slate-500/20 uppercase tracking-widest">Kapalı</span>
            )}
          </div>

          {asset.active_quantity > 0 ? (
            <ul className="space-y-5">
              <li className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider text-[12px]">Kalan Adet</span>
                <span className="font-black text-[var(--text-primary)] text-[20px]">{asset.active_quantity}</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider text-[12px]">Güncel Fiyat</span>
                <span className="font-black text-[var(--text-primary)] text-[20px]">{fmt(asset.current_price)} <span className="text-[13px] opacity-50 font-medium ml-1">{asset.currency}</span></span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider text-[12px]">Toplam Değer</span>
                <span className="font-black text-[var(--text-primary)] text-[20px]">{fmt(asset.active_value)} <span className="text-[13px] opacity-50 font-medium ml-1">{asset.currency}</span></span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider text-[12px]">Elde Tutma</span>
                <span className="font-black text-[var(--text-primary)] text-[20px]">{asset.active_holding_days} Gün</span>
              </li>
              <div className="h-px bg-[var(--border-main)] my-8"></div>

              {/* Profit waterfall */}
              <li className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-[12px]">Aktif Brüt Kâr</span>
                <span className={`font-black text-[26.5px] tracking-tighter ${asset.active_gross_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {asset.active_gross_profit >= 0 ? '+' : ''}{fmt(asset.active_gross_profit)} <span className="text-[15.5px] font-medium opacity-50">{asset.currency}</span>
                </span>
              </li>
              <div className="space-y-3 mt-5">
                {asset.active_commission > 0 && (
                  <li className="flex justify-between items-center text-[12px] font-black uppercase tracking-wider">
                    <span className="text-slate-500 dark:text-slate-400">- Yönetim Ücreti</span>
                    <span className="text-rose-500">-{fmt(asset.active_commission)} {asset.currency}</span>
                  </li>
                )}
                {asset.active_tax > 0 && (
                  <li className="flex justify-between items-center text-[12px] font-black uppercase tracking-wider">
                    <span className="text-slate-500 dark:text-slate-400">- Stopaj (Vergi)</span>
                    <span className="text-rose-500">-{fmt(asset.active_tax)} {asset.currency}</span>
                  </li>
                )}
                <li className="flex justify-between items-center text-[12px] font-black uppercase tracking-wider">
                  <span className="text-slate-500 dark:text-slate-400">- Enflasyon Kaybı</span>
                  <span className="text-amber-600">-{fmt(asset.active_inflation_diff)} {asset.currency}</span>
                </li>
              </div>
              <li className="flex justify-between items-center border-t border-[var(--border-main)] pt-6 mt-4">
                <span className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-[12px]">Reel Net Kâr</span>
                <span className={`font-black text-[22px] ${asset.active_real_net_profit >= 0 ? 'text-[var(--text-primary)]' : 'text-rose-600'}`}>
                  {asset.active_real_net_profit >= 0 ? '+' : ''}{fmt(asset.active_real_net_profit)} <span className="text-[13px] font-medium opacity-50">{asset.currency}</span>
                </span>
              </li>
              {asset.risk_margin_rate > 0 && (
                <>
                  <li className="flex justify-between items-center text-[12px] font-black uppercase tracking-wider mt-3">
                    <span className="text-slate-500 dark:text-slate-400">- Bağış / Risk (%{asset.risk_margin_rate.toFixed(1)})</span>
                    <span className="text-slate-500 dark:text-slate-400">-{fmt(asset.active_real_net_profit - asset.active_risk_margin_profit)}</span>
                  </li>
                  <li className="flex justify-between items-center border-t border-[var(--border-main)] pt-6 mt-4">
                    <span className="text-[var(--text-primary)] font-black uppercase tracking-widest text-[13px]">Nihai Net Kâr</span>
                    <span className={`font-black text-[26.5px] tracking-tighter ${asset.active_risk_margin_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {asset.active_risk_margin_profit >= 0 ? '+' : ''}{fmt(asset.active_risk_margin_profit)} <span className="text-[13px] font-medium opacity-50">{asset.currency}</span>
                    </span>
                  </li>
                </>
              )}

              {asset.currency === 'TRY' && (
                <div className="mt-10 p-7 bg-blue-500/5 border border-blue-500/20 rounded-2xl relative overflow-hidden group hover:bg-blue-500/10 transition-colors">
                  <div className="absolute top-0 left-0 w-2 h-full bg-blue-500/50"></div>
                  <div className="flex justify-between items-center pl-2">
                    <div>
                      <div className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-2">Dolar Bazlı Getiri</div>
                      <div className="text-[33px] font-black text-blue-600 dark:text-blue-400 tracking-tighter">
                        {asset.active_usd_profit >= 0 ? "+" : ""}${fmt(asset.active_usd_profit)}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-lg text-[13px] font-black border uppercase tracking-widest ${asset.active_usd_percent >= 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
                      {asset.active_usd_percent >= 0 ? '▲' : '▼'} %{asset.active_usd_percent?.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </ul>
          ) : (
            <div className="py-24 text-center italic text-slate-500 text-[15.5px] border border-dashed border-[var(--border-main)] rounded-2xl bg-slate-500/5 uppercase tracking-widest font-black">Aktif pozisyon bulunmamaktadır.</div>
          )}
        </div>

        <div className="p-8 border border-[var(--border-main)] rounded-2xl bg-[var(--bg-card)] shadow-xl shadow-black/5 dark:shadow-black/20">
          <div className="flex justify-between items-center mb-8 pb-5 border-b border-[var(--border-main)]">
            <h2 className="text-[15.5px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">Kapanan (Gerçekleşen) İşlemler</h2>
          </div>

          {asset.realized_revenue > 0 ? (
            <ul className="space-y-5">
              <li className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider text-[12px]">Satış Geliri</span>
                <span className="font-black text-[var(--text-primary)] text-[20px]">{fmt(asset.realized_revenue)} <span className="text-[13px] opacity-50 font-medium ml-1">{asset.currency}</span></span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-wider text-[12px]">Satılan Maliyet</span>
                <span className="font-black text-[var(--text-primary)] text-[20px]">{fmt(asset.realized_cost)} <span className="text-[13px] opacity-50 font-medium ml-1">{asset.currency}</span></span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-[12px]">Gerçekleşen Brüt Kâr</span>
                <span className={`font-black text-[26.5px] tracking-tighter ${asset.realized_gross_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {asset.realized_gross_profit >= 0 ? '+' : ''}{fmt(asset.realized_gross_profit)} <span className="text-[15.5px] font-medium opacity-50">{asset.currency}</span>
                </span>
              </li>
              <div className="space-y-3 mt-5">
                {asset.realized_commission > 0 && (
                  <li className="flex justify-between items-center text-[12px] font-black uppercase tracking-wider">
                    <span className="text-slate-500 dark:text-slate-400">- Yönetim Ücreti</span>
                    <span className="text-rose-500">-{fmt(asset.realized_commission)} {asset.currency}</span>
                  </li>
                )}
                {asset.realized_tax > 0 && (
                  <li className="flex justify-between items-center text-[12px] font-black uppercase tracking-wider">
                    <span className="text-slate-500 dark:text-slate-400">- Stopaj (Vergi)</span>
                    <span className="text-rose-500">-{fmt(asset.realized_tax)} {asset.currency}</span>
                  </li>
                )}
                <li className="flex justify-between items-center text-[12px] font-black uppercase tracking-wider">
                  <span className="text-slate-500 dark:text-slate-400">- Enflasyon Erimesi</span>
                  <span className="text-amber-600">-{fmt(asset.realized_inflation_diff)} {asset.currency}</span>
                </li>
              </div>
              <div className="h-px bg-[var(--border-main)] my-8"></div>
              <li className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400 font-black uppercase tracking-widest text-[12px]">Gerçekleşen Reel Kâr</span>
                <span className={`font-black text-[22px] ${asset.realized_real_net_profit >= 0 ? "text-[var(--text-primary)]" : "text-rose-600"}`}>
                  {asset.realized_real_net_profit >= 0 ? "+" : ""}{fmt(asset.realized_real_net_profit)} <span className="text-[13px] font-medium opacity-50">{asset.currency}</span>
                </span>
              </li>
              {asset.risk_margin_rate > 0 && (
                <>
                  <li className="flex justify-between items-center text-[12px] font-black uppercase tracking-wider mt-3">
                    <span className="text-slate-500 dark:text-slate-400">- Bağış / Risk (%{asset.risk_margin_rate.toFixed(1)})</span>
                    <span className="text-slate-500 dark:text-slate-400">-{fmt(asset.realized_real_net_profit - asset.realized_risk_margin_profit)}</span>
                  </li>
                  <li className="flex justify-between items-center border-t border-[var(--border-main)] pt-6 mt-4">
                    <span className="text-[var(--text-primary)] font-black uppercase tracking-widest text-[13px]">Nihai Net Kâr</span>
                    <span className={`font-black text-[26.5px] tracking-tighter ${asset.realized_risk_margin_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {asset.realized_risk_margin_profit >= 0 ? '+' : ''}{fmt(asset.realized_risk_margin_profit)} <span className="text-[13px] font-medium opacity-50">{asset.currency}</span>
                    </span>
                  </li>
                </>
              )}
            </ul>
          ) : (
            <div className="py-24 text-center italic text-slate-500 text-[15.5px] border border-dashed border-[var(--border-main)] rounded-2xl bg-slate-500/5 uppercase tracking-widest font-black">Gerçekleşmiş bir satış işlemi bulunmamaktadır.</div>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="border border-[var(--border-main)] rounded-2xl overflow-hidden bg-[var(--bg-card)] text-left text-sm shadow-xl shadow-black/5 dark:shadow-black/20">
        <div className="px-6 py-6 border-b border-[var(--border-main)] bg-slate-500/5">
          <h2 className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">İşlem Geçmişi</h2>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border-main)] text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest bg-slate-500/5">
                <th className="px-6 py-5 text-left">Tarih</th>
                <th className="px-6 py-5 text-left">İşlem</th>
                <th className="px-6 py-5 text-right">Adet/Tutar</th>
                <th className="px-6 py-5 text-right">Fiyat</th>
                <th className="px-6 py-5 text-right">USD Kuru</th>
                <th className="px-6 py-5 text-right">Giderler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]/50">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-slate-500 italic font-black uppercase tracking-widest text-[15.5px]">İşlem bulunmamaktadır.</td>
                </tr>
              ) : (
                transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(tx => {
                  let badgeStyles = 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
                  let dotBg = 'bg-slate-500';
                  let label = 'DİĞER';

                  if (tx.transaction_type === 'BUY') {
                    badgeStyles = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
                    dotBg = 'bg-blue-500';
                    label = 'ALIŞ';
                  } else if (tx.transaction_type === 'SELL') {
                    badgeStyles = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                    dotBg = 'bg-amber-500';
                    label = 'SATIŞ';
                  } else if (tx.transaction_type === 'DIVIDEND') {
                    badgeStyles = 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
                    dotBg = 'bg-purple-500';
                    label = 'TEMETTÜ';
                  }

                  return (
                    <tr key={tx.id} className="hover:bg-[var(--bg-hover)]/30 transition-colors group">
                      <td className="px-6 py-5 text-slate-600 dark:text-slate-400 font-black text-[14px]">{tx.date}</td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 py-1 px-3 rounded-lg text-[11px] font-black tracking-widest border uppercase ${badgeStyles}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotBg}`}></span>
                          {label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-[var(--text-primary)] text-[18px]">{tx.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</td>
                      <td className="px-6 py-5 text-right text-slate-500">
                        {tx.price > 0 ? (
                          <><span className="font-black text-[var(--text-primary)] text-[18px]">{fmt(tx.price)}</span> <span className="text-[11px] opacity-50 ml-1">{asset.currency}</span></>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {tx.usd_rate ? (
                          <><span className="text-[11px] text-blue-500/50 mr-1">$</span><span className="font-black text-blue-600 dark:text-blue-400 text-[18px]">{fmt(tx.usd_rate)}</span></>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-5 text-right text-rose-600 font-black text-[15.5px]">{tx.tax + tx.commission > 0 ? fmt(tx.tax + tx.commission) : '-'}</td>
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
