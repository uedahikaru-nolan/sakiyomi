# テスト計画書

## 1. テスト概要

### 1.1 テストの目的

SAKIYOMIコミュニティプラットフォームの品質を保証し、以下を確認する:

1. **機能要件の充足**: すべての機能が仕様通りに動作する
2. **非機能要件の充足**: パフォーマンス、セキュリティ、可用性の基準を満たす
3. **ユーザビリティ**: 使いやすく、直感的に操作できる
4. **互換性**: 様々な環境・デバイスで正常に動作する

### 1.2 テスト方針

- **段階的テスト**: 単体 → 結合 → システム → 受け入れ
- **自動化優先**: 回帰テストは自動化
- **継続的テスト**: CI/CDパイプラインに組み込み
- **リスクベース**: 重要度・影響度の高い機能を優先

### 1.3 テスト範囲

| テストタイプ | 対象 | 実施タイミング |
|------------|------|--------------|
| 単体テスト | 関数、コンポーネント | 開発時（継続的） |
| 結合テスト | API、モジュール間連携 | スプリント終了時 |
| システムテスト | 全体機能 | Phase終了時 |
| 性能テスト | レスポンスタイム、負荷 | リリース前 |
| セキュリティテスト | 脆弱性 | リリース前 |
| ユーザビリティテスト | UI/UX | β版テスト時 |
| 受け入れテスト | ビジネス要件 | リリース前 |

---

## 2. テスト環境

### 2.1 テスト環境構成

| 環境 | 用途 | URL | データ |
|-----|------|-----|-------|
| ローカル | 開発者の単体テスト | localhost:3000 | ダミーデータ |
| 開発 | 開発チーム統合テスト | dev.sakiyomi.com | 開発用データ |
| ステージング | QA・受け入れテスト | staging.sakiyomi.com | 本番同等データ（匿名化） |
| 本番 | - | app.sakiyomi.com | 本番データ |

### 2.2 テストデータ

#### 2.2.1 テストアカウント

| アカウント種別 | メール | パスワード | 用途 |
|--------------|-------|----------|------|
| 一般会員（無料） | test-free@example.com | Test1234 | 無料プラン機能テスト |
| 一般会員（ベーシック） | test-basic@example.com | Test1234 | ベーシックプラン機能テスト |
| 一般会員（プレミアム） | test-premium@example.com | Test1234 | プレミアムプラン機能テスト |
| 管理者 | admin-test@example.com | Admin1234 | 管理画面テスト |

#### 2.2.2 テストデータ投入

- **シードデータ**: Prisma Seed機能で自動投入
- **動画データ**: ダミー動画（Vimeo テストアカウント）
- **Instagram連携**: テスト用Instagramアカウント

---

## 3. 単体テスト（Unit Test）

### 3.1 テスト対象

- ユーティリティ関数
- バリデーション関数
- ビジネスロジック
- Reactコンポーネント

### 3.2 テストフレームワーク

| 言語 | フレームワーク | ランナー | アサーション |
|-----|-------------|---------|------------|
| TypeScript/JavaScript | Jest | Jest | Jest |
| React | React Testing Library | Jest | Jest |

### 3.3 カバレッジ目標

- **全体カバレッジ**: 80%以上
- **重要ロジック**: 100%
- **UIコンポーネント**: 70%以上

### 3.4 テスト例

#### 3.4.1 ユーティリティ関数テスト

```typescript
// tests/utils/validation.test.ts
import { validateEmail, validatePassword } from '@/utils/validation';

describe('validateEmail', () => {
  it('有効なメールアドレスの場合trueを返す', () => {
    expect(validateEmail('user@example.com')).toBe(true);
  });

  it('無効なメールアドレスの場合falseを返す', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('8文字以上の場合trueを返す', () => {
    expect(validatePassword('Password123')).toBe(true);
  });

  it('8文字未満の場合falseを返す', () => {
    expect(validatePassword('Pass1')).toBe(false);
  });
});
```

