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
app014-return-calc/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト（PWA対応）
│   ├── page.tsx           # メインページ
│   ├── history/           # 履歴ページ（将来用）
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
│   │   ├── ThemeProvider.tsx
│   │   └── PWAInstaller.tsx
│   └── ui/                # 共通UIコンポーネント
│       ├── Button.tsx
│       ├── Card.tsx
│       └── Input.tsx
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
├── public/                # 静的ファイル
│   ├── manifest.json      # PWA Manifest
│   ├── sw.js              # Service Worker
│   ├── icon.svg           # アプリアイコン
│   └── favicon.ico
├── server.js              # HTTPS開発サーバー
├── cert.pem              # 自己署名証明書
└── key.pem               # 秘密鍵
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
// - 入力フォームの管理（React Hook Form + Zod）
// - 日本語バリデーションメッセージ
// - ボーナス月選択UI（任意月・複数選択）
// - 自動保存・復元（LocalStorage）
// - SSR/CSR対応
```

#### ResultDisplay
```typescript
interface ResultDisplayProps {
  result: CalculationResult;
  onSave?: () => void;
  onExport?: () => void;
  onClearData?: () => void;
}

// 機能:
// - 計算結果の表示
// - 保存・エクスポート・データクリアボタン
// - 年次推移テーブル表示
```

#### AssetChart
```typescript
interface AssetChartProps {
  data: YearlyData[];
  options?: ChartOptions;
}

// 機能:
// - 資産推移グラフの描画（Recharts）
// - 複数チャートタイプ（Line/Area）対応
// - レスポンシブ対応
// - スムーズアニメーション
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
    const bonusTotal = bonusDeposit * bonusMonths.length; // 選択された月数

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
  years: number,
  monthlyDeposit: number = 0,
  bonusDeposit: number = 0,
  bonusMonths: number[] = []
): CalculationResult {
  const interest = principal * (rate / 100) * years;
  const totalDeposits = (monthlyDeposit * 12 + bonusDeposit * bonusMonths.length) * years;
  const total = principal + interest + totalDeposits;

  return {
    finalAmount: total,
    totalPrincipal: principal + totalDeposits,
    totalProfit: interest,
    profitRate: (interest / (principal + totalDeposits)) * 100,
    yearlyBreakdown: generateYearlyData(principal, rate, years, monthlyDeposit, bonusDeposit, bonusMonths)
  };
}
```

## 4. PWA対応

### 4.1 Web App Manifest
```json
{
  "name": "投資リターン計算機",
  "short_name": "投資計算機",
  "description": "複利・単利計算で資産形成をシミュレーション",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "any",
  "icons": [
    {
      "src": "/icon.svg",
      "sizes": "any",
      "type": "image/svg+xml",
      "purpose": "any maskable"
    }
  ]
}
```

### 4.2 Service Worker
```javascript
// キャッシュファーストの戦略
const CACHE_NAME = 'investment-calculator-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.svg',
  '/_next/static/css/',
  '/_next/static/js/'
];

// インストール時のキャッシュ設定
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// アクティベーション時の古いキャッシュ削除
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// フェッチイベントでキャッシュファーストの戦略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          console.log('Cache hit:', event.request.url);
          return response;
        }
        console.log('Cache miss, fetching:', event.request.url);
        return fetch(event.request);
      })
  );
});
```

### 4.3 HTTPS開発環境
```javascript
// server.js - 自己署名証明書によるHTTPS開発サーバー
const https = require('https');
const fs = require('fs');
const { spawn } = require('child_process');

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

// Next.js devサーバーをHTTPSでプロキシ
```

## 5. データ永続化

### 5.1 LocalStorage構造
```typescript
// キー構造
const STORAGE_KEYS = {
  SIMULATIONS: 'investment_simulations',
  SETTINGS: 'app_settings',
  VERSION: 'storage_version',
  FORM_DATA: 'form_data',
  LAST_RESULT: 'last_result'
};

// データ保存
class StorageService {
  // シミュレーション管理
  static saveSimulation(simulation: Simulation): void {
    const stored = this.getSimulations();
    stored.push(simulation);
    localStorage.setItem(STORAGE_KEYS.SIMULATIONS, JSON.stringify(stored));
  }

  static getSimulations(): Simulation[] {
    const data = localStorage.getItem(STORAGE_KEYS.SIMULATIONS);
    return data ? JSON.parse(data) : [];
  }

  // オフライン対応：フォームデータの永続化
  static saveFormData(formData: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.FORM_DATA, JSON.stringify(formData));
  }

  static getFormData(): any {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.FORM_DATA);
    return data ? JSON.parse(data) : null;
  }

  // オフライン対応：計算結果の永続化
  static saveLastResult(result: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.LAST_RESULT, JSON.stringify(result));
  }

  static getLastResult(): any {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.LAST_RESULT);
    return data ? JSON.parse(data) : null;
  }

  // データクリア機能
  static clearOfflineData(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
    localStorage.removeItem(STORAGE_KEYS.LAST_RESULT);
  }

  static clearAllData(): void {
    if (typeof window === 'undefined') return;
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // CSV エクスポート
  static exportToCSV(simulation: Simulation): string {
    const headers = ['年', '元本', '利益', '合計'];
    const rows = simulation.results.yearlyBreakdown.map(data =>
      [data.year, data.principal.toLocaleString(), data.profit.toLocaleString(), data.total.toLocaleString()].join(',')
    );
    return '\uFEFF' + [headers.join(','), ...rows].join('\n'); // BOM追加で文字化け防止
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