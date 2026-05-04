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
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">TÜFE Endeksi</h1>
          <p className="text-slate-500 mt-1">Enflasyon düzeltmesi hesaplamalarında kullanılan aylık enflasyon oranları.</p>
        </div>
        <AddCpiForm />
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <strong>Nasıl Çalışır:</strong> İlgili para birimi (TRY veya USD) için açıklanan aylık enflasyon oranını (%) buradan giriniz. 
        Sistem, varlığınızın para birimine göre uygun enflasyon verisini kullanarak &quot;TÜFE Düzeltmesi&quot; hesaplamasını otomatik olarak gerçekleştirir.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TRY Table */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-black">TL</span>
            TL (TRY) Tüfe Oranları
          </h2>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-base uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-bold">Ay</th>
                    <th className="px-6 py-4 font-bold text-right">Oran (%)</th>
                    <th className="px-6 py-4 font-bold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="text-lg divide-y divide-slate-100">
                  {data.filter((i: any) => i.currency === 'TRY').length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Veri yok.</td>
                    </tr>
                  ) : (
                    data.filter((i: any) => i.currency === 'TRY').map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-700">{item.date}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">%{item.cpi_value.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
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

        {/* USD Table */}
        <div className="flex flex-col gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-black">US</span>
            Dolar (USD) Tüfe Oranları
          </h2>
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100 text-base uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4 font-bold">Ay</th>
                    <th className="px-6 py-4 font-bold text-right">Oran (%)</th>
                    <th className="px-6 py-4 font-bold text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="text-lg divide-y divide-slate-100">
                  {data.filter((i: any) => i.currency === 'USD').length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-slate-400">Veri yok.</td>
                    </tr>
                  ) : (
                    data.filter((i: any) => i.currency === 'USD').map((item: any) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-slate-700">{item.date}</td>
                        <td className="px-6 py-4 text-right font-bold text-slate-900">%{item.cpi_value.toFixed(2)}</td>
                        <td className="px-6 py-4 text-right">
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
      </div>

      {/* Benchmark Data Section */}
      <div className="flex flex-col gap-6 mt-4 border-t border-slate-100 pt-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Güncel Piyasa Göstergeleri</h2>
            <p className="text-slate-500 text-sm">Grafik karşılaştırmalarında kullanılan en son veriler.</p>
          </div>
          <AddBenchmarkForm />
        </div>

        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-base uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-bold">Son Güncelleme</th>
                  <th className="px-6 py-4 font-bold">Endeks / Varlık</th>
                  <th className="px-6 py-4 font-bold text-right">Güncel Değer</th>
                </tr>
              </thead>
              <tbody className="text-lg divide-y divide-slate-100">
                {(() => {
                  // Her isim için sadece en güncel olanı filtrele
                  const latestBenchmarks: any[] = [];
                  const seenNames = new Set();
                  
                  // benchmarkData zaten tarihe göre azalan (desc) sıralı geliyor
                  benchmarkData.forEach((item: any) => {
                    if (!seenNames.has(item.name)) {
                      latestBenchmarks.push(item);
                      seenNames.add(item.name);
                    }
                  });

                  if (latestBenchmarks.length === 0) {
                    return (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium">
                          Henüz piyasa verisi eklenmemiş. SYNC butonlarını kullanarak veri çekebilirsiniz.
                        </td>
                      </tr>
                    );
                  }

                  return latestBenchmarks.map((item: any) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-600">{item.date}</td>
                      <td className="px-6 py-4">
                        <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold uppercase">{item.name}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-slate-900">{item.value.toLocaleString()}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
