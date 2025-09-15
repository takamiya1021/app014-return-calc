'use client';

import React from 'react';
import { CalculationResult } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { formatCurrency, formatPercentage } from '@/services/calculator';

interface ResultDisplayProps {
  result: CalculationResult | null;
  onSave?: () => void;
  onExport?: () => void;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({
  result,
  onSave,
  onExport,
}) => {
  if (!result) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>計算結果</CardTitle>
          <div className="flex gap-2">
            {onSave && (
              <Button variant="outline" size="sm" onClick={onSave}>
                保存
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport}>
                CSV出力
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ResultCard
            title="最終資産額"
            value={formatCurrency(result.finalAmount)}
            isHighlight
          />
          <ResultCard
            title="元本総額"
            value={formatCurrency(result.totalPrincipal)}
          />
          <ResultCard
            title="利益総額"
            value={formatCurrency(result.totalProfit)}
            valueColor="text-emerald-600 dark:text-emerald-400"
          />
          <ResultCard
            title="利益率"
            value={formatPercentage(result.profitRate)}
            valueColor="text-blue-600 dark:text-blue-400"
          />
        </div>

        {/* 年次推移テーブル */}
        <div className="mt-8">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
            年次推移
          </h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    年
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    元本
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    利益
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    合計
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {result.yearlyBreakdown.slice(0, 5).map((data) => (
                  <tr key={data.year}>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {data.year}年目
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-900 dark:text-gray-100">
                      {formatCurrency(data.principal)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(data.profit)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(data.total)}
                    </td>
                  </tr>
                ))}
                {result.yearlyBreakdown.length > 5 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400">
                      ... {result.yearlyBreakdown.length - 5} 行省略 ...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ResultCardProps {
  title: string;
  value: string;
  isHighlight?: boolean;
  valueColor?: string;
}

const ResultCard: React.FC<ResultCardProps> = ({
  title,
  value,
  isHighlight = false,
  valueColor = '',
}) => {
  return (
    <div
      className={`p-4 rounded-lg ${
        isHighlight
          ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-700'
          : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
      }`}
    >
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
      <p className={`text-2xl font-bold ${valueColor || 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  );
};