'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { YearlyData } from '@/types';
import { formatCurrency } from '@/services/calculator';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

interface AssetChartProps {
  data: YearlyData[];
  chartType?: 'line' | 'area';
}

export const AssetChart: React.FC<AssetChartProps> = ({ data, chartType = 'area' }) => {
  const formatYAxis = (value: number) => {
    if (value >= 100000000) {
      return `${(value / 100000000).toFixed(1)}億`;
    } else if (value >= 10000) {
      return `${(value / 10000).toFixed(0)}万`;
    }
    return value.toString();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {`${label}年目`}
          </p>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value as number)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>資産推移グラフ</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          {chartType === 'line' ? (
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="year"
                label={{ value: '年', position: 'insideBottomRight', offset: -10 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                tickFormatter={formatYAxis}
                label={{ value: '金額', angle: -90, position: 'insideLeft' }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="principal"
                name="元本"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="total"
                name="総資産"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          ) : (
            <AreaChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis
                dataKey="year"
                label={{ value: '年', position: 'insideBottomRight', offset: -10 }}
                className="text-gray-600 dark:text-gray-400"
              />
              <YAxis
                tickFormatter={formatYAxis}
                label={{ value: '金額', angle: -90, position: 'insideLeft' }}
                className="text-gray-600 dark:text-gray-400"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="principal"
                stackId="1"
                name="元本"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="profit"
                stackId="1"
                name="利益"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};