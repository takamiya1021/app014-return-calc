'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CalculationParams, CalculationType, CompoundFrequency } from '@/types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { StorageService } from '@/services/storage';

const calculationSchema = z.object({
  initialAmount: z.string()
    .min(1, "初期投資額を入力してください")
    .refine((val) => !isNaN(Number(val)) && val !== "", {
      message: "初期投資額は数値で入力してください"
    })
    .transform((val) => Number(val))
    .refine((val) => val >= 0, {
      message: "初期投資額は0以上を入力してください"
    }),
  annualRate: z.string()
    .min(1, "年利率を入力してください")
    .refine((val) => !isNaN(Number(val)) && val !== "", {
      message: "年利率は数値で入力してください"
    })
    .transform((val) => Number(val))
    .refine((val) => val >= 0, {
      message: "年利率は0以上を入力してください"
    })
    .refine((val) => val <= 100, {
      message: "年利率は100以下を入力してください"
    }),
  investmentPeriod: z.string()
    .min(1, "投資期間を入力してください")
    .refine((val) => !isNaN(Number(val)) && val !== "", {
      message: "投資期間は数値で入力してください"
    })
    .transform((val) => Number(val))
    .refine((val) => val >= 1, {
      message: "投資期間は1年以上を入力してください"
    })
    .refine((val) => val <= 50, {
      message: "投資期間は50年以下を入力してください"
    }),
  monthlyDeposit: z.string()
    .min(1, "月額積立額を入力してください")
    .refine((val) => !isNaN(Number(val)) && val !== "", {
      message: "月額積立額は数値で入力してください"
    })
    .transform((val) => Number(val))
    .refine((val) => val >= 0, {
      message: "月額積立額は0以上を入力してください"
    }),
  bonusDeposit: z.string()
    .optional()
    .refine((val) => !val || (!isNaN(Number(val)) && val !== ""), {
      message: "ボーナス積立額は数値で入力してください"
    })
    .transform((val) => val ? Number(val) : 0)
    .refine((val) => val >= 0, {
      message: "ボーナス積立額は0以上を入力してください"
    }),
  bonusMonths: z.array(z.number().min(1).max(12)).optional(),
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
  const [bonusMonths, setBonusMonths] = useState<number[]>(
    defaultValues?.bonusMonths || [6, 12]
  );
  const [showBonusMonthsToggle, setShowBonusMonthsToggle] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CalculationParams>({
    resolver: zodResolver(calculationSchema),
    defaultValues: {
      initialAmount: String(defaultValues?.initialAmount || 1000000),
      annualRate: String(defaultValues?.annualRate || 5),
      investmentPeriod: String(defaultValues?.investmentPeriod || 10),
      monthlyDeposit: String(defaultValues?.monthlyDeposit || 30000),
      bonusDeposit: String(defaultValues?.bonusDeposit || 100000),
      bonusMonths: bonusMonths,
      compoundFrequency: compoundFrequency,
      calculationType: calculationType,
    },
  });

  // クライアントサイドでLocalStorageからデータを復元
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFormData = StorageService.getFormData();
      if (savedFormData) {
        setCalculationType(savedFormData.calculationType || 'compound');
        setCompoundFrequency(savedFormData.compoundFrequency || 'yearly');
        setBonusMonths(savedFormData.bonusMonths || [6, 12]);

        // フォーム値も復元
        if (savedFormData.initialAmount) setValue('initialAmount', String(savedFormData.initialAmount));
        if (savedFormData.annualRate) setValue('annualRate', String(savedFormData.annualRate));
        if (savedFormData.investmentPeriod) setValue('investmentPeriod', String(savedFormData.investmentPeriod));
        if (savedFormData.monthlyDeposit) setValue('monthlyDeposit', String(savedFormData.monthlyDeposit));
        if (savedFormData.bonusDeposit) setValue('bonusDeposit', String(savedFormData.bonusDeposit));
      }
    }
  }, [setValue]);

  // フォームデータが変更されたときの自動保存
  const formValues = watch();
  useEffect(() => {
    const formData = {
      ...formValues,
      calculationType,
      compoundFrequency,
      bonusMonths,
    };
    StorageService.saveFormData(formData);
  }, [formValues, calculationType, compoundFrequency, bonusMonths]);

  const onSubmit = (data: CalculationParams) => {
    onCalculate({
      ...data,
      calculationType,
      compoundFrequency,
      bonusMonths,
    });
  };

  const handleBonusMonthChange = (month: number, checked: boolean) => {
    if (checked) {
      setBonusMonths([...bonusMonths, month].sort((a, b) => a - b));
    } else {
      setBonusMonths(bonusMonths.filter(m => m !== month));
    }
  };

  // ボーナス積立額を監視（ボタン表示の判定用）
  const bonusDepositValue = watch('bonusDeposit');
  const hasBonusDeposit = bonusDepositValue && Number(bonusDepositValue) > 0;

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
              {...register('initialAmount')}
              fullWidth
            />

            <Input
              label="年利率"
              type="number"
              step="0.1"
              rightAddon="%"
              error={errors.annualRate?.message}
              {...register('annualRate')}
              fullWidth
            />

            <Input
              label="投資期間"
              type="number"
              rightAddon="年"
              error={errors.investmentPeriod?.message}
              {...register('investmentPeriod')}
              fullWidth
            />

            <Input
              label="月額積立額"
              type="number"
              rightAddon="円"
              error={errors.monthlyDeposit?.message}
              {...register('monthlyDeposit')}
              fullWidth
            />

            <Input
              label="ボーナス積立額"
              type="number"
              rightAddon="円"
              error={errors.bonusDeposit?.message}
              {...register('bonusDeposit')}
              fullWidth
              helpText="選択した月に追加で積み立てる金額"
            />
          </div>

          {/* ボーナス月選択（ボーナス積立額が入力されている時のみボタン表示） */}
          {hasBonusDeposit && (
            <div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowBonusMonthsToggle(!showBonusMonthsToggle)}
                className="mb-4"
              >
                {showBonusMonthsToggle ? '🔽' : '▶️'} ボーナス支給月を設定
                {bonusMonths.length > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    （{bonusMonths.map(m => `${m}月`).join('、')}）
                  </span>
                )}
              </Button>

              {showBonusMonthsToggle && (
                <div className="transition-all duration-300 ease-in-out overflow-hidden">
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <label
                        key={month}
                        className="flex items-center p-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer bg-white dark:bg-gray-900"
                      >
                        <input
                          type="checkbox"
                          checked={bonusMonths.includes(month)}
                          onChange={(e) => handleBonusMonthChange(month, e.target.checked)}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {month}月
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    複数月選択可能（現在選択: {bonusMonths.length > 0 ? bonusMonths.map(m => `${m}月`).join('、') : 'なし'}）
                  </p>
                </div>
              )}
            </div>
          )}

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