'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Rose
  '#8b5cf6', // Violet
  '#06b6d4', // Cyan
  '#f97316', // Orange
];

export default function DistributionChart({ assets, cashSummary }: { assets: any[], cashSummary: any }) {
  const [tab, setTab] = useState('assets');

  // Prepare Asset Data (Including Cash as it is part of the portfolio)
  const assetData = assets.map(a => ({
    name: a.symbol,
    value: a.active_value,
    profit: a.active_gross_profit,
    type: a.asset_type
  }));

  if (cashSummary.TRY > 0) {
    assetData.push({ name: 'Nakit (TL)', value: cashSummary.TRY, profit: 0, type: 'Nakit' });
  }
  if (cashSummary.USD > 0) {
    assetData.push({ name: 'Nakit (USD)', value: cashSummary.USD, profit: 0, type: 'Nakit' });
  }
  assetData.sort((a, b) => b.value - a.value);

  // Prepare Sector Data
  const sectorMap: any = {};
  assets.forEach(a => {
    const sector = a.sector || 'Diğer';
    if (!sectorMap[sector]) sectorMap[sector] = 0;
    sectorMap[sector] += a.active_value;
  });
  if (cashSummary.TRY > 0 || cashSummary.USD > 0) {
    sectorMap['Nakit'] = (sectorMap['Nakit'] || 0) + cashSummary.TRY + cashSummary.USD;
  }
  const sectorData = Object.keys(sectorMap).map(s => ({
    name: s,
    value: sectorMap[s]
  })).sort((a, b) => b.value - a.value);

  const activeData = tab === 'assets' ? assetData : sectorData;
  const totalValue = activeData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)] h-[440px] flex flex-col transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col gap-5 mb-8">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Portföy Dağılımı</h3>
          <div className="bg-slate-100/80 p-1 rounded-2xl flex gap-1 border border-slate-200/50">
            <button 
              onClick={() => setTab('assets')}
              className={`px-5 py-2 text-[11px] font-black rounded-xl transition-all duration-300 ${tab === 'assets' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              VARLIKLAR
            </button>
            <button 
              onClick={() => setTab('sectors')}
              className={`px-5 py-2 text-[11px] font-black rounded-xl transition-all duration-300 ${tab === 'sectors' ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              SEKTÖRLER
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex gap-8 items-center overflow-hidden">
        <div className="w-[45%] h-full relative group">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {activeData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                formatter={(value: any) => [`₺${Number(value).toLocaleString()}`, 'Değer']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Toplam</span>
            <span className="text-xl font-black text-slate-900 leading-none">₺{totalValue.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex-1 h-full overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-3">
            {activeData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm font-medium">Veri bulunamadı.</div>
            ) : (
              activeData.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3.5 rounded-[1.25rem] bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:shadow-sm transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3.5 h-3.5 rounded-full shadow-sm" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div className="flex flex-col">
                      <span className="font-black text-slate-800 text-sm leading-tight">{item.name}</span>
                      {tab === 'assets' && <span className="text-[10px] font-bold text-slate-400 uppercase">{item.type}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-black text-slate-900">₺{item.value.toLocaleString()}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-1.5 rounded-md">
                        %{((item.value / (totalValue || 1)) * 100).toFixed(1)}
                      </span>
                      {tab === 'assets' && item.profit !== 0 && (
                        <span className={`text-[10px] font-bold ${item.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {item.profit >= 0 ? '+' : ''}{item.profit.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
