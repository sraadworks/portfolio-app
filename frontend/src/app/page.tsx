import { Grid, Card, Title, Text, Metric, Flex, ProgressBar } from "@tremor/react";
import { TremorPerformanceChart, TremorDistributionChart, KpiCard } from './TremorCharts';
import { API_URL } from './apiConfig';

interface Asset {
  id: number;
  symbol: string;
  name: string;
  currency: string;
  asset_type: string;
  active_value: number;
  active_cost: number;
  active_gross_profit: number;
  active_real_net_profit: number;
  active_usd_profit: number;
  active_usd_cost: number;
  active_usd_value: number;
}

async function getAssets(): Promise<Asset[]> {
  const res = await fetch(`${API_URL}/assets/`, { cache: 'no-store' });
  if (!res.ok) return [];
  return res.json();
}

async function getCashSummary() {
  const res = await fetch(`${API_URL}/cash-ledger/summary`, { cache: 'no-store' });
  if (!res.ok) return { TRY: 0, USD: 0 };
  return res.json();
}

async function getPerformanceData() {
  const res = await fetch(`${API_URL}/portfolio/performance`, { cache: 'no-store' });
  if (!res.ok) return { data: [], available_benchmarks: [] };
  return res.json();
}

export default async function Home() {
  const assets = await getAssets();
  const cashSummary = await getCashSummary();
  const performancePayload = await getPerformanceData();

  const totalCashTRY = cashSummary.TRY;
  const totalCashUSD = cashSummary.USD;

  const tryAssets = assets.filter((a: Asset) => a.currency === 'TRY');
  const usdAssets = assets.filter((a: Asset) => a.currency === 'USD');

  // TRY Metrics
  const totalTRYValue = tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_value || 0), 0);
  const totalTRYCost = tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_cost || 0), 0);
  const totalTRYGrossProfit = tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_gross_profit || 0), 0);
  const totalTRYRealProfit = tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_real_net_profit || 0), 0);
  const tryPercent = totalTRYCost > 0 ? (totalTRYGrossProfit / totalTRYCost) * 100 : 0;
  
  const totalTRYUSDProfit = tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_usd_profit || 0), 0);
  const totalTRYUSDCost = tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_usd_cost || 0), 0);
  const tryUSDPercent = totalTRYUSDCost > 0 ? (totalTRYUSDProfit / totalTRYUSDCost) * 100 : 0;

  // USD Metrics
  const totalUSDValue = usdAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_value || 0), 0) + 
                       tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_usd_value || 0), 0);
  
  const totalUSDCost = usdAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_cost || 0), 0) + 
                       tryAssets.reduce((acc: number, curr: Asset) => acc + (curr.active_usd_cost || 0), 0);
  
  const totalUSDProfit = totalUSDValue - totalUSDCost;
  const usdPercent = totalUSDCost > 0 ? (totalUSDProfit / totalUSDCost) * 100 : 0;

  // Prepare Distribution Data
  const assetDistribution = assets.map((a: Asset) => ({
    name: a.symbol,
    value: a.currency === 'TRY' ? a.active_value : a.active_value * 32.5, // Dummy rate for overview
  }));
  if (totalCashTRY > 0) assetDistribution.push({ name: 'Nakit (TL)', value: totalCashTRY });
  if (totalCashUSD > 0) assetDistribution.push({ name: 'Nakit (USD)', value: totalCashUSD * 32.5 });

  return (
    <div className="space-y-6">
      <Title>Yatırım Portföyü Dashboard</Title>
      <Text>Portföyünüzün gerçek zamanlı performans ve dağılım analizi.</Text>

      <Grid numItemsMd={2} numItemsLg={4} className="gap-6 mt-6">
        <KpiCard 
          title="Toplam TL Varlık" 
          metric={`₺${totalTRYValue.toLocaleString()}`} 
          delta={`%${tryPercent.toFixed(1)}`}
          deltaType={tryPercent >= 0 ? "moderateIncrease" : "moderateDecrease"}
          subtitle={`Brüt Kâr: ₺${totalTRYGrossProfit.toLocaleString()}`}
        />
        <KpiCard 
          title="TL Varlık USD Bazlı" 
          metric={`%${tryUSDPercent.toFixed(1)}`} 
          delta={tryUSDPercent >= 0 ? "Pozitif" : "Negatif"}
          deltaType={tryUSDPercent >= 0 ? "increase" : "decrease"}
          subtitle="Döviz bazlı reel getiri"
        />
        <KpiCard 
          title="Toplam USD Portföy" 
          metric={`$${totalUSDValue.toLocaleString()}`} 
          delta={`%${usdPercent.toFixed(1)}`}
          deltaType={usdPercent >= 0 ? "moderateIncrease" : "moderateDecrease"}
          subtitle={`Net USD Kâr: $${totalUSDProfit.toLocaleString()}`}
        />
        <KpiCard 
          title="Toplam Nakit" 
          metric={`₺${totalCashTRY.toLocaleString()}`} 
          subtitle={`USD Nakit: $${totalCashUSD.toLocaleString()}`}
        />
      </Grid>

      <TremorPerformanceChart 
        data={performancePayload.data} 
        categories={["Portföy", ...performancePayload.available_benchmarks.map((b: string) => `${b}_pct`)]}
        colors={["indigo", "cyan", "amber", "rose", "emerald"]}
      />

      <Grid numItemsMd={1} numItemsLg={2} className="gap-6 mt-6">
        <TremorDistributionChart data={assetDistribution.sort((a: any, b: any) => b.value - a.value)} title="Varlık Dağılımı (TL Bazlı)" />
        <Card>
          <Title>Portföy Sağlığı</Title>
          <div className="mt-4 space-y-4">
            <div>
              <Flex>
                <Text>TL Varlık Reel Getiri (Enflasyon Arındırılmış)</Text>
                <Text>{totalTRYRealProfit >= 0 ? "+" : ""}{totalTRYRealProfit.toLocaleString()} ₺</Text>
              </Flex>
              <ProgressBar value={Math.min(100, Math.max(0, tryPercent))} color="indigo" className="mt-2" />
            </div>
            <div>
              <Flex>
                <Text>USD Bazlı Büyüme</Text>
                <Text>%{usdPercent.toFixed(1)}</Text>
              </Flex>
              <ProgressBar value={Math.min(100, Math.max(0, usdPercent))} color="cyan" className="mt-2" />
            </div>
          </div>
        </Card>
      </Grid>
    </div>
  );
}
