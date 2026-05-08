
import { API_URL } from "../apiConfig";
import AddCpiForm from './AddCpiForm';
import CpiActions from './CpiActions';
import AddBenchmarkForm from './AddBenchmarkForm';

async function getReferenceData() {
  const res = await fetch(`${API_URL}/reference-data/`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

async function getBenchmarkData() {
  const res = await fetch(`${API_URL}/benchmark-data/`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function ReferenceDataPage() {
  const data = await getReferenceData();
  const benchmarkData = await getBenchmarkData();

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">TÜFE & Piyasa Verileri</h1>
          <p className="text-sm text-slate-400 mt-1">Enflasyon düzeltmesi ve performans karşılaştırması için referans veriler.</p>
        </div>
        <div>
          <AddCpiForm />
        </div>
      </div>

      {/* Callout */}
      <div className="mb-8 p-4 border border-amber-500/20 bg-amber-500/5 rounded-xl text-amber-200/80 text-sm flex gap-3 items-start shadow-xl shadow-black/20">
        <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          <strong className="block text-amber-500 mb-1 font-semibold tracking-wide">Nasıl Çalışır?</strong>
          İlgili para birimi (TRY veya USD) için açıklanan aylık enflasyon oranını (%) buradan giriniz. 
          Sistem, varlığınızın para birimine göre uygun enflasyon verisini kullanarak "TÜFE Düzeltmesi" hesaplamasını otomatik olarak gerçekleştirir.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* TRY Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0B0F19] text-left text-sm shadow-2xl shadow-black/50">
          <div className="px-6 py-5 border-b border-slate-800 flex justify-start items-center gap-3 bg-slate-900/40">
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-semibold tracking-wide border uppercase bg-rose-500/10 text-rose-400 border-rose-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              TRY
            </span>
            <h2 className="text-lg font-semibold text-white tracking-tight">TL Tüfe Oranları</h2>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium text-left">Ay</th>
                  <th className="px-6 py-4 font-medium text-right">Oran (%)</th>
                  <th className="px-6 py-4 font-medium text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {data.filter((i: any) => i.currency === 'TRY').length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500 italic">Veri yok.</td></tr>
                ) : (
                  data.filter((i: any) => i.currency === 'TRY').map((item: any) => (
                    <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-300">{item.date}</td>
                      <td className="px-6 py-4 text-right font-semibold text-white">%{item.cpi_value.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center opacity-50 hover:opacity-100 transition-opacity">
                        <CpiActions item={item} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* USD Table */}
        <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0B0F19] text-left text-sm shadow-2xl shadow-black/50">
          <div className="px-6 py-5 border-b border-slate-800 flex justify-start items-center gap-3 bg-slate-900/40">
            <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-semibold tracking-wide border uppercase bg-blue-500/10 text-blue-400 border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              USD
            </span>
            <h2 className="text-lg font-semibold text-white tracking-tight">Dolar Tüfe Oranları</h2>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium text-left">Ay</th>
                  <th className="px-6 py-4 font-medium text-right">Oran (%)</th>
                  <th className="px-6 py-4 font-medium text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {data.filter((i: any) => i.currency === 'USD').length === 0 ? (
                  <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500 italic">Veri yok.</td></tr>
                ) : (
                  data.filter((i: any) => i.currency === 'USD').map((item: any) => (
                    <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-300">{item.date}</td>
                      <td className="px-6 py-4 text-right font-semibold text-white">%{item.cpi_value.toFixed(2)}</td>
                      <td className="px-6 py-4 text-center opacity-50 hover:opacity-100 transition-opacity">
                        <CpiActions item={item} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Benchmark Data Section */}
      <div className="border border-slate-800 rounded-xl overflow-hidden bg-[#0B0F19] text-left text-sm shadow-2xl shadow-black/50">
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">Güncel Piyasa Göstergeleri</h2>
            <p className="text-xs text-slate-400 mt-1">Grafik karşılaştırmalarında kullanılan en son veriler.</p>
          </div>
          <div>
            <AddBenchmarkForm />
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4 font-medium text-left">Son Güncelleme</th>
                <th className="px-6 py-4 font-medium text-left">Endeks / Varlık</th>
                <th className="px-6 py-4 font-medium text-right">Güncel Değer</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const latestBenchmarks: any[] = [];
                const seenNames = new Set();
                benchmarkData.forEach((item: any) => {
                  if (!seenNames.has(item.name)) {
                    latestBenchmarks.push(item);
                    seenNames.add(item.name);
                  }
                });

                if (latestBenchmarks.length === 0) {
                  return (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500 italic">Henüz piyasa verisi eklenmemiş.</td></tr>
                  );
                }

                return latestBenchmarks.map((item: any) => (
                  <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-300">{item.date}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-semibold tracking-wide border uppercase bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                        {item.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-white">
                      {item.value.toLocaleString()}
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
