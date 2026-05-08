
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
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Kasa Defteri</h1>
          <p className="text-sm text-slate-400 mt-1">Nakit akışınızı ve anlık kasa bakiyelerinizi yönetin.</p>
        </div>
        <div>
          <CashTransactionForm />
        </div>
      </div>
      
      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="p-8 border border-slate-800/60 rounded-xl bg-[#0B0F19] shadow-2xl shadow-black/50 hover:bg-slate-800/20 transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/50"></div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">TL Kasası</div>
          <div className="text-4xl font-semibold text-white tracking-tight">₺{cashSummary.TRY.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="p-8 border border-slate-800/60 rounded-xl bg-[#0B0F19] shadow-2xl shadow-black/50 hover:bg-slate-800/20 transition-colors relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/50"></div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Döviz Kasası (USD)</div>
          <div className="text-4xl font-semibold text-white tracking-tight">${cashSummary.USD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 border border-slate-800/60 rounded-xl bg-[#0B0F19] shadow-2xl shadow-black/50">
        <CashFilters />
      </div>

      {/* Main Table */}
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-[#0B0F19] text-left text-sm shadow-2xl shadow-black/50">
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
          <h2 className="text-lg font-semibold text-white tracking-tight">Son İşlemler</h2>
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">{total} İşlem</span>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4 font-medium text-left">Tarih</th>
                <th className="px-6 py-4 font-medium text-left">İşlem Tipi</th>
                <th className="px-6 py-4 font-medium text-left">Açıklama</th>
                <th className="px-6 py-4 font-medium text-right">Tutar</th>
                <th className="px-6 py-4 font-medium text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {cashLedger.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 italic">
                    Filtrelere uygun nakit hareketi bulunmuyor.
                  </td>
                </tr>
              ) : (
                cashLedger.map((item: any) => {
                  let badgeStyles = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  let dotBg = 'bg-amber-500';
                  if (item.transaction_type === 'DEPOSIT') { badgeStyles = 'bg-blue-500/10 text-blue-400 border-blue-500/20'; dotBg = 'bg-blue-500'; }
                  else if (item.transaction_type === 'WITHDRAW') { badgeStyles = 'bg-rose-500/10 text-rose-400 border-rose-500/20'; dotBg = 'bg-rose-500'; }
                  else if (item.transaction_type === 'BUY') { badgeStyles = 'bg-slate-500/10 text-slate-400 border-slate-500/20'; dotBg = 'bg-slate-500'; }
                  else if (item.transaction_type === 'SELL') { badgeStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'; dotBg = 'bg-emerald-500'; }

                  return (
                    <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-300">
                        {item.date}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-semibold tracking-wide border uppercase ${badgeStyles}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotBg}`}></span>
                          {item.transaction_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 truncate max-w-xs">
                        {item.description}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`font-semibold ${item.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString(item.currency === 'TRY' ? 'tr-TR' : 'en-US', { style: 'currency', currency: item.currency })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center opacity-50 hover:opacity-100 transition-opacity">
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
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-800 bg-slate-900/20">
            <div className="text-sm text-slate-400">
              Sayfa <strong className="text-white">{currentPage}</strong> / <strong className="text-white">{totalPages}</strong>
            </div>
            <div className="flex gap-2">
              <Link href={skip > 0 ? `?${new URLSearchParams({...Object.fromEntries(Object.entries(searchParams).filter(([k, v]) => typeof v === 'string')), skip: (skip - limit).toString()}).toString()}` : '#'}>
                <button className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${skip === 0 ? 'bg-slate-800/50 text-slate-500 border-slate-800 cursor-not-allowed' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'}`} disabled={skip === 0}>
                  Geri
                </button>
              </Link>
              <Link href={skip + limit < total ? `?${new URLSearchParams({...Object.fromEntries(Object.entries(searchParams).filter(([k, v]) => typeof v === 'string')), skip: (skip + limit).toString()}).toString()}` : '#'}>
                <button className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${skip + limit >= total ? 'bg-slate-800/50 text-slate-500 border-slate-800 cursor-not-allowed' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'}`} disabled={skip + limit >= total}>
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
