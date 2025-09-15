# 投資リターン計算機 技術設計書

## 1. アーキテクチャ概要

### 1.1 システム構成
```
┌─────────────────────────────────────────────┐
│           Next.js App (Vercel)              │
├─────────────────────────────────────────────┤
│  Presentation Layer                         │
│  ├── Pages (App Router)                    │
│  ├── Components (React)                    │
│  └── Styles (Tailwind CSS)                 │
├─────────────────────────────────────────────┤
│  Application Layer                          │
│  ├── Hooks (Custom React Hooks)            │
│  ├── Services (Business Logic)             │
│  └── Utils (Helper Functions)              │
├─────────────────────────────────────────────┤
│  Data Layer                                │
│  ├── State Management (Zustand)            │
│  └── Local Storage (Browser API)           │
└─────────────────────────────────────────────┘
```

### 1.2 ディレクトリ構造
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # メインページ
│   ├── history/           # 履歴ページ
│   └── api/               # API Routes（将来用）
├── components/            # Reactコンポーネント
│   ├── calculator/        # 計算機関連
│   │   ├── CalculatorForm.tsx
│   │   ├── ResultDisplay.tsx
│   │   └── ParameterInput.tsx
│   ├── charts/            # グラフ関連
│   │   ├── AssetChart.tsx
│   │   ├── BreakdownChart.tsx
│   │   └── ComparisonChart.tsx
│   ├── layout/            # レイアウト関連
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ThemeToggle.tsx
│   └── ui/                # 共通UIコンポーネント
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Modal.tsx
├── hooks/                 # カスタムフック
│   ├── useCalculator.ts
│   ├── useSimulation.ts
│   └── useLocalStorage.ts
├── services/              # ビジネスロジック
│   ├── calculator.ts      # 計算ロジック
│   ├── storage.ts         # データ永続化
│   └── export.ts          # エクスポート機能
├── stores/                # 状態管理
│   └── simulationStore.ts
├── types/                 # TypeScript型定義
│   └── index.ts
├── utils/                 # ユーティリティ
│   ├── format.ts          # フォーマット関数
│   └── validation.ts      # バリデーション
└── locales/               # 多言語対応
    ├── ja/
    ├── en/
    └── zh-TW/
```

## 2. コンポーネント設計

### 2.1 主要コンポーネント

#### CalculatorForm
```typescript
interface CalculatorFormProps {
  onCalculate: (params: CalculationParams) => void;
  defaultValues?: CalculationParams;
}

// 機能:
// - 入力フォームの管理
// - バリデーション
// - リアルタイム計算
```

#### ResultDisplay
```typescript
interface ResultDisplayProps {
  result: CalculationResult;
  onSave?: () => void;
  onExport?: () => void;
}

// 機能:
// - 計算結果の表示
// - 保存・エクスポートボタン
```

#### AssetChart
```typescript
interface AssetChartProps {
  data: YearlyData[];
  options?: ChartOptions;
}

// 機能:
// - 資産推移グラフの描画
// - レスポンシブ対応
// - アニメーション
```

### 2.2 状態管理設計

#### Zustand Store
```typescript
interface SimulationStore {
  // State
  simulations: Simulation[];
  activeSimulation: Simulation | null;
  comparisonList: string[];

  // Actions
  addSimulation: (simulation: Simulation) => void;
  updateSimulation: (id: string, simulation: Partial<Simulation>) => void;
  deleteSimulation: (id: string) => void;
  setActiveSimulation: (id: string) => void;
  toggleComparison: (id: string) => void;

  // Computed
  getSimulationById: (id: string) => Simulation | undefined;
  getComparisonSimulations: () => Simulation[];
}
```

## 3. 計算ロジック実装

### 3.1 複利計算
```typescript
// 年複利計算
function calculateCompoundInterest(
  principal: number,
  rate: number,
  years: number,
  monthlyDeposit: number = 0,
  bonusDeposit: number = 0
): CalculationResult {
  let total = principal;
  const yearlyData: YearlyData[] = [];

  for (let year = 1; year <= years; year++) {
    // 月次積立の追加
    const monthlyTotal = monthlyDeposit * 12;
    const bonusTotal = bonusDeposit * 2; // 年2回

    total = total * (1 + rate / 100) + monthlyTotal + bonusTotal;

    yearlyData.push({
      year,
      principal: principal + (monthlyTotal + bonusTotal) * year,
      profit: total - (principal + (monthlyTotal + bonusTotal) * year),
      total
    });
  }

  return {
    finalAmount: total,
    totalPrincipal: principal + (monthlyDeposit * 12 + bonusDeposit * 2) * years,
    totalProfit: total - (principal + (monthlyDeposit * 12 + bonusDeposit * 2) * years),
    profitRate: ((total / (principal + (monthlyDeposit * 12 + bonusDeposit * 2) * years)) - 1) * 100,
    yearlyBreakdown: yearlyData
  };
}

