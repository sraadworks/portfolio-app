import { API_URL } from "../apiConfig";
import CashTransactionForm from './CashTransactionForm';
import CashFilters from './CashFilters';
import CashActions from './CashActions';
import Link from 'next/link';

async function getCashLedger(searchParams: any) {
  const params = new URLSearchParams();
  const safeParams = Object.fromEntries(Object.entries(searchParams).filter(([_, v]) => typeof v === 'string')) as Record<string, string>;
  
  if (safeParams.currency) params.append('currency', safeParams.currency);
  if (safeParams.type) params.append('type', safeParams.type);
  if (safeParams.start_date) params.append('start_date', safeParams.start_date);
  if (safeParams.end_date) params.append('end_date', safeParams.end_date);
  if (safeParams.skip) params.append('skip', safeParams.skip);
  params.append('limit', '20');

  const res = await fetch(`${API_URL}/cash-ledger/?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) return { items: [], total: 0 };
  return res.json();
}

async function getCashSummary() {
  const res = await fetch(`${API_URL}/cash-ledger/summary`, { cache: 'no-store' });
  if (!res.ok) return { TRY: 0, USD: 0 };
  return res.json();
}

export default async function CashLedgerPage(props: { searchParams: Promise<any> }) {
  const searchParams = await props.searchParams;
  const { items: cashLedger, total } = await getCashLedger(searchParams);
  const cashSummary = await getCashSummary();

  const skip = parseInt(searchParams.skip || '0');
  const limit = 20;
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Kasa Defteri</h1>
          <p className="text-sm text-slate-500 mt-1">Nakit akışınızı ve anlık kasa bakiyelerinizi yönetin.</p>
        </div>
        <div className="w-full md:w-auto">
          <CashTransactionForm />
        </div>
      </div>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-10 border border-[var(--border-main)] rounded-2xl bg-[var(--bg-card)] shadow-xl shadow-black/5 dark:shadow-black/40 hover:shadow-2xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-500/40"></div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">TL Kasası</div>
          <div className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">₺{cashSummary.TRY.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="p-10 border border-[var(--border-main)] rounded-2xl bg-[var(--bg-card)] shadow-xl shadow-black/5 dark:shadow-black/40 hover:shadow-2xl transition-all relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500/40"></div>
          <div className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Döviz Kasası (USD)</div>
          <div className="text-5xl font-black text-[var(--text-primary)] tracking-tighter">${cashSummary.USD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8 p-6 border border-[var(--border-main)] rounded-2xl bg-[var(--bg-card)] shadow-lg shadow-black/5 dark:shadow-black/20">
        <CashFilters />
      </div>

      {/* Main Table */}
      <div className="border border-[var(--border-main)] rounded-2xl overflow-hidden bg-[var(--bg-card)] text-left text-sm shadow-xl shadow-black/5 dark:shadow-black/20 transition-all">
        <div className="px-6 py-5 border-b border-[var(--border-main)] flex justify-between items-center bg-slate-500/5">
          <h2 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Son İşlemler</h2>
          <span className="px-3 py-1 rounded-full text-[10px] font-black bg-slate-500/10 text-slate-500 border border-slate-500/20 uppercase tracking-widest">{total} İşlem</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-[var(--border-main)] text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-500/5">
                <th className="px-6 py-5 font-bold text-left">Tarih</th>
                <th className="px-6 py-5 font-bold text-left">İşlem Tipi</th>
                <th className="px-6 py-5 font-bold text-left">Açıklama</th>
                <th className="px-6 py-5 font-bold text-right">Tutar</th>
                <th className="px-6 py-5 font-bold text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-main)]/50">
              {cashLedger.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic font-medium">
                    Filtrelere uygun nakit hareketi bulunmuyor.
                  </td>
                </tr>
              ) : (
                cashLedger.map((item: any) => {
                  let badgeStyles = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                  let dotBg = 'bg-amber-500';
                  if (item.transaction_type === 'DEPOSIT') { badgeStyles = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'; dotBg = 'bg-blue-500'; }
                  else if (item.transaction_type === 'WITHDRAW') { badgeStyles = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'; dotBg = 'bg-rose-500'; }
                  else if (item.transaction_type === 'BUY') { badgeStyles = 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20'; dotBg = 'bg-slate-500'; }
                  else if (item.transaction_type === 'SELL') { badgeStyles = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'; dotBg = 'bg-emerald-500'; }

                  return (
                    <tr key={item.id} className="hover:bg-[var(--bg-hover)]/30 transition-colors group">
                      <td className="px-6 py-5 text-slate-500 font-bold">
                        {item.date}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-2 py-1 px-3 rounded-lg text-[10px] font-black tracking-widest border uppercase ${badgeStyles}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotBg}`}></span>
                          {item.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-[var(--text-secondary)] font-medium truncate max-w-xs">
                        {item.description}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className={`text-base font-black ${item.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString(item.currency === 'TRY' ? 'tr-TR' : 'en-US', { style: 'currency', currency: item.currency })}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center opacity-40 group-hover:opacity-100 transition-opacity">
                        <CashActions item={item} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-5 border-t border-[var(--border-main)] bg-slate-500/5">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Sayfa <strong className="text-[var(--text-primary)]">{currentPage}</strong> / <strong className="text-[var(--text-primary)]">{totalPages}</strong>
            </div>
            <div className="flex gap-2">
              <Link href={skip > 0 ? `?${new URLSearchParams({...Object.fromEntries(Object.entries(searchParams).filter(([k, v]) => typeof v === 'string')), skip: (skip - limit).toString()}).toString()}` : '#'}>
                <button className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all ${skip === 0 ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-transparent cursor-not-allowed' : 'bg-[var(--bg-card)] text-slate-600 border-[var(--border-main)] hover:bg-slate-500 hover:text-white hover:border-slate-500'}`} disabled={skip === 0}>
                  Geri
                </button>
              </Link>
              <Link href={skip + limit < total ? `?${new URLSearchParams({...Object.fromEntries(Object.entries(searchParams).filter(([k, v]) => typeof v === 'string')), skip: (skip + limit).toString()}).toString()}` : '#'}>
                <button className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all ${skip + limit >= total ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 border-transparent cursor-not-allowed' : 'bg-[var(--bg-card)] text-slate-600 border-[var(--border-main)] hover:bg-slate-500 hover:text-white hover:border-slate-500'}`} disabled={skip + limit >= total}>
                  İleri
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
