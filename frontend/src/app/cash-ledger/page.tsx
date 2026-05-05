import { Card, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Text, Title, Badge, Flex, Grid, Metric, Button } from "@tremor/react";
import { API_URL } from "../apiConfig";
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
    <div className="space-y-8">
      <Flex justifyContent="between" alignItems="center">
        <div>
          <Title>Kasa Defteri</Title>
          <Text>Nakit akışınızı ve anlık kasa bakiyelerinizi yönetin.</Text>
        </div>
        <CashTransactionForm />
      </Flex>
      
      <Grid numItemsMd={2} className="gap-6">
        <Card decoration="top" decorationColor="blue">
          <Text>TL Kasası</Text>
          <Metric>₺{cashSummary.TRY.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Metric>
        </Card>
        <Card decoration="top" decorationColor="emerald">
          <Text>Döviz Kasası (USD)</Text>
          <Metric>${cashSummary.USD.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Metric>
        </Card>
      </Grid>

      <Card>
        <CashFilters />
      </Card>

      <Card>
        <Flex justifyContent="between" alignItems="center">
          <Title>Son İşlemler</Title>
          <Badge color="slate">{total} İşlem</Badge>
        </Flex>
        <Table className="mt-6">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Tarih</TableHeaderCell>
              <TableHeaderCell>İşlem Tipi</TableHeaderCell>
              <TableHeaderCell>Açıklama</TableHeaderCell>
              <TableHeaderCell className="text-right">Tutar</TableHeaderCell>
              <TableHeaderCell className="text-center">İşlemler</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cashLedger.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Filtrelere uygun nakit hareketi bulunmuyor.
                </TableCell>
              </TableRow>
            ) : (
              cashLedger.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Text>{item.date}</Text>
                  </TableCell>
                  <TableCell>
                    <Badge size="xs" color={
                      item.transaction_type === 'DEPOSIT' ? 'blue' :
                      item.transaction_type === 'WITHDRAW' ? 'rose' :
                      item.transaction_type === 'BUY' ? 'slate' :
                      item.transaction_type === 'SELL' ? 'emerald' :
                      'amber'
                    }>
                      {item.transaction_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Text className="truncate max-w-xs">{item.description}</Text>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    <Text color={item.amount >= 0 ? "emerald" : "rose"} className="font-bold">
                      {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString(item.currency === 'TRY' ? 'tr-TR' : 'en-US', { style: 'currency', currency: item.currency })}
                    </Text>
                  </TableCell>
                  <TableCell className="text-center">
                    <CashActions item={item} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <Flex justifyContent="between" alignItems="center" className="mt-8 pt-4 border-t border-slate-100">
            <Text>
              Sayfa <strong>{currentPage}</strong> / <strong>{totalPages}</strong>
            </Text>
            <div className="flex gap-2">
              <Link href={skip > 0 ? `?${new URLSearchParams({...Object.fromEntries(Object.entries(searchParams).filter(([k, v]) => typeof v === 'string')), skip: (skip - limit).toString()}).toString()}` : '#'}>
                <Button variant="secondary" size="xs" disabled={skip === 0}>Geri</Button>
              </Link>
              <Link href={skip + limit < total ? `?${new URLSearchParams({...Object.fromEntries(Object.entries(searchParams).filter(([k, v]) => typeof v === 'string')), skip: (skip + limit).toString()}).toString()}` : '#'}>
                <Button variant="secondary" size="xs" disabled={skip + limit >= total}>İleri</Button>
              </Link>
            </div>
          </Flex>
        )}
      </Card>
    </div>
  );
}
