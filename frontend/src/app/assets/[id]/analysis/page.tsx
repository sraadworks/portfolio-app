'use client';

import { Card, Title, Text, Flex, Badge, BadgeDelta, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Grid, Metric, List, ListItem, Divider, Button } from "@tremor/react";
import { API_URL } from "../../../apiConfig";
import Link from 'next/link';
import { use, useEffect, useState } from 'react';

interface Asset {
  id: number;
  symbol: string;
  name: string;
  currency: string;
  asset_type: string;
  active_quantity: number;
  active_cost: number;
  active_value: number;
  active_holding_days: number;
  active_gross_profit: number;
  active_net_profit: number;
  active_inflation_diff: number;
  active_real_net_profit: number;
  active_risk_margin_profit: number;
  active_usd_profit: number;
  active_usd_percent: number;
  risk_margin_rate: number;
  total_cost: number;
  total_gross_profit: number;
  total_real_net_profit: number;
  realized_revenue: number;
  realized_cost: number;
  realized_holding_days: number;
  realized_gross_profit: number;
  realized_net_profit: number;
  realized_inflation_diff: number;
  realized_real_net_profit: number;
  realized_risk_margin_profit: number;
  current_price: number;
}

interface Transaction {
  id: number;
  date: string;
  transaction_type: string;
  amount: number;
  price: number;
  usd_rate: number;
  tax: number;
  commission: number;
}

