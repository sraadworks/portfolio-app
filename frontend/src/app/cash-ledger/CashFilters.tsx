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
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Para Birimi</label>
        <select 
          defaultValue={searchParams.get('currency') || ''}
          onChange={(e) => handleFilterChange('currency', e.target.value)}
          className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
        >
          <option value="">Tümü</option>
          <option value="TRY">TRY (₺)</option>
          <option value="USD">USD ($)</option>
        </select>
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">İşlem Tipi</label>
        <select 
          defaultValue={searchParams.get('type') || ''}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Başlangıç Tarihi</label>
        <input 
          type="date"
          defaultValue={searchParams.get('start_date') || ''}
          onChange={(e) => handleFilterChange('start_date', e.target.value)}
          className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]"
        />
      </div>

      <div className="flex-1 min-w-[140px]">
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 ml-1">Bitiş Tarihi</label>
        <input 
          type="date"
          defaultValue={searchParams.get('end_date') || ''}
          onChange={(e) => handleFilterChange('end_date', e.target.value)}
          className="w-full bg-[#0B0F19] border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all [color-scheme:dark]"
        />
      </div>

      <button 
        onClick={() => router.push('/cash-ledger')}
        className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700 rounded-lg transition-colors border border-slate-800"
      >
        Temizle
      </button>
    </div>
  );
}
