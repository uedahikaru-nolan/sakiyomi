# SAKIYOMIコミュニティプラットフォーム - ドキュメント

## プロジェクト概要

SAKIYOMIコミュニティプラットフォームは、Instagram成長支援を目的とした会員制オンラインコミュニティプラットフォームです。会員管理、学習コンテンツ配信、Instagram連携、コミュニティ交流、ゲーミフィケーションを統合した独自プラットフォームです。

---

## ドキュメント一覧

### 1. プロジェクト管理

- **[01_project_overview.md](./01_project_overview.md)** - プロジェクト概要・目的
  - プロジェクトの目的とゴール
  - ステークホルダー
  - プロジェクトスコープ
  - 成功基準とKPI

- **[04_development_schedule.md](./04_development_schedule.md)** - 開発スケジュール詳細
  - フェーズ別スケジュール
  - スプリント計画
  - マイルストーン
  - リスク管理

---

### 2. 要件定義

- **[02_functional_requirements.md](./02_functional_requirements.md)** - 機能要件定義書
  - Level 1-5の機能詳細
  - 会員管理システム
  - 学習管理システム（LMS）
  - Instagram連携機能
  - コミュニティ機能
  - ゲーミフィケーション

---

### 3. 技術仕様

- **[03_technical_specifications.md](./03_technical_specifications.md)** - 技術仕様書
  - システムアーキテクチャ
  - 技術スタック選定
  - セキュリティ設計
  - パフォーマンス最適化
  - 監視・ログ管理

- **[06_database_design.md](./06_database_design.md)** - データベース設計書
  - ER図
  - テーブル定義詳細
  - インデックス戦略
  - バックアップ・リストア

- **[07_api_specifications.md](./07_api_specifications.md)** - API仕様書
  - エンドポイント一覧
  - リクエスト/レスポンス形式
  - 認証・認可
  - エラーハンドリング
  - レート制限

---

### 4. デザイン

- **[05_design_requirements.md](./05_design_requirements.md)** - デザイン要件定義書
  - デザインコンセプト
  - デザインシステム（カラー、タイポグラフィ、スペーシング）
  - コンポーネント設計
  - レスポンシブデザイン
  - アクセシビリティ要件

---

### 5. セキュリティ・品質保証

- **[08_security_requirements.md](./08_security_requirements.md)** - セキュリティ要件定義書
  - セキュリティ方針
  - 認証・認可セキュリティ
  - データセキュリティ
  - OWASP Top 10対策
  - インシデント対応

- **[09_test_plan.md](./09_test_plan.md)** - テスト計画書
  - テスト戦略
  - 単体テスト・結合テスト
  - E2Eテスト
  - 性能テスト
  - セキュリティテスト
  - テスト自動化

---

## クイックスタート

### 前提条件

- Node.js 20+
- PostgreSQL 15+
- Redis
- Docker & Docker Compose（推奨）

### セットアップ手順

```bash
# 1. リポジトリクローン
git clone https://github.com/your-org/sakiyomi-platform.git
cd sakiyomi-platform

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp .env.example .env.local
# .env.localを編集

# 4. Dockerコンテナ起動（PostgreSQL, Redis）
docker-compose up -d

# 5. データベースマイグレーション
npx prisma migrate dev

# 6. シードデータ投入
npx prisma db seed

# 7. 開発サーバー起動
npm run dev
```

ブラウザで http://localhost:3000 にアクセス

---

## プロジェクト構造

```
sakiyomi-platform/
├── docs/                      # ドキュメント
│   ├── 01_project_overview.md
│   ├── 02_functional_requirements.md
│   ├── 03_technical_specifications.md
│   ├── 04_development_schedule.md
│   ├── 05_design_requirements.md
│   ├── 06_database_design.md
│   ├── 07_api_specifications.md
│   ├── 08_security_requirements.md
│   └── 09_test_plan.md
├── src/                       # ソースコード
│   ├── app/                   # Next.js App Router
│   ├── components/            # Reactコンポーネント
│   ├── lib/                   # ユーティリティ、設定
│   ├── hooks/                 # カスタムフック
│   ├── types/                 # TypeScript型定義
│   └── styles/                # スタイル
├── prisma/                    # Prismaスキーマ
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── tests/                     # テスト
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/                    # 静的ファイル
├── .github/                   # GitHub Actions
│   └── workflows/
├── docker-compose.yml
├── package.json
├── tsconfig.json
└── README.md
```

---

## 開発ガイドライン

### コーディング規約

- **スタイルガイド**: Airbnb JavaScript Style Guide準拠
- **Linter**: ESLint
- **Formatter**: Prettier
- **命名規則**:
  - ファイル: `kebab-case`
  - コンポーネント: `PascalCase`
  - 関数・変数: `camelCase`
  - 定数: `UPPER_SNAKE_CASE`

### Gitフロー

```
main ─────────────────────> (本番環境)
  └─ develop ──────────────> (開発環境)
       └─ feature/xxx ─────> (機能開発)
       └─ bugfix/xxx ──────> (バグ修正)
```

**ブランチ命名規則**:
- `feature/user-authentication`
- `bugfix/login-error`
- `hotfix/security-patch`

