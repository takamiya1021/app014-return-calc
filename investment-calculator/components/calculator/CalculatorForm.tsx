'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalculationParams, CalculationType, CompoundFrequency } from '@/types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

const calculationSchema = z.object({
  initialAmount: z.number().min(0, '初期投資額は0以上を入力してください'),
  annualRate: z.number().min(0, '年利率は0以上を入力してください').max(100, '年利率は100以下を入力してください'),
  investmentPeriod: z.number().min(1, '投資期間は1年以上を入力してください').max(50, '投資期間は50年以下を入力してください'),
  monthlyDeposit: z.number().min(0, '月額積立額は0以上を入力してください'),
  bonusDeposit: z.number().min(0, 'ボーナス積立額は0以上を入力してください').optional(),
  compoundFrequency: z.enum(['yearly', 'monthly'] as const),
  calculationType: z.enum(['simple', 'compound'] as const),
});

interface CalculatorFormProps {
  onCalculate: (params: CalculationParams) => void;
  defaultValues?: Partial<CalculationParams>;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  onCalculate,
  defaultValues,
}) => {
  const [calculationType, setCalculationType] = useState<CalculationType>(
    defaultValues?.calculationType || 'compound'
  );
  const [compoundFrequency, setCompoundFrequency] = useState<CompoundFrequency>(
    defaultValues?.compoundFrequency || 'yearly'
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CalculationParams>({
    resolver: zodResolver(calculationSchema),
    defaultValues: {
      initialAmount: defaultValues?.initialAmount || 1000000,
      annualRate: defaultValues?.annualRate || 5,
      investmentPeriod: defaultValues?.investmentPeriod || 10,
      monthlyDeposit: defaultValues?.monthlyDeposit || 30000,
      bonusDeposit: defaultValues?.bonusDeposit || 100000,
      compoundFrequency: compoundFrequency,
      calculationType: calculationType,
    },
  });

  const onSubmit = (data: CalculationParams) => {
    onCalculate({
      ...data,
      calculationType,
      compoundFrequency,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>投資条件を入力</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 計算種別選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              計算方法
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="compound"
                  checked={calculationType === 'compound'}
                  onChange={(e) => {
                    setCalculationType(e.target.value as CalculationType);
                    setValue('calculationType', e.target.value as CalculationType);
                  }}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">複利計算</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="simple"
                  checked={calculationType === 'simple'}
                  onChange={(e) => {
                    setCalculationType(e.target.value as CalculationType);
                    setValue('calculationType', e.target.value as CalculationType);
                  }}
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">単利計算</span>
              </label>
            </div>
          </div>

          {/* 複利計算頻度（複利選択時のみ表示） */}
          {calculationType === 'compound' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                複利計算頻度
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="yearly"
                    checked={compoundFrequency === 'yearly'}
                    onChange={(e) => {
                      setCompoundFrequency(e.target.value as CompoundFrequency);
                      setValue('compoundFrequency', e.target.value as CompoundFrequency);
                    }}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">年複利</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="monthly"
                    checked={compoundFrequency === 'monthly'}
                    onChange={(e) => {
                      setCompoundFrequency(e.target.value as CompoundFrequency);
                      setValue('compoundFrequency', e.target.value as CompoundFrequency);
                    }}
                    className="mr-2"
                  />
                  <span className="text-gray-700 dark:text-gray-300">月複利</span>
                </label>
              </div>
            </div>
          )}

          {/* 入力フィールド */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="初期投資額"
              type="number"
              rightAddon="円"
              error={errors.initialAmount?.message}
              {...register('initialAmount', { valueAsNumber: true })}
              fullWidth
            />

            <Input
              label="年利率"
              type="number"
              step="0.1"
              rightAddon="%"
              error={errors.annualRate?.message}
              {...register('annualRate', { valueAsNumber: true })}
              fullWidth
            />

            <Input
              label="投資期間"
              type="number"
              rightAddon="年"
              error={errors.investmentPeriod?.message}
              {...register('investmentPeriod', { valueAsNumber: true })}
              fullWidth
            />

            <Input
              label="月額積立額"
              type="number"
              rightAddon="円"
              error={errors.monthlyDeposit?.message}
              {...register('monthlyDeposit', { valueAsNumber: true })}
              fullWidth
            />

            <Input
              label="ボーナス積立額（年2回）"
              type="number"
              rightAddon="円"
              error={errors.bonusDeposit?.message}
              {...register('bonusDeposit', { valueAsNumber: true })}
              fullWidth
              helpText="6月と12月に追加で積み立てる金額"
            />
          </div>

          {/* 計算ボタン */}
          <div className="flex justify-end">
            <Button type="submit" size="lg">
              計算する
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};