#### 3.4.2 Reactコンポーネントテスト

```typescript
// tests/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('ラベルが正しく表示される', () => {
    render(<Button>クリック</Button>);
    expect(screen.getByText('クリック')).toBeInTheDocument();
  });

  it('クリックイベントが発火する', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>クリック</Button>);
    fireEvent.click(screen.getByText('クリック'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled状態の場合クリックできない', () => {
    const handleClick = jest.fn();
    render(<Button disabled onClick={handleClick}>クリック</Button>);
    fireEvent.click(screen.getByText('クリック'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});
```

---

## 4. 結合テスト（Integration Test）

### 4.1 テスト対象

- APIエンドポイント
- データベース連携
- 外部API連携（Stripe, Instagram等）
- 認証・認可フロー

### 4.2 テスト手法

- **APIテスト**: Supertest
- **E2Eテスト**: Playwright

### 4.3 テスト例

#### 4.3.1 APIテスト

```typescript
// tests/api/auth.test.ts
import request from 'supertest';
import app from '@/app';

describe('POST /api/v1/auth/register', () => {
  it('有効なデータで登録成功', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'newuser@example.com',
        password: 'Password123',
        name: '山田太郎'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe('newuser@example.com');
  });

  it('重複メールアドレスで登録失敗', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'existing@example.com',
        password: 'Password123',
        name: '山田太郎'
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});

describe('POST /api/v1/auth/login', () => {
  it('正しい認証情報でログイン成功', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123'
      });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.user).toBeDefined();
  });
});
```

---

## 5. E2Eテスト（End-to-End Test）

### 5.1 テスト対象

- ユーザーフロー
  - 会員登録 → ログイン → 動画視聴 → ログアウト
  - Instagram連携 → データ表示
  - 投稿作成 → コメント → いいね

### 5.2 テストツール

- **Playwright**: クロスブラウザE2Eテスト

### 5.3 テスト例

```typescript
// tests/e2e/user-registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('会員登録フロー', () => {
  test('新規会員登録が正常に完了する', async ({ page }) => {
    // 登録ページに移動
    await page.goto('/register');

    // フォーム入力
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.fill('input[name="name"]', '山田太郎');

    // 利用規約に同意
    await page.check('input[name="agree"]');

    // 登録ボタンクリック
    await page.click('button[type="submit"]');

    // 成功メッセージ確認
    await expect(page.locator('text=認証メールを送信しました')).toBeVisible();
  });
});

test.describe('動画視聴フロー', () => {
  test('動画を視聴して進捗が記録される', async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');

    // 動画一覧ページに移動
    await page.goto('/courses');

    // 動画をクリック
    await page.click('text=初めてのInstagram');

    // 動画プレーヤーが表示される
    await expect(page.locator('iframe')).toBeVisible();

    // 「完了にする」ボタンクリック
    await page.click('text=完了にする');

    // 進捗が更新される
    await expect(page.locator('text=視聴完了')).toBeVisible();
  });
});
```

---

## 6. 性能テスト（Performance Test）

### 6.1 テスト項目

| 項目 | 目標値 | 測定方法 |
|-----|--------|---------|
| ページ読み込み時間 | 2秒以内（初回） | Lighthouse |
| API応答時間 | 500ms以内（90パーセンタイル） | k6 |
| 動画再生開始時間 | 3秒以内 | 手動測定 |
| 同時接続ユーザー数 | 1,000人以上 | k6 |

### 6.2 テストツール

- **Lighthouse**: フロントエンドパフォーマンス
- **k6**: 負荷テスト
- **WebPageTest**: 詳細パフォーマンス分析

### 6.3 負荷テストシナリオ