function fmt(val: number) {
  return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function AssetAnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  
  const [asset, setAsset] = useState<Asset | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [assetsRes, txsRes] = await Promise.all([
          fetch(`${API_URL}/assets/`),
          fetch(`${API_URL}/transactions/${id}`)
        ]);

        if (assetsRes.ok) {
          const assetsData = await assetsRes.json();
          if (Array.isArray(assetsData)) {
            const found = assetsData.find((a: any) => a.id.toString() === id);
            if (found) setAsset(found);
          }
        }

        if (txsRes.ok) {
          const txsData = await txsRes.json();
          if (Array.isArray(txsData)) {
            setTransactions(txsData);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [id]);

  if (loading) {
    return <Card className="m-10 text-center font-bold">Analiz Verileri Yükleniyor...</Card>;
  }

  if (!asset) {
    return <Card className="m-10 text-center text-rose-500">Özet sayfası yüklenemedi. (Varlık bulunamadı veya sunucuya bağlanılamadı)</Card>;
  }

  // Calculate monthly percentage
  let monthlyPercent = 0;
  const buyTxs = transactions.filter((t: Transaction) => t.transaction_type === 'BUY');
  if (buyTxs.length > 0) {
    const sortedBuys = [...buyTxs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstBuyDate = new Date(sortedBuys[0].date);
    let endDate = new Date();
    if (asset.active_quantity === 0) {
      const sellTxs = transactions.filter((t: Transaction) => t.transaction_type === 'SELL');
      if (sellTxs.length > 0) {
        const sortedSells = [...sellTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        endDate = new Date(sortedSells[0].date);
      }
    }
    const daysDiff = (endDate.getTime() - firstBuyDate.getTime()) / (1000 * 3600 * 24);
    const months = daysDiff / 30.44;
    if (months > 0 && asset.total_cost > 0) {
      const totalPercent = (asset.total_gross_profit / asset.total_cost) * 100;
      monthlyPercent = totalPercent / months;
    }
  }

  return (
    <div className="space-y-6">
      <Flex justifyContent="start" className="gap-4">
        <Link href="/assets">
          <Button variant="secondary" icon={() => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline' }}><path d="m15 18-6-6 6-6"/></svg>}>
            Geri
          </Button>
        </Link>
        <div>
          <Title className="text-3xl font-black">{asset.symbol}</Title>
          <Text>{asset.name} · {asset.asset_type}</Text>
        </div>
      </Flex>

      <Grid numItemsMd={2} numItemsLg={4} className="gap-4">
        <Card decoration="top" decorationColor="indigo">
          <Text>Toplam Maliyet</Text>
          <Metric>{fmt(asset.total_cost)} {asset.currency}</Metric>
        </Card>
        <Card decoration="top" decorationColor="emerald">
          <Text>Toplam Brüt Kâr</Text>
          <Flex>
            <Metric>
              {asset.total_gross_profit >= 0 ? "+" : ""}{fmt(asset.total_gross_profit)}
            </Metric>
            <BadgeDelta deltaType={asset.total_gross_profit >= 0 ? "moderateIncrease" : "moderateDecrease"}>
              %{(asset.total_cost > 0 ? (asset.total_gross_profit / asset.total_cost * 100) : 0).toFixed(1)}
            </BadgeDelta>
          </Flex>
        </Card>
        <Card decoration="top" decorationColor="slate">
          <Text>Reel Net Kâr (Enflasyon Arındırılmış)</Text>
          <Metric>
            {asset.total_real_net_profit >= 0 ? "+" : ""}{fmt(asset.total_real_net_profit)}
          </Metric>
        </Card>
        <Card decoration="top" decorationColor="blue">
          <Text>Aylık Ortalama Getiri</Text>
          <Metric>
            {monthlyPercent >= 0 ? "+" : ""}{monthlyPercent.toFixed(2)}%
          </Metric>
        </Card>
      </Grid>

      <Grid numItemsMd={1} numItemsLg={2} className="gap-6">
        <Card>
          <Flex>
            <Title>Aktif Pozisyon</Title>
            <Badge color="emerald">Açık</Badge>
          </Flex>
          {asset.active_quantity > 0 ? (
            <List className="mt-4">
              <ListItem>
                <span>Kalan Adet</span>
                <span className="font-bold">{asset.active_quantity}</span>
              </ListItem>
              <ListItem>
                <span>Güncel Fiyat</span>
                <span className="font-bold">{fmt(asset.current_price)} {asset.currency}</span>
              </ListItem>
              <ListItem>
                <span>Toplam Değer</span>
                <span className="font-bold">{fmt(asset.active_value)} {asset.currency}</span>
              </ListItem>
              <ListItem>
                <span>Elde Tutma Süresi</span>
                <span className="font-bold">{asset.active_holding_days} Gün</span>
              </ListItem>
              <Divider />
              <ListItem>
                <span className="font-bold">Aktif Brüt Kâr</span>
                <Text color={asset.active_gross_profit >= 0 ? "emerald" : "rose"} className="font-black text-lg">
                  {asset.active_gross_profit >= 0 ? "+" : ""}{fmt(asset.active_gross_profit)} {asset.currency}
                </Text>
              </ListItem>
              <ListItem>
                <span>Enflasyon Kaybı</span>
                <Text color="amber" className="font-bold">-{fmt(asset.active_inflation_diff)} {asset.currency}</Text>
              </ListItem>
              {asset.currency === 'TRY' && (
                <Card className="mt-4 bg-blue-50/50 border-blue-100 ring-0">
                  <Flex>
                    <div>
                      <Text className="font-bold text-blue-800">Dolar Bazlı Getiri</Text>
                      <Metric className="text-xl text-blue-600">
                        {asset.active_usd_profit >= 0 ? "+" : ""}${fmt(asset.active_usd_profit)}
                      </Metric>
                    </div>
                    <BadgeDelta deltaType={asset.active_usd_percent >= 0 ? "increase" : "decrease"}>
                      %{asset.active_usd_percent?.toFixed(2)}
                    </BadgeDelta>
                  </Flex>
                </Card>
              )}
            </List>
          ) : (
            <Text className="mt-10 text-center italic">Aktif pozisyon bulunmamaktadır.</Text>
          )}
        </Card>

        <Card>
          <Title>Kapanan (Gerçekleşen) İşlemler</Title>
          {asset.realized_revenue > 0 ? (
            <List className="mt-4">
              <ListItem>
                <span>Satış Geliri</span>
                <span className="font-bold">{fmt(asset.realized_revenue)} {asset.currency}</span>
              </ListItem>
              <ListItem>
                <span>Satılan Maliyet</span>
                <span className="font-bold">{fmt(asset.realized_cost)} {asset.currency}</span>
              </ListItem>
              <ListItem>
                <span>Gerçekleşen Brüt Kâr</span>
                <Text color={asset.realized_gross_profit >= 0 ? "emerald" : "rose"} className="font-bold">
                  {asset.realized_gross_profit >= 0 ? "+" : ""}{fmt(asset.realized_gross_profit)} {asset.currency}
                </Text>
              </ListItem>
              <ListItem>
                <span>Enflasyon Erimesi</span>
                <Text color="amber" className="font-bold">-{fmt(asset.realized_inflation_diff)} {asset.currency}</Text>
              </ListItem>
              <Divider />
              <ListItem>
                <span className="font-bold">Gerçekleşen Reel Kâr</span>
                <Metric className="text-lg">
                  {asset.realized_real_net_profit >= 0 ? "+" : ""}{fmt(asset.realized_real_net_profit)} {asset.currency}
                </Metric>
              </ListItem>
            </List>
          ) : (
            <Text className="mt-10 text-center italic">Gerçekleşmiş bir satış işlemi bulunmamaktadır.</Text>
          )}
        </Card>
      </Grid>

      <Card>
        <Title>İşlem Geçmişi</Title>
        <Table className="mt-5">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Tarih</TableHeaderCell>
              <TableHeaderCell>İşlem</TableHeaderCell>
              <TableHeaderCell className="text-right">Adet/Tutar</TableHeaderCell>
              <TableHeaderCell className="text-right">Fiyat</TableHeaderCell>
              <TableHeaderCell className="text-right">USD Kuru</TableHeaderCell>
              <TableHeaderCell className="text-right">Giderler</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.sort((a: Transaction, b: Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx: Transaction) => (
              <TableRow key={tx.id}>
                <TableCell>{tx.date}</TableCell>
                <TableCell>
                  <Badge size="xs" color={tx.transaction_type === 'BUY' ? 'blue' : tx.transaction_type === 'SELL' ? 'amber' : 'purple'}>
                    {tx.transaction_type === 'BUY' ? 'ALIŞ' : tx.transaction_type === 'SELL' ? 'SATIŞ' : 'TEMETTÜ'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-bold">{tx.amount.toLocaleString()}</TableCell>
                <TableCell className="text-right">{tx.price > 0 ? fmt(tx.price) + ' ' + asset.currency : '-'}</TableCell>
                <TableCell className="text-right text-blue-600 font-medium">{tx.usd_rate ? fmt(tx.usd_rate) : '-'}</TableCell>
                <TableCell className="text-right text-slate-400">
                  {tx.tax + tx.commission > 0 ? fmt(tx.tax + tx.commission) : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
