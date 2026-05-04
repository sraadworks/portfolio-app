import { API_URL } from "../../apiConfig";
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
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Kasa Defteri</h1>
          <p className="text-slate-500 mt-1">Nakit akışınızı ve anlık kasa bakiyelerinizi yönetin.</p>
        </div>
        <CashTransactionForm />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="text-sm text-blue-600 font-semibold uppercase tracking-wider">TL Kasası</div>
            <div className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md">TRY</div>
          </div>
          <div className="relative z-10 text-4xl font-black text-slate-900">₺{cashSummary.TRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-white p-6 rounded-2xl border border-emerald-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] relative overflow-hidden group hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-100 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="text-sm text-emerald-600 font-semibold uppercase tracking-wider">Döviz Kasası</div>
            <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-md">USD</div>
          </div>
          <div className="relative z-10 text-4xl font-black text-slate-900">${cashSummary.USD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <CashFilters />

      <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            Son İşlemler
            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{total} İşlem</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-base uppercase tracking-wider text-slate-500">
                <th className="px-6 py-4 font-bold">Tarih</th>
                <th className="px-6 py-4 font-bold">İşlem Tipi</th>
                <th className="px-6 py-4 font-bold">Açıklama</th>
                <th className="px-6 py-4 font-bold text-right">Tutar</th>
                <th className="px-6 py-4 font-bold text-right w-24">İşlemler</th>
              </tr>
            </thead>
            <tbody className="text-lg divide-y divide-slate-100">
              {cashLedger.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                    Filtrelere uygun nakit hareketi bulunmuyor.
                  </td>
                </tr>
              ) : (
                cashLedger.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-600 whitespace-nowrap">{item.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        item.transaction_type === 'DEPOSIT' ? 'bg-blue-50 text-blue-600' :
                        item.transaction_type === 'WITHDRAW' ? 'bg-rose-50 text-rose-600' :
                        item.transaction_type === 'BUY' ? 'bg-slate-100 text-slate-600' :
                        item.transaction_type === 'SELL' ? 'bg-emerald-50 text-emerald-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>{item.transaction_type}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-base max-w-md truncate">{item.description}</td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${item.amount >= 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString(item.currency === 'TRY' ? 'tr-TR' : 'en-US', { style: 'currency', currency: item.currency })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <CashActions item={item} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Toplam <strong>{total}</strong> işlemden <strong>{skip + 1} - {Math.min(skip + limit, total)}</strong> arası gösteriliyor.
            </div>
            <div className="flex gap-2">
              <Link 
                href={skip > 0 ? `?${new URLSearchParams({...Object.fromEntries(Object.entries(searchParams).filter(([k, v]) => typeof v === 'string')), skip: (skip - limit).toString()}).toString()}` : '#'}
                className={`px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold transition-all ${skip === 0 ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-sm'}`}
              >
                Geri
              </Link>
              <div className="flex items-center px-4 text-xs font-bold text-slate-400">
                Sayfa {currentPage} / {totalPages}
              </div>
              <Link 
                href={skip + limit < total ? `?${new URLSearchParams({...Object.fromEntries(Object.entries(searchParams).filter(([k, v]) => typeof v === 'string')), skip: (skip + limit).toString()}).toString()}` : '#'}
                className={`px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold transition-all ${skip + limit >= total ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-white text-slate-700 hover:border-blue-500 hover:text-blue-600 shadow-sm'}`}
              >
                İleri
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
