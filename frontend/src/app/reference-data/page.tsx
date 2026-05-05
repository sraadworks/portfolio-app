import { Card, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Text, Title, Badge, Flex, Grid, Callout } from "@tremor/react";
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
    <div className="space-y-8">
      <Flex justifyContent="between" alignItems="center">
        <div>
          <Title>TÜFE & Piyasa Verileri</Title>
          <Text>Enflasyon düzeltmesi ve performans karşılaştırması için referans veriler.</Text>
        </div>
        <AddCpiForm />
      </Flex>

      <Callout title="Nasıl Çalışır?" color="amber">
        İlgili para birimi (TRY veya USD) için açıklanan aylık enflasyon oranını (%) buradan giriniz. 
        Sistem, varlığınızın para birimine göre uygun enflasyon verisini kullanarak "TÜFE Düzeltmesi" hesaplamasını otomatik olarak gerçekleştirir.
      </Callout>

      <Grid numItemsMd={1} numItemsLg={2} className="gap-8">
        {/* TRY Table */}
        <Card>
          <Flex justifyContent="start" className="gap-2">
            <Badge color="rose">TRY</Badge>
            <Title>TL Tüfe Oranları</Title>
          </Flex>
          <Table className="mt-4">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Ay</TableHeaderCell>
                <TableHeaderCell className="text-right">Oran (%)</TableHeaderCell>
                <TableHeaderCell className="text-center">İşlemler</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.filter((i: any) => i.currency === 'TRY').length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Veri yok.</TableCell>
                </TableRow>
              ) : (
                data.filter((i: any) => i.currency === 'TRY').map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell><Text>{item.date}</Text></TableCell>
                    <TableCell className="text-right font-bold text-slate-900">%{item.cpi_value.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <CpiActions item={item} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* USD Table */}
        <Card>
          <Flex justifyContent="start" className="gap-2">
            <Badge color="blue">USD</Badge>
            <Title>Dolar Tüfe Oranları</Title>
          </Flex>
          <Table className="mt-4">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Ay</TableHeaderCell>
                <TableHeaderCell className="text-right">Oran (%)</TableHeaderCell>
                <TableHeaderCell className="text-center">İşlemler</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.filter((i: any) => i.currency === 'USD').length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">Veri yok.</TableCell>
                </TableRow>
              ) : (
                data.filter((i: any) => i.currency === 'USD').map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell><Text>{item.date}</Text></TableCell>
                    <TableCell className="text-right font-bold text-slate-900">%{item.cpi_value.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <CpiActions item={item} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </Grid>

      {/* Benchmark Data Section */}
      <Card>
        <Flex justifyContent="between" alignItems="center">
          <div>
            <Title>Güncel Piyasa Göstergeleri</Title>
            <Text>Grafik karşılaştırmalarında kullanılan en son veriler.</Text>
          </div>
          <AddBenchmarkForm />
        </Flex>

        <Table className="mt-6">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Son Güncelleme</TableHeaderCell>
              <TableHeaderCell>Endeks / Varlık</TableHeaderCell>
              <TableHeaderCell className="text-right">Güncel Değer</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
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
                  <TableRow>
                    <TableCell colSpan={3} className="text-center italic">
                      Henüz piyasa verisi eklenmemiş.
                    </TableCell>
                  </TableRow>
                );
              }

              return latestBenchmarks.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell><Text>{item.date}</Text></TableCell>
                  <TableCell>
                    <Badge color="indigo">{item.name}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-900">
                    {item.value.toLocaleString()}
                  </TableCell>
                </TableRow>
              ));
            })()}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