```javascript
// tests/performance/load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // 2分で100ユーザーまで増加
    { duration: '5m', target: 100 }, // 5分間100ユーザー維持
    { duration: '2m', target: 500 }, // 2分で500ユーザーまで増加
    { duration: '5m', target: 500 }, // 5分間500ユーザー維持
    { duration: '2m', target: 0 },   // 2分で0ユーザーまで減少
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95%のリクエストが500ms以内
    http_req_failed: ['rate<0.01'],   // エラー率1%未満
  },
};

export default function () {
  // ログインAPI
  const loginRes = http.post('https://api.sakiyomi.com/v1/auth/login', {
    email: 'test@example.com',
    password: 'Password123',
  });

  check(loginRes, {
    'ログイン成功': (r) => r.status === 200,
  });

  const accessToken = loginRes.json('data.accessToken');

  // 動画一覧取得API
  const coursesRes = http.get('https://api.sakiyomi.com/v1/courses', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  check(coursesRes, {
    '動画一覧取得成功': (r) => r.status === 200,
  });

  sleep(1);
}
```

---

## 7. セキュリティテスト

### 7.1 テスト項目

- **OWASP Top 10チェック**
  - SQLインジェクション
  - XSS（クロスサイトスクリプティング）
  - CSRF（クロスサイトリクエストフォージェリ）
  - 認証・認可の不備
  - 機密データの露出
- **脆弱性スキャン**
  - 依存関係の脆弱性（npm audit, Snyk）
  - Webアプリケーション診断
- **ペネトレーションテスト**
  - 外部専門業者に委託

### 7.2 テストツール

- **OWASP ZAP**: 自動脆弱性スキャン
- **Burp Suite**: ペネトレーションテスト
- **npm audit / Snyk**: 依存関係の脆弱性チェック

### 7.3 実施スケジュール

- **自動スキャン**: Pull Request毎（CI/CD）
- **手動診断**: リリース前
- **ペネトレーションテスト**: 年1回、大規模アップデート前

---

## 8. ユーザビリティテスト

### 8.1 テスト目的

- UIが直感的で使いやすいか
- ユーザーが迷わず目的を達成できるか
- エラーメッセージがわかりやすいか

### 8.2 テスト手法

- **モデレート型ユーザビリティテスト**: 5-8名のユーザーに実施
- **タスクベース**: 具体的なタスクを与えて観察
- **シンクアラウド法**: 思ったことを声に出してもらう

### 8.3 テストタスク例

1. **会員登録タスク**
   - 「新規会員登録をしてください」
   - 成功基準: 5分以内に登録完了

2. **動画視聴タスク**
   - 「Instagramの基礎を学ぶ動画を見つけて視聴してください」
   - 成功基準: 3分以内に動画再生開始

3. **日報投稿タスク**
   - 「今日の活動を日報として投稿してください」
   - 成功基準: 5分以内に投稿完了

### 8.4 評価指標

- **タスク完了率**: 80%以上
- **タスク完了時間**: 目標時間内
- **エラー率**: 20%以下
- **満足度（SUS）**: 70点以上

---

## 9. 受け入れテスト

### 9.1 テスト実施者

- プロダクトオーナー
- ステークホルダー
- β版ユーザー（既存会員）

### 9.2 テスト項目

機能要件定義書の各機能が仕様通りに動作することを確認

### 9.3 受け入れ基準

- **致命的バグ**: 0件
- **重大バグ**: 0件
- **中程度バグ**: 5件以下（修正計画あり）
- **軽微バグ**: 20件以下

---

## 10. 回帰テスト

### 10.1 対象

- 既存機能の正常動作確認
- バグフィックス後の再発防止確認

### 10.2 実施タイミング

- Pull Request マージ時（自動）
- リリース前（手動 + 自動）

### 10.3 自動化

- 単体テスト: 100%自動化
- E2Eテスト: 主要フロー自動化
- 手動テスト: UIの細かい表示崩れ等

---

## 11. モバイルテスト

### 11.1 対象デバイス・OS

| デバイス | OS | ブラウザ |
|---------|---|---------|
| iPhone 14 Pro | iOS 17 | Safari |
| iPhone SE | iOS 16 | Safari |
| Google Pixel 7 | Android 13 | Chrome |
| iPad Pro | iPadOS 17 | Safari |
| Galaxy Tab | Android 12 | Chrome |

