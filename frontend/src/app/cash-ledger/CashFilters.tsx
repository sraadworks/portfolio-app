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
    <div className="flex flex-wrap gap-4 items-end w-full">
      <div className="flex-1 min-w-[140px]">
        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Para Birimi</label>
        <select 
          defaultValue={searchParams.get('currency') || ''}
          onChange={(e) => handleFilterChange('currency', e.target.value)}
          className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer hover:border-slate-400 dark:hover:border-slate-600"
        >
          <option value="">Tümü</option>
          <option value="TRY">TRY (₺)</option>
          <option value="USD">USD ($)</option>
        </select>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">İşlem Tipi</label>
        <select 
          defaultValue={searchParams.get('type') || ''}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all cursor-pointer hover:border-slate-400 dark:hover:border-slate-600"
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
        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Başlangıç Tarihi</label>
        <input 
          type="date"
          defaultValue={searchParams.get('start_date') || ''}
          onChange={(e) => handleFilterChange('start_date', e.target.value)}
          className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 ml-1">Bitiş Tarihi</label>
        <input 
          type="date"
          defaultValue={searchParams.get('end_date') || ''}
          onChange={(e) => handleFilterChange('end_date', e.target.value)}
          className="w-full bg-[var(--bg-app)] border border-[var(--border-main)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        />
      </div>

      <button 
        onClick={() => router.push('/cash-ledger')}
        className="px-6 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-white dark:hover:text-white hover:bg-slate-500 dark:hover:bg-slate-700 rounded-lg transition-all border border-slate-300 dark:border-slate-800 uppercase tracking-widest"
      >
        Temizle
      </button>
    </div>
  );
}
