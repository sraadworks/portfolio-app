'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function CashFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Reset skip when filters change
    params.delete('skip');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-slate-200 mb-6 flex flex-wrap gap-4 items-end shadow-sm">
      <div className="flex-1 min-w-[140px]">
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Para Birimi</label>
        <select 
          defaultValue={searchParams.get('currency') || ''}
          onChange={(e) => handleFilterChange('currency', e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Tümü</option>
          <option value="TRY">TRY (₺)</option>
          <option value="USD">USD ($)</option>
        </select>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">İşlem Tipi</label>
        <select 
          defaultValue={searchParams.get('type') || ''}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="">Tümü</option>
          <option value="DEPOSIT">Para Yatırma</option>
          <option value="WITHDRAW">Para Çekme</option>
          <option value="BUY">Alış</option>
          <option value="SELL">Satış</option>
          <option value="DIVIDEND">Temettü</option>
        </select>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Başlangıç Tarihi</label>
        <input 
          type="date"
          defaultValue={searchParams.get('start_date') || ''}
          onChange={(e) => handleFilterChange('start_date', e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Bitiş Tarihi</label>
        <input 
          type="date"
          defaultValue={searchParams.get('end_date') || ''}
          onChange={(e) => handleFilterChange('end_date', e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <button 
        onClick={() => router.push('/cash-ledger')}
        className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-rose-600 transition-colors"
      >
        Temizle
      </button>
    </div>
  );
}
