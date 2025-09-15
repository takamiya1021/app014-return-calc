'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { CalculationParams, CalculationType, CompoundFrequency } from '@/types';

// フォーム用の型（文字列ベース）
type FormData = {
  initialAmount: string;
  annualRate: string;
  investmentPeriod: string;
  monthlyDeposit: string;
  bonusDeposit?: string;
  bonusMonths?: number[];
  compoundFrequency: CompoundFrequency;
  calculationType: CalculationType;
};
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { StorageService } from '@/services/storage';


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
  } = useForm<FormData>({
    mode: 'onChange',
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

  const onSubmit = (data: FormData) => {
    // 手動バリデーション
    const errors: Record<string, string> = {};

    // 数値変換とバリデーション
    const initialAmount = Number(data.initialAmount);
    const annualRate = Number(data.annualRate);
    const investmentPeriod = Number(data.investmentPeriod);
    const monthlyDeposit = Number(data.monthlyDeposit);
    const bonusDeposit = data.bonusDeposit ? Number(data.bonusDeposit) : 0;

    if (isNaN(initialAmount) || initialAmount < 0) errors.initialAmount = "初期投資額は0以上の数値を入力してください";
    if (isNaN(annualRate) || annualRate < 0 || annualRate > 100) errors.annualRate = "年利率は0-100の数値を入力してください";
    if (isNaN(investmentPeriod) || investmentPeriod < 1 || investmentPeriod > 50) errors.investmentPeriod = "投資期間は1-50年で入力してください";
    if (isNaN(monthlyDeposit) || monthlyDeposit < 0) errors.monthlyDeposit = "月額積立額は0以上の数値を入力してください";
    if (data.bonusDeposit && (isNaN(bonusDeposit) || bonusDeposit < 0)) errors.bonusDeposit = "ボーナス積立額は0以上の数値を入力してください";

    if (Object.keys(errors).length > 0) {
      // エラーがあればreturn（実際のアプリではsetErrorを使用）
      console.error('Validation errors:', errors);
      return;
    }

    // CalculationParams形式に変換
    const calculationParams: CalculationParams = {
      initialAmount,
      annualRate,
      investmentPeriod,
      monthlyDeposit,
      bonusDeposit,
      bonusMonths,
      calculationType,
      compoundFrequency,
    };

    onCalculate(calculationParams);
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