**コミットメッセージ**:
```
feat: ユーザー登録機能を追加
fix: ログインエラーを修正
docs: README更新
style: コードフォーマット修正
refactor: 認証ロジックをリファクタリング
test: ログインテストを追加
chore: 依存関係を更新
```

---

## 主要技術スタック

### フロントエンド

- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript 5+
- **UIライブラリ**: React 18+
- **スタイリング**: Tailwind CSS 3+
- **コンポーネント**: shadcn/ui
- **状態管理**: Zustand
- **データフェッチング**: TanStack Query (React Query)

### バックエンド

- **フレームワーク**: Next.js API Routes
- **言語**: TypeScript
- **ORM**: Prisma 5+
- **認証**: NextAuth.js v5

### データベース・インフラ

- **DB**: PostgreSQL 15+
- **キャッシュ**: Redis
- **ストレージ**: AWS S3 / Cloudflare R2
- **ホスティング**: Vercel
- **監視**: Sentry, Vercel Analytics

### 外部API

- Stripe（決済）
- Instagram Graph API
- Vimeo API（動画配信）
- SendGrid / Resend（メール）

---

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm run start

# Lint
npm run lint

# 型チェック
npm run type-check

# テスト
npm run test              # 全テスト
npm run test:unit         # 単体テスト
npm run test:integration  # 結合テスト
npm run test:e2e          # E2Eテスト
npm run test:coverage     # カバレッジ

# データベース
npx prisma migrate dev    # マイグレーション作成・実行
npx prisma db seed        # シードデータ投入
npx prisma studio         # Prisma Studio起動
```

---

## リリーススケジュール

| フェーズ | 内容 | リリース目標 |
|---------|------|------------|
| Phase 0 | 要件定義・設計 | 2025/12/31 |
| Phase 1 | Level 1（基盤構築） | 2026/02/28（β版） |
| Phase 2 | Level 2-3（SNS化・ゲーム化） | 2026/03/31（正式版） |
| Phase 3 | Level 4（資産化） | 2026/05/31 |
| Phase 4 | Level 5（エコシステム） | 2026/06以降 |

詳細は [開発スケジュール](./04_development_schedule.md) を参照

---

## 主要機能（レベル別）

### Level 1: 基盤構築（MVP）
- 会員登録・ログイン・認証
- プラン管理・決済連携（Stripe）
- 動画視聴・学習進捗管理
- 管理者ダッシュボード

### Level 2: 双方向性（SNS化）
- Instagram連携・データ自動取得
- フィード投稿・コメント・いいね
- 通知機能

### Level 3: ゲーミフィケーション（定着）
- ランク・レベルシステム
- バッジ・称号
- XP（経験値）システム
- ログインボーナス

### Level 4: 資産化（ナレッジDB）
- バズ投稿自動収集・ギャラリー
- 横断検索機能
- レコメンド機能

### Level 5: 自走（エコシステム）
- 会員間DM
- スカウト・マッチング機能
- 外部API公開

詳細は [機能要件定義書](./02_functional_requirements.md) を参照

---

## セキュリティ

- **HTTPS強制**: TLS 1.3
- **認証**: JWT + Refresh Token
- **パスワード**: bcrypt（cost: 12）
- **OWASP Top 10対応**
- **PCI DSS準拠**（Stripe使用）
- **定期的な脆弱性診断**

詳細は [セキュリティ要件定義書](./08_security_requirements.md) を参照

---

## 貢献ガイドライン

### Pull Request

1. feature/xxx ブランチを作成
2. 変更を実装
3. テストを書く
4. Lint、型チェック、テストを実行
5. Pull Requestを作成
6. コードレビュー
7. マージ

### コードレビュー基準

- [ ] 機能要件を満たしている
- [ ] テストがある（カバレッジ80%以上）
- [ ] Lint、型チェックがパス
- [ ] セキュリティ上の問題がない
- [ ] パフォーマンスへの影響が少ない
- [ ] ドキュメントが更新されている

---

## トラブルシューティング

### よくある問題

#### 1. データベース接続エラー

```bash
# PostgreSQLが起動しているか確認
docker ps

# コンテナを再起動
docker-compose restart postgres
```

#### 2. マイグレーションエラー

```bash
# マイグレーションをリセット
npx prisma migrate reset

# 再度マイグレーション
npx prisma migrate dev
```

#### 3. ビルドエラー

```bash
# node_modules削除
rm -rf node_modules

# 再インストール
npm install

# キャッシュクリア
npm run clean
```

---

## サポート・お問い合わせ

### 開発チーム連絡先

- **Slack**: #sakiyomi-dev
- **メール**: dev@sakiyomi.com
- **GitHub Issues**: バグ報告・機能要望

### ドキュメント更新

ドキュメントに不備や更新が必要な箇所がある場合は、Pull Requestを作成してください。

---

## ライセンス

© 2025 SAKIYOMI. All rights reserved.

---

## 変更履歴

| バージョン | 日付 | 変更内容 |
|-----------|------|---------|
| 1.0 | 2025-12-02 | 初版作成 |

---

**Last Updated**: 2025-12-02