### 11.2 テスト項目

- レスポンシブデザイン
- タッチ操作
- 画面回転
- ブラウザ互換性

---

## 12. ブラウザ互換性テスト

### 12.1 対象ブラウザ

| ブラウザ | バージョン | サポート優先度 |
|---------|----------|--------------|
| Chrome | 最新2バージョン | High |
| Safari | 最新2バージョン | High |
| Firefox | 最新2バージョン | Medium |
| Edge | 最新2バージョン | Medium |

### 12.2 テストツール

- **BrowserStack**: クロスブラウザテスト
- **Playwright**: 自動E2Eテスト（複数ブラウザ）

---

## 13. テスト自動化

### 13.1 CI/CDパイプライン組み込み

```yaml
# .github/workflows/test.yml
name: Test

on:
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      # 依存関係インストール
      - run: npm ci

      # Lint
      - run: npm run lint

      # 型チェック
      - run: npm run type-check

      # 単体テスト
      - run: npm run test:unit

      # カバレッジチェック
      - run: npm run test:coverage

      # E2Eテスト
      - run: npm run test:e2e

      # ビルド
      - run: npm run build

      # セキュリティ監査
      - run: npm audit --production
```

---

## 14. バグ管理

### 14.1 バグ優先度

| 優先度 | 定義 | 対応期限 |
|-------|------|---------|
| P0（Critical） | サービス停止、データ損失 | 即時 |
| P1（High） | 主要機能が使えない | 24時間以内 |
| P2（Medium） | 一部機能に支障 | 1週間以内 |
| P3（Low） | 軽微な不具合 | 次回リリース |

### 14.2 バグトラッキング

- **ツール**: GitHub Issues / Jira
- **ラベル**: bug, priority:p0, component:auth等

---

## 15. テスト成果物

### 15.1 テストケース

- **保存場所**: `tests/test-cases/`
- **形式**: Markdown / Excel

### 15.2 テスト結果レポート

- **自動テスト**: CI/CDログ、カバレッジレポート
- **手動テスト**: Googleスプレッドシート、Notion

### 15.3 バグレポート

- **テンプレート**:
```markdown
## バグ概要
[バグの簡潔な説明]

## 再現手順
1. [ステップ1]
2. [ステップ2]
3. [ステップ3]

## 期待される動作
[本来はどうあるべきか]

## 実際の動作
[実際に何が起こったか]

## 環境
- OS:
- ブラウザ:
- バージョン:

## スクリーンショット
[画像添付]

## 優先度
[P0/P1/P2/P3]
```

---

## 16. テストスケジュール

### 16.1 Phase 1（基盤構築）

| 週 | テスト種別 | 担当 |
|---|----------|------|
| 1-4週 | 単体テスト（継続的） | 各開発者 |
| 4週 | 結合テスト | QA |
| 8週 | システムテスト | QA + 全チーム |
| 8週 | β版ユーザビリティテスト | 既存会員 |

### 16.2 リリース前（Phase 2末）

| テスト種別 | 期間 | 担当 |
|----------|------|------|
| 全機能統合テスト | 3日間 | QA |
| 性能テスト | 2日間 | BE |
| セキュリティテスト | 3日間 | 外部業者 |
| 受け入れテスト | 2日間 | PO + ステークホルダー |

---

## 17. テスト完了基準

### 17.1 リリース可否判定基準

以下をすべて満たす場合のみリリース可:

- [ ] 全単体テストがパス（カバレッジ80%以上）
- [ ] 全E2Eテストがパス
- [ ] P0, P1バグが0件
- [ ] P2バグが5件以下（修正計画あり）
- [ ] 性能テストで目標値達成
- [ ] セキュリティテストで重大な脆弱性なし
- [ ] 受け入れテスト合格
- [ ] ステークホルダー承認

---

**文書管理情報**
- バージョン: 1.0
- 作成日: 2025-12-02
- 最終更新日: 2025-12-02
- 承認状態: ドラフト