// 月複利計算
function calculateMonthlyCompoundInterest(
  principal: number,
  annualRate: number,
  years: number,
  monthlyDeposit: number = 0
): CalculationResult {
  const monthlyRate = annualRate / 12 / 100;
  const months = years * 12;
  let total = principal;

  for (let month = 1; month <= months; month++) {
    total = (total + monthlyDeposit) * (1 + monthlyRate);
  }

  // 年次データへの変換処理
  // ...
}
```

### 3.2 単利計算
```typescript
function calculateSimpleInterest(
  principal: number,
  rate: number,
  years: number
): CalculationResult {
  const interest = principal * (rate / 100) * years;
  const total = principal + interest;

  return {
    finalAmount: total,
    totalPrincipal: principal,
    totalProfit: interest,
    profitRate: (interest / principal) * 100,
    yearlyBreakdown: generateYearlyData(principal, rate, years)
  };
}
```

## 4. データ永続化

### 4.1 LocalStorage構造
```typescript
// キー構造
const STORAGE_KEYS = {
  SIMULATIONS: 'investment_simulations',
  SETTINGS: 'app_settings',
  VERSION: 'storage_version'
};

// データ保存
class StorageService {
  static saveSimulation(simulation: Simulation): void {
    const stored = this.getSimulations();
    stored.push(simulation);
    localStorage.setItem(STORAGE_KEYS.SIMULATIONS, JSON.stringify(stored));
  }

  static getSimulations(): Simulation[] {
    const data = localStorage.getItem(STORAGE_KEYS.SIMULATIONS);
    return data ? JSON.parse(data) : [];
  }

  static exportToCSV(simulation: Simulation): string {
    // CSV生成ロジック
    const headers = ['Year', 'Principal', 'Profit', 'Total'];
    const rows = simulation.results.yearlyBreakdown.map(data =>
      [data.year, data.principal, data.profit, data.total].join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }
}
```

## 5. UI/UXデザイン

### 5.1 カラースキーム
```scss
// ライトモード
--primary: #2563eb;      // Blue-600
--secondary: #10b981;    // Emerald-500
--background: #ffffff;
--text: #1f2937;         // Gray-800
--border: #e5e7eb;       // Gray-200

// ダークモード
--primary-dark: #3b82f6;     // Blue-500
--secondary-dark: #34d399;   // Emerald-400
--background-dark: #111827;  // Gray-900
--text-dark: #f3f4f6;        // Gray-100
--border-dark: #374151;      // Gray-700
```

### 5.2 レスポンシブブレークポイント
```scss
// Tailwind CSS デフォルト
sm: 640px   // Mobile landscape
md: 768px   // Tablet
lg: 1024px  // Desktop
xl: 1280px  // Large desktop
2xl: 1536px // Extra large
```

## 6. パフォーマンス最適化

### 6.1 最適化戦略
- **コード分割**: Dynamic imports for chart libraries
- **メモ化**: React.memo, useMemo, useCallback
- **画像最適化**: Next.js Image component
- **バンドルサイズ**: Tree shaking, 不要な依存関係の削除

### 6.2 計測指標
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1
- **Bundle Size**: < 200KB (gzipped)

## 7. テスト戦略

### 7.1 テストの種類
- **単体テスト**: 計算ロジック、ユーティリティ関数
- **統合テスト**: コンポーネント間の連携
- **E2Eテスト**: ユーザーフロー全体

### 7.2 テストツール
- **Jest**: 単体テスト
- **React Testing Library**: コンポーネントテスト
- **Playwright**: E2Eテスト

## 8. セキュリティ考慮事項

### 8.1 データ保護
- LocalStorageのみ使用（サーバーへの送信なし）
- XSS対策: React のデフォルトエスケープ
- 入力値のサニタイゼーション

### 8.2 依存関係管理
- 定期的な npm audit
- Dependabotによる自動更新

## 9. デプロイ設定

### 9.1 Vercel設定
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### 9.2 環境変数
```env
# .env.local
NEXT_PUBLIC_APP_URL=https://investment-calculator.vercel.app
NEXT_PUBLIC_GA_ID=UA-XXXXXXXXX-X
```

## 10. 開発規約

### 10.1 コーディング規約
- ESLint + Prettier設定
- TypeScript strict mode
- コンポーネントはfunctional component
- カスタムフックでロジック分離

### 10.2 Git規約
- Conventional Commits
- feature/*, fix/*, chore/* ブランチ戦略
- PR必須、レビュー後マージ