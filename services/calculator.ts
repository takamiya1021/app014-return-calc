import {
  CalculationParams,
  CalculationResult,
  YearlyData,
} from '@/types';

/**
 * 複利計算（年複利）
 */
export function calculateCompoundInterest(params: CalculationParams): CalculationResult {
  const {
    initialAmount,
    annualRate,
    investmentPeriod,
    monthlyDeposit,
    bonusDeposit = 0,
    bonusMonths = [6, 12],
    compoundFrequency,
  } = params;

  if (compoundFrequency === 'monthly') {
    return calculateMonthlyCompoundInterest(params);
  }

  const yearlyData: YearlyData[] = [];
  let currentAmount = initialAmount;
  let totalPrincipal = initialAmount;

  for (let year = 1; year <= investmentPeriod; year++) {
    // 年間の積立額を計算
    const yearlyDeposit = monthlyDeposit * 12;
    const yearlyBonus = bonusDeposit * bonusMonths.length; // 選択した月数分
    const yearlyAddition = yearlyDeposit + yearlyBonus;

    // 複利計算（積立分は年度末に追加）
    currentAmount = currentAmount * (1 + annualRate / 100) + yearlyAddition;
    totalPrincipal += yearlyAddition;

    const profit = currentAmount - totalPrincipal;

    yearlyData.push({
      year,
      principal: totalPrincipal,
      profit: profit,
      total: currentAmount,
    });
  }

  const finalAmount = currentAmount;
  const totalProfit = finalAmount - totalPrincipal;
  const profitRate = totalPrincipal > 0 ? (totalProfit / totalPrincipal) * 100 : 0;

  return {
    finalAmount,
    totalPrincipal,
    totalProfit,
    profitRate,
    yearlyBreakdown: yearlyData,
  };
}

/**
 * 複利計算（月複利）
 */
function calculateMonthlyCompoundInterest(params: CalculationParams): CalculationResult {
  const {
    initialAmount,
    annualRate,
    investmentPeriod,
    monthlyDeposit,
    bonusDeposit = 0,
    bonusMonths = [6, 12],
  } = params;

  const monthlyRate = annualRate / 12 / 100;
  const totalMonths = investmentPeriod * 12;
  const yearlyData: YearlyData[] = [];

  let currentAmount = initialAmount;
  let totalPrincipal = initialAmount;

  for (let month = 1; month <= totalMonths; month++) {
    // 月次積立を追加
    currentAmount += monthlyDeposit;
    totalPrincipal += monthlyDeposit;

    // ボーナス月の処理
    const currentMonthInYear = ((month - 1) % 12) + 1;
    if (bonusMonths.includes(currentMonthInYear)) {
      currentAmount += bonusDeposit;
      totalPrincipal += bonusDeposit;
    }

    // 月複利計算
    currentAmount = currentAmount * (1 + monthlyRate);

    // 年度末のデータを記録
    if (month % 12 === 0) {
      const year = month / 12;
      const profit = currentAmount - totalPrincipal;

      yearlyData.push({
        year,
        principal: totalPrincipal,
        profit: profit,
        total: currentAmount,
      });
    }
  }

  const finalAmount = currentAmount;
  const totalProfit = finalAmount - totalPrincipal;
  const profitRate = totalPrincipal > 0 ? (totalProfit / totalPrincipal) * 100 : 0;

  return {
    finalAmount,
    totalPrincipal,
    totalProfit,
    profitRate,
    yearlyBreakdown: yearlyData,
  };
}

/**
 * 単利計算
 */
export function calculateSimpleInterest(params: CalculationParams): CalculationResult {
  const {
    initialAmount,
    annualRate,
    investmentPeriod,
    monthlyDeposit,
    bonusDeposit = 0,
    bonusMonths = [6, 12],
  } = params;

  const yearlyData: YearlyData[] = [];
  let totalPrincipal = initialAmount;

  // 年間の積立額
  const yearlyDeposit = monthlyDeposit * 12;
  const yearlyBonus = bonusDeposit * bonusMonths.length;
  const yearlyAddition = yearlyDeposit + yearlyBonus;

  for (let year = 1; year <= investmentPeriod; year++) {
    // 元本を更新
    totalPrincipal += yearlyAddition;

    // 単利の利益計算（初期投資額に対してのみ）
    const simpleInterest = initialAmount * (annualRate / 100) * year;

    // 積立分の利益（それぞれの積立年数に応じた単利）
    let depositInterest = 0;
    for (let i = 1; i < year; i++) {
      depositInterest += yearlyAddition * (annualRate / 100) * (year - i);
    }

    const totalProfit = simpleInterest + depositInterest;
    const total = totalPrincipal + totalProfit;

    yearlyData.push({
      year,
      principal: totalPrincipal,
      profit: totalProfit,
      total: total,
    });
  }

  const lastYear = yearlyData[yearlyData.length - 1];
  const finalAmount = lastYear.total;
  const totalProfit = lastYear.profit;
  const profitRate = totalPrincipal > 0 ? (totalProfit / totalPrincipal) * 100 : 0;

  return {
    finalAmount,
    totalPrincipal,
    totalProfit,
    profitRate,
    yearlyBreakdown: yearlyData,
  };
}

/**
 * メイン計算関数
 */
export function calculate(params: CalculationParams): CalculationResult {
  if (params.calculationType === 'simple') {
    return calculateSimpleInterest(params);
  } else {
    return calculateCompoundInterest(params);
  }
}

/**
 * 数値フォーマット
 */
export function formatCurrency(value: number, locale: string = 'ja-JP', currency: string = 'JPY'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * パーセンテージフォーマット
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 数値の妥当性チェック
 */
export function validateNumber(value: number, min: number, max: number): boolean {
  return !isNaN(value) && value >= min && value <= max;
}