import { Simulation } from '@/types';

export class StorageService {
  private static readonly STORAGE_KEY = 'investment_simulations';
  private static readonly SETTINGS_KEY = 'investment_settings';

  /**
   * CSVエクスポート
   */
  static exportToCSV(simulation: Simulation): void {
    const headers = ['年', '元本', '利益', '合計'];
    const rows = simulation.results.yearlyBreakdown.map(data =>
      [data.year, data.principal, data.profit, data.total].join(',')
    );

    const csvContent = [
      `投資シミュレーション: ${simulation.name}`,
      `作成日: ${new Date(simulation.createdAt).toLocaleDateString('ja-JP')}`,
      '',
      '設定値:',
      `初期投資額: ${simulation.parameters.initialAmount}円`,
      `年利率: ${simulation.parameters.annualRate}%`,
      `投資期間: ${simulation.parameters.investmentPeriod}年`,
      `月額積立: ${simulation.parameters.monthlyDeposit}円`,
      `ボーナス積立: ${simulation.parameters.bonusDeposit || 0}円`,
      `計算方法: ${simulation.parameters.calculationType === 'compound' ? '複利' : '単利'}`,
      `複利頻度: ${simulation.parameters.compoundFrequency === 'yearly' ? '年複利' : '月複利'}`,
      '',
      '結果:',
      `最終資産額: ${simulation.results.finalAmount}円`,
      `元本総額: ${simulation.results.totalPrincipal}円`,
      `利益総額: ${simulation.results.totalProfit}円`,
      `利益率: ${simulation.results.profitRate.toFixed(2)}%`,
      '',
      headers.join(','),
      ...rows
    ].join('\n');

    // BOMを追加して文字化けを防ぐ
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `investment_simulation_${simulation.id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 複数シミュレーションの比較CSV出力
   */
  static exportComparisonToCSV(simulations: Simulation[]): void {
    if (simulations.length === 0) return;

    const maxYears = Math.max(...simulations.map(s => s.results.yearlyBreakdown.length));
    const headers = ['年', ...simulations.flatMap(s => [`${s.name}_元本`, `${s.name}_利益`, `${s.name}_合計`])];

    const rows: string[] = [];
    for (let year = 1; year <= maxYears; year++) {
      const row = [year.toString()];
      for (const sim of simulations) {
        const yearData = sim.results.yearlyBreakdown.find(d => d.year === year);
        if (yearData) {
          row.push(yearData.principal.toString());
          row.push(yearData.profit.toString());
          row.push(yearData.total.toString());
        } else {
          row.push('', '', '');
        }
      }
      rows.push(row.join(','));
    }

    const csvContent = [
      '投資シミュレーション比較',
      `作成日: ${new Date().toLocaleDateString('ja-JP')}`,
      '',
      headers.join(','),
      ...rows
    ].join('\n');

    // BOMを追加
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `investment_comparison_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * アプリ設定の保存
   */
  static saveSettings(settings: any): void {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }

  /**
   * アプリ設定の取得
   */
  static getSettings(): any {
    const settings = localStorage.getItem(this.SETTINGS_KEY);
    return settings ? JSON.parse(settings) : null;
  }
}