import { Card, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell, Text, Title, Badge, BadgeDelta, Flex } from "@tremor/react";
import { API_URL } from "../apiConfig";
import AddAssetForm from './AddAssetForm';
import AddTransactionForm from './AddTransactionForm';
import AssetDetailModal from './AssetDetailModal';
import AssetActions from './AssetActions';

async function getAssets() {
  const res = await fetch(`${API_URL}/assets/`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

export default async function AssetsPage() {
  const allAssets = await getAssets();
  
  const activeAssets = allAssets.filter((a: any) => a.active_quantity > 0);
  const closedAssets = allAssets.filter((a: any) => a.active_quantity <= 0);

  return (
    <div className="space-y-8">
      <Flex justifyContent="between" alignItems="center">
        <div>
          <Title>Varlıklarım</Title>
          <Text>Portföyünüzdeki tüm aktif yatırımlar ve performans analizi.</Text>
        </div>
        <div className="flex gap-2">
          <AddTransactionForm assets={allAssets} />
          <AddAssetForm />
        </div>
      </Flex>
      
      {/* 1. AKTİF VARLIKLAR */}
      <Card>
        <Title>Aktif Varlıklar (Mevcut Portföy)</Title>
        <Table className="mt-5">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Sembol</TableHeaderCell>
              <TableHeaderCell>Tip</TableHeaderCell>
              <TableHeaderCell className="text-right">Adet</TableHeaderCell>
              <TableHeaderCell className="text-right">Ort. Maliyet</TableHeaderCell>
              <TableHeaderCell className="text-right">Fiyat</TableHeaderCell>
              <TableHeaderCell className="text-right">USD Değer</TableHeaderCell>
              <TableHeaderCell className="text-right">USD Getiri</TableHeaderCell>
              <TableHeaderCell className="text-right">Reel Net Kâr (TL)</TableHeaderCell>
              <TableHeaderCell className="text-center">Detay</TableHeaderCell>
              <TableHeaderCell className="text-center">İşlemler</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center">
                  Henüz aktif bir varlığınız bulunmuyor.
                </TableCell>
              </TableRow>
            ) : (
              activeAssets.map((asset: any) => {
                const avgCost = asset.active_quantity > 0 ? asset.active_cost / asset.active_quantity : 0;
                const isUSDProfit = asset.active_usd_profit >= 0;
                
                return (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <Text className="font-bold">{asset.symbol}</Text>
                      <Text className="text-xs text-slate-400">{asset.name}</Text>
                    </TableCell>
                    <TableCell>
                      <Badge size="xs" color="indigo">{asset.asset_type}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{asset.active_quantity}</TableCell>
                    <TableCell className="text-right">
                      <Text>{avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {asset.currency}</Text>
                    </TableCell>
                    <TableCell className="text-right">
                      <Text className="font-bold">{asset.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {asset.currency}</Text>
                    </TableCell>
                    <TableCell className="text-right">
                      <Text className="font-bold">${asset.active_usd_value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                      <Text className="text-[10px] text-slate-400">Maliyet: ${asset.active_usd_cost?.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</Text>
                    </TableCell>
                    <TableCell className="text-right">
                      <BadgeDelta deltaType={isUSDProfit ? "moderateIncrease" : "moderateDecrease"} size="xs">
                        %{asset.active_usd_percent?.toFixed(2)}
                      </BadgeDelta>
                      <Text className={`text-[10px] font-bold mt-1 ${isUSDProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isUSDProfit ? '+' : ''}${asset.active_usd_profit?.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </Text>
                    </TableCell>
                    <TableCell className="text-right">
                      <Text className={`font-bold ${asset.active_real_net_profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {asset.active_real_net_profit >= 0 ? '+' : ''}{asset.active_real_net_profit.toLocaleString(undefined, { maximumFractionDigits: 0 })} ₺
                      </Text>
                      <Text className="text-[10px] text-slate-400">Enflasyon Arındırılmış</Text>
                    </TableCell>
                    <TableCell className="text-center">
                      <AssetDetailModal asset={asset} />
                    </TableCell>
                    <TableCell className="text-center">
                      <AssetActions asset={asset} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* 2. KAPANAN POZİSYONLAR */}
      <Card>
        <Title>Kapanan Pozisyonlar (İşlem Geçmişi)</Title>
        <Table className="mt-5">
          <TableHead>
            <TableRow>
              <TableHeaderCell>Sembol</TableHeaderCell>
              <TableHeaderCell>Tip</TableHeaderCell>
              <TableHeaderCell className="text-right">Toplam Maliyet</TableHeaderCell>
              <TableHeaderCell className="text-right">Satış Geliri</TableHeaderCell>
              <TableHeaderCell className="text-right">Gerçekleşen Kâr</TableHeaderCell>
              <TableHeaderCell className="text-right">Reel Net Kâr (TL)</TableHeaderCell>
              <TableHeaderCell className="text-center">Detay</TableHeaderCell>
              <TableHeaderCell className="text-center">İşlemler</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {closedAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  Kapanmış bir pozisyonunuz bulunmuyor.
                </TableCell>
              </TableRow>
            ) : (
              closedAssets.map((asset: any) => {
                const isProfit = asset.total_gross_profit >= 0;
                const isRealProfit = asset.total_real_net_profit >= 0;
                const percent = asset.total_cost > 0 ? (asset.total_gross_profit / asset.total_cost) * 100 : 0;
                
                return (
                  <TableRow key={asset.id}>
                    <TableCell>
                      <Text className="font-bold">{asset.symbol}</Text>
                      <Text className="text-xs text-slate-400">{asset.name}</Text>
                    </TableCell>
                    <TableCell>
                      <Badge size="xs" color="slate">{asset.asset_type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Text>{asset.total_cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {asset.currency}</Text>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {(asset.total_cost + asset.total_gross_profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {asset.currency}
                    </TableCell>
                    <TableCell className="text-right">
                      <BadgeDelta deltaType={isProfit ? "moderateIncrease" : "moderateDecrease"} size="xs">
                        %{percent.toFixed(2)}
                      </BadgeDelta>
                      <Text className={`text-[10px] font-bold mt-1 ${isProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isProfit ? '+' : ''}{asset.total_gross_profit.toLocaleString(undefined, { maximumFractionDigits: 0 })} {asset.currency}
                      </Text>
                    </TableCell>
                    <TableCell className="text-right">
                      <Text className={`font-bold ${isRealProfit ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isRealProfit ? '+' : ''}{asset.total_real_net_profit.toLocaleString(undefined, { maximumFractionDigits: 0 })} ₺
                      </Text>
                    </TableCell>
                    <TableCell className="text-center">
                      <AssetDetailModal asset={asset} />
                    </TableCell>
                    <TableCell className="text-center">
                      <AssetActions asset={asset} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
