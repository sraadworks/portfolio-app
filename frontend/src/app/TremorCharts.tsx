'use client';

import { Card, AreaChart, Title, Text, DonutChart, Flex, Legend, BadgeDelta, Metric, Grid } from '@tremor/react';

export function TremorPerformanceChart({ data, categories, colors }: { data: any[], categories: string[], colors: any[] }) {
  return (
    <Card className="mt-8">
      <Title>Portföy Performansı</Title>
      <Text>Kümülatif Getiri Karşılaştırması (%)</Text>
      <AreaChart
        className="mt-4 h-80"
        data={data}
        index="date"
        categories={categories}
        colors={colors}
        valueFormatter={(number: number) => `%${number.toFixed(2)}`}
        yAxisWidth={40}
        showAnimation={true}
      />
    </Card>
  );
}

export function TremorDistributionChart({ data, title }: { data: any[], title: string }) {
  return (
    <Card>
      <Title>{title}</Title>
      <DonutChart
        className="mt-6 h-60"
        data={data}
        category="value"
        index="name"
        valueFormatter={(number: number) => `₺${number.toLocaleString()}`}
        colors={["indigo", "emerald", "amber", "rose", "violet", "cyan"]}
        showAnimation={true}
      />
      <Legend
        className="mt-6"
        categories={data.map(d => d.name)}
        colors={["indigo", "emerald", "amber", "rose", "violet", "cyan"]}
      />
    </Card>
  );
}

export function KpiCard({ title, metric, delta, deltaType, subtitle }: { title: string, metric: string, delta?: string, deltaType?: any, subtitle?: string }) {
  return (
    <Card decoration="top" decorationColor="indigo">
      <Flex alignItems="start">
        <div className="truncate">
          <Text>{title}</Text>
          <Metric className="truncate">{metric}</Metric>
        </div>
        {delta && (
          <BadgeDelta deltaType={deltaType}>{delta}</BadgeDelta>
        )}
      </Flex>
      {subtitle && <Text className="mt-2 truncate">{subtitle}</Text>}
    </Card>
  );
}
