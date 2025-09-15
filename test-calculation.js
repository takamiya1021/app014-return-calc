// 簡単な計算テスト
const { calculate } = require('./services/calculator.ts');

// テストケース1: 基本的な複利計算
const testParams = {
  initialAmount: 1000000,
  annualRate: 5,
  investmentPeriod: 10,
  monthlyDeposit: 50000,
  bonusDeposit: 0,
  compoundFrequency: 'yearly',
  calculationType: 'compound'
};

console.log('🧪 計算ロジックテスト開始');
console.log('テストパラメータ:', testParams);

try {
  const result = calculate(testParams);
  console.log('✅ 計算結果:', {
    finalAmount: result.finalAmount.toLocaleString(),
    totalPrincipal: result.totalPrincipal.toLocaleString(),
    totalProfit: result.totalProfit.toLocaleString(),
    profitRate: result.profitRate.toFixed(2) + '%'
  });

  // 期待値チェック
  const expectedPrincipal = 1000000 + (50000 * 12 * 10); // 初期 + 積立
  console.log('元本チェック:', result.totalPrincipal === expectedPrincipal ? '✅' : '❌');

} catch (error) {
  console.error('❌ 計算エラー:', error.message);
}