'use client';

import { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PerformanceChart({ performancePayload }: { performancePayload: any }) {
  const [period, setPeriod] = useState('1M');
  const data = performancePayload?.data || [];
  const availableBenchmarks = performancePayload?.available_benchmarks || [];

  const filteredData = useMemo(() => {
    const now = new Date();
    let days = 30;
    if (period === '3M') days = 90;
    if (period === 'YTD') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      days = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 3600 * 24));
    }
    if (period === 'ALL') days = 365;

    const sliced = data.slice(-days);
    if (sliced.length === 0) return [];

    return sliced.map((row: any) => {
      const newRow = { ...row };
      availableBenchmarks.forEach((bench: string) => {
        if (row[bench] !== undefined) {
          const firstVal = sliced.find((r: any) => r[bench] !== undefined)?.[bench];
          if (firstVal) {
            newRow[`${bench}_pct`] = ((row[bench] / firstVal) - 1) * 100;
          }
        }
      });
      return newRow;
    });
  }, [data, period, availableBenchmarks]);

  const COLORS = ['#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-slate-200/60 shadow-[0_20px_50px_rgba(0,0,0,0.04)] h-[440px] flex flex-col transition-all hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Portföy Performansı</h3>
          <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Kümülatif Getiri Karşılaştırması (%)</p>
        </div>
        <div className="flex gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
          {['1M', '3M', 'YTD', 'ALL'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 text-[10px] font-black rounded-xl transition-all duration-300 ${period === p ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {p === 'ALL' ? 'TÜMÜ' : p}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPort" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              minTickGap={40}
              tickFormatter={(str) => {
                const date = new Date(str);
                return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
              }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              tickFormatter={(val) => `%${val}`}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
              labelStyle={{ fontWeight: '900', marginBottom: '8px', fontSize: '12px', color: '#1e293b' }}
              itemStyle={{ fontSize: '12px', padding: '4px 0', fontWeight: '700' }}
            />
            <Legend 
              iconType="circle" 
              verticalAlign="top" 
              align="right" 
              wrapperStyle={{ fontSize: '10px', fontWeight: '800', paddingBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }} 
            />
            
            <Area 
              type="monotone" 
              dataKey="Portföy" 
              stroke="#6366f1" 
              strokeWidth={4} 
              fillOpacity={1} 
              fill="url(#colorPort)"
              activeDot={{ r: 6, strokeWidth: 0 }} 
            />

            {availableBenchmarks.map((bench: string, index: number) => (
              <Area 
                key={bench}
                type="monotone" 
                dataKey={`${bench}_pct`} 
                name={bench}
                stroke={COLORS[index % COLORS.length]} 
                strokeWidth={2} 
                fill="transparent"
                strokeDasharray="6 4"
                dot={false} 
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
