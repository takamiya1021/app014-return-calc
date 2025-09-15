// 計算種別
export type CalculationType = 'simple' | 'compound';

// 複利計算頻度
export type CompoundFrequency = 'yearly' | 'monthly';

// 計算パラメータ
export interface CalculationParams {
  initialAmount: number;        // 初期投資額
  annualRate: number;          // 年利率（％）
  investmentPeriod: number;    // 投資期間（年）
  monthlyDeposit: number;      // 月額積立額
  bonusDeposit?: number;       // ボーナス積立額
  bonusMonths?: number[];      // ボーナス支給月（1-12の配列）
  compoundFrequency: CompoundFrequency; // 複利計算頻度
  calculationType: CalculationType;     // 計算種別
}

// 年次データ
export interface YearlyData {
  year: number;
  principal: number;  // 元本
  profit: number;     // 利益
  total: number;      // 合計
}

// 計算結果
export interface CalculationResult {
  finalAmount: number;         // 最終資産額
  totalPrincipal: number;      // 元本総額
  totalProfit: number;         // 利益総額
  profitRate: number;          // 利益率（％）
  yearlyBreakdown: YearlyData[]; // 年次推移データ
}

// シミュレーションデータ
export interface Simulation {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  parameters: CalculationParams;
  results: CalculationResult;
}

// グラフオプション
export interface ChartOptions {
  height?: number;
  width?: number;
  responsive?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  animationDuration?: number;
}

// ストレージバージョン（データマイグレーション用）
export interface StorageData {
  version: number;
  simulations: Simulation[];
  settings?: AppSettings;
}

// アプリ設定
export interface AppSettings {
  theme: 'light' | 'dark';
  locale: 'ja' | 'en' | 'zh-TW';
  currency: 'JPY' | 'USD' | 'TWD';
}

// フォーム入力エラー
export interface FormErrors {
  initialAmount?: string;
  annualRate?: string;
  investmentPeriod?: string;
  monthlyDeposit?: string;
  bonusDeposit?: string;
  bonusMonths?: string;
}