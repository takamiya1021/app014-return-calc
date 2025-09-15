'use client';

import React, { useState } from 'react';
import { CalculatorForm } from '@/components/calculator/CalculatorForm';
import { ResultDisplay } from '@/components/calculator/ResultDisplay';
import { AssetChart } from '@/components/charts/AssetChart';
import { Header } from '@/components/layout/Header';
import { ThemeProvider, useTheme } from '@/components/layout/ThemeProvider';
import { calculate } from '@/services/calculator';
import { StorageService } from '@/services/storage';
import { useSimulationStore } from '@/stores/simulationStore';
import { CalculationParams, CalculationResult, Simulation } from '@/types';
import { v4 as uuidv4 } from 'uuid';

function HomePage() {
  const [calculationResult, setCalculationResult] = useState<CalculationResult | null>(null);
  const [currentParams, setCurrentParams] = useState<CalculationParams | null>(null);
  const { addSimulation } = useSimulationStore();
  const { isDarkMode, toggleTheme } = useTheme();

  const handleCalculate = (params: CalculationParams) => {
    const result = calculate(params);
    setCalculationResult(result);
    setCurrentParams(params);
  };

  const handleSave = () => {
    if (!calculationResult || !currentParams) return;

    const simulation: Simulation = {
      id: uuidv4(),
      name: `シミュレーション ${new Date().toLocaleDateString('ja-JP')}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      parameters: currentParams,
      results: calculationResult,
    };

    addSimulation(simulation);
    alert('シミュレーションを保存しました');
  };

  const handleExport = () => {
    if (!calculationResult || !currentParams) return;

    const simulation: Simulation = {
      id: 'temp',
      name: '計算結果',
      createdAt: new Date(),
      updatedAt: new Date(),
      parameters: currentParams,
      results: calculationResult,
    };

    StorageService.exportToCSV(simulation);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header onThemeToggle={toggleTheme} isDarkMode={isDarkMode} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* 計算フォーム */}
          <CalculatorForm onCalculate={handleCalculate} />

          {/* 計算結果表示 */}
          {calculationResult && (
            <>
              <ResultDisplay
                result={calculationResult}
                onSave={handleSave}
                onExport={handleExport}
              />

              {/* グラフ表示 */}
              <AssetChart data={calculationResult.yearlyBreakdown} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <HomePage />
    </ThemeProvider>
  );
}
