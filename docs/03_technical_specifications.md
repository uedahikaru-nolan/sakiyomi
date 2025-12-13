# 技術仕様書

## 1. システムアーキテクチャ

### 1.1 全体構成

```
┌─────────────────────────────────────────────────┐
│              クライアント層                       │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Web App    │  │  Mobile Web  │            │
│  │  (Next.js)   │  │  (PWA対応)   │            │
│  └──────────────┘  └──────────────┘            │
└─────────────────────────────────────────────────┘
                      ↓ HTTPS
┌─────────────────────────────────────────────────┐
│              CDN / ロードバランサー               │
│           (CloudFront / Vercel)                 │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│           アプリケーション層                      │
│  ┌──────────────────────────────────┐           │
│  │    Next.js API Routes            │           │
│  │    (Serverless Functions)        │           │
│  └──────────────────────────────────┘           │
│  ┌──────────────────────────────────┐           │
│  │    バックエンドAPI                │           │
│  │    (Node.js / Python FastAPI)    │           │
│  └──────────────────────────────────┘           │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│              データ層                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │PostgreSQL│  │  Redis   │  │  S3/R2   │     │
│  │   (RDS)  │  │ (Cache)  │  │(Storage) │     │
│  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────┘
                      ↓
┌─────────────────────────────────────────────────┐
│           外部サービス連携                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │Stripe│ │Insta │ │Vimeo │ │ Mail │          │
│  │ API  │ │Graph │ │ API  │ │Service│         │
│  └──────┘ └──────┘ └──────┘ └──────┘          │
└─────────────────────────────────────────────────┘
```

### 1.2 技術スタック選定

#### 1.2.1 フロントエンド

**推奨構成:**
- **フレームワーク**: Next.js 14+ (App Router)
- **言語**: TypeScript 5+
- **UIライブラリ**: React 18+
- **スタイリング**: Tailwind CSS 3+
- **コンポーネントライブラリ**: shadcn/ui または Radix UI
- **状態管理**: Zustand または Jotai
- **フォーム管理**: React Hook Form + Zod
- **データフェッチング**: TanStack Query (React Query)

**選定理由:**
- Next.js: SSR/SSG対応、SEO最適化、優れた開発体験
- TypeScript: 型安全性、保守性向上、チーム開発に適している
- Tailwind CSS: 高速な開発、一貫性のあるデザイン、バンドルサイズ最適化
- React Query: サーバーステートの効率的管理、キャッシング、楽観的更新

#### 1.2.2 バックエンド

**推奨構成（オプション1: Node.js）:**
- **フレームワーク**: Next.js API Routes + Serverless Functions
- **言語**: TypeScript
- **ORM**: Prisma 5+
- **認証**: NextAuth.js v5
- **バリデーション**: Zod

**推奨構成（オプション2: Python）:**
- **フレームワーク**: FastAPI 0.104+
- **言語**: Python 3.11+
- **ORM**: SQLAlchemy 2.0+
- **認証**: Python-JOSE + Passlib
- **バリデーション**: Pydantic v2

**選定理由:**
- Node.js: フロントエンドと言語統一、開発効率向上、Vercelとの親和性
- Python: AI/ML機能の将来的な追加に有利、データ分析に強い、Instagram API連携のライブラリが豊富

**推奨**: 初期はNext.js API Routesで開発し、Level 4以降でPython移行を検討

#### 1.2.3 データベース

**メインDB:**
- **RDBMS**: PostgreSQL 15+
- **ホスティング**: AWS RDS / Supabase / Neon

**キャッシュ:**
- **Redis**: Upstash Redis または AWS ElastiCache

**ストレージ:**
- **オブジェクトストレージ**: AWS S3 / Cloudflare R2

**選定理由:**
- PostgreSQL: 信頼性、トランザクション対応、JSON型サポート、全文検索
- Redis: セッション管理、キャッシング、レート制限
- S3/R2: 安価、CDN連携、画像最適化

#### 1.2.4 インフラ・デプロイ

**推奨構成:**
- **ホスティング**: Vercel（フロントエンド + API Routes）
- **バックエンド**: AWS Fargate / Railway / Render（Python FastAPI使用時）
- **データベース**: Supabase / AWS RDS
- **CDN**: Vercel Edge Network / CloudFront
- **CI/CD**: GitHub Actions
- **監視**: Vercel Analytics + Sentry
- **ログ**: Datadog / CloudWatch

**選定理由:**
- Vercel: Next.jsの最適化、自動スケーリング、簡単なデプロイ
- Supabase: PostgreSQL + 認証 + ストレージ統合、スタートアップに最適
- GitHub Actions: 無料枠が豊富、GitHubとの統合

#### 1.2.5 外部API・サービス

| サービス | 用途 | 代替案 |
|---------|------|--------|
| Stripe | 決済処理 | PayPal, Square |
| Instagram Graph API | Instagram データ取得 | なし（公式のみ） |
| Vimeo API | 動画配信 | YouTube API, Mux |
| SendGrid / Resend | メール配信 | AWS SES, Postmark |
| Cloudinary | 画像最適化 | imgix, AWS Lambda |
| Google OAuth | ソーシャルログイン | - |
| LINE Login | ソーシャルログイン | - |

---

## 2. データベース設計概要

### 2.1 主要テーブル一覧

| テーブル名 | 概要 | 関連 |
|-----------|------|------|
| users | 会員基本情報 | - |
| user_profiles | 会員詳細プロフィール | users (1:1) |
| subscriptions | サブスクリプション情報 | users (1:N) |
| plans | プラン定義 | - |
| videos | 動画コンテンツ | - |
| categories | カテゴリ | - |
| courses | コース | categories (N:1) |
| chapters | チャプター | courses (N:1) |
| lessons | レッスン | chapters (N:1) |
| user_progress | 学習進捗 | users, lessons (N:N) |
| instagram_accounts | Instagram 連携情報 | users (1:1) |
| instagram_metrics | Instagram メトリクス履歴 | instagram_accounts (1:N) |
| instagram_posts | Instagram 投稿データ | instagram_accounts (1:N) |
| posts | フィード投稿 | users (N:1) |
| comments | コメント | posts, users (N:N) |
| reactions | リアクション | posts/comments, users (N:N) |
| notifications | 通知 | users (1:N) |
| badges | バッジ定義 | - |
| user_badges | ユーザーバッジ取得履歴 | users, badges (N:N) |
| ranks | ランク定義 | - |
| user_ranks | ユーザーランク履歴 | users, ranks (N:N) |
| xp_transactions | XP取得履歴 | users (1:N) |

**詳細なER図とテーブル定義は `06_database_design.md` を参照**

---

## 3. API設計概要

### 3.1 API設計方針

- **アーキテクチャ**: RESTful API
- **認証方式**: JWT (JSON Web Token)
- **レスポンス形式**: JSON
- **バージョニング**: URLパスでバージョン管理 (`/api/v1/...`)
- **エラーハンドリング**: 統一されたエラーレスポンス形式

### 3.2 認証・認可フロー

#### 3.2.1 JWT認証フロー

```
1. ログイン
   POST /api/v1/auth/login
   Request: { email, password }
   Response: { accessToken, refreshToken, user }

2. アクセストークンの検証
   全APIリクエスト時に Authorization: Bearer {accessToken}

3. トークンリフレッシュ
   POST /api/v1/auth/refresh
   Request: { refreshToken }
   Response: { accessToken }

4. ログアウト
   POST /api/v1/auth/logout
   Request: { refreshToken }
```

#### 3.2.2 トークン仕様

- **Access Token**:
  - 有効期限: 15分
  - ペイロード: userId, email, role
  - 署名アルゴリズム: HS256

- **Refresh Token**:
  - 有効期限: 7日間
  - データベースに保存（ブラックリスト管理）
  - ローテーション方式（使用後に新しいトークン発行）

### 3.3 APIエンドポイント構成

#### 認証・会員管理
```
POST   /api/v1/auth/register         # 新規登録
POST   /api/v1/auth/login            # ログイン
POST   /api/v1/auth/logout           # ログアウト
POST   /api/v1/auth/refresh          # トークンリフレッシュ
POST   /api/v1/auth/forgot-password  # パスワードリセット申請
POST   /api/v1/auth/reset-password   # パスワードリセット実行
GET    /api/v1/users/me              # 自分の情報取得
PATCH  /api/v1/users/me              # 自分の情報更新
GET    /api/v1/users/:id             # ユーザー情報取得
```

#### 学習管理
```
GET    /api/v1/categories            # カテゴリ一覧
GET    /api/v1/courses               # コース一覧
GET    /api/v1/courses/:id           # コース詳細
GET    /api/v1/lessons/:id           # レッスン詳細
POST   /api/v1/progress              # 進捗記録
GET    /api/v1/progress/me           # 自分の進捗取得
```

#### Instagram連携
```
POST   /api/v1/instagram/connect     # Instagram連携
DELETE /api/v1/instagram/disconnect  # Instagram連携解除
GET    /api/v1/instagram/profile     # Instagram プロフィール取得
GET    /api/v1/instagram/metrics     # Instagram メトリクス取得
GET    /api/v1/instagram/posts       # Instagram 投稿一覧
```

#### コミュニティ
```
GET    /api/v1/posts                 # 投稿一覧
POST   /api/v1/posts                 # 投稿作成
GET    /api/v1/posts/:id             # 投稿詳細
PATCH  /api/v1/posts/:id             # 投稿編集
DELETE /api/v1/posts/:id             # 投稿削除
POST   /api/v1/posts/:id/comments    # コメント投稿
POST   /api/v1/posts/:id/reactions   # リアクション追加
DELETE /api/v1/posts/:id/reactions   # リアクション削除
```

#### ゲーミフィケーション
```
GET    /api/v1/gamification/rank     # 自分のランク取得
GET    /api/v1/gamification/xp       # XP取得履歴
GET    /api/v1/gamification/badges   # 取得バッジ一覧
GET    /api/v1/gamification/leaderboard # ランキング
```

**詳細なAPI仕様は `07_api_specifications.md` を参照**

---

## 4. セキュリティ設計

### 4.1 認証・認可

#### 4.1.1 パスワードセキュリティ
- **ハッシュアルゴリズム**: bcrypt (cost factor: 12)
- **パスワードポリシー**:
  - 最低8文字
  - 英数字を含む
  - 最大64文字
- **パスワードリセット**:
  - ワンタイムトークン（UUID）
  - 有効期限: 1時間
  - 使用後は無効化

#### 4.1.2 セッション管理
- **JWT署名鍵**: 環境変数で管理、定期ローテーション
- **Refresh Token**: データベース管理、ブラックリスト方式
- **CSRF対策**: SameSite Cookie属性、CSRFトークン

#### 4.1.3 OAuth連携
- **Google OAuth 2.0**:
  - スコープ: email, profile
  - state パラメータによるCSRF対策
- **LINE Login**:
  - スコープ: profile, email
  - nonce パラメータ使用

### 4.2 データ保護

#### 4.2.1 暗号化
- **通信**: TLS 1.3（HTTPS強制）
- **機密データ**: AES-256による暗号化
  - Instagramアクセストークン
  - 決済関連情報（Stripe使用のため最小限）
- **暗号鍵管理**: AWS KMS / Google Cloud KMS

#### 4.2.2 個人情報保護
- **PII（個人識別情報）の最小化**
- **データアクセスログの記録**
- **削除権（GDPR対応）**: アカウント削除時のデータ完全削除
- **データ匿名化**: 分析用データの匿名化処理

### 4.3 脆弱性対策

#### 4.3.1 OWASP Top 10 対策

| 脅威 | 対策 |
|------|------|
| Injection (SQLi) | Prisma ORM / パラメータ化クエリ |
| Broken Authentication | JWT + Refresh Token、MFA |
| Sensitive Data Exposure | 暗号化、HTTPS強制 |
| XML External Entities (XXE) | JSONのみ使用 |
| Broken Access Control | ロールベースアクセス制御（RBAC） |
| Security Misconfiguration | セキュリティヘッダー設定 |
| XSS | サニタイゼーション、CSP |
| Insecure Deserialization | 入力バリデーション |
| Using Components with Known Vulnerabilities | 定期的な依存関係更新、Dependabot |
| Insufficient Logging & Monitoring | 監査ログ、Sentry |

#### 4.3.2 セキュリティヘッダー設定

```javascript
// Next.js next.config.js
{
  headers: [
    {
      key: 'X-Frame-Options',
      value: 'DENY'
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    },
    {
      key: 'Strict-Transport-Security',
      value: 'max-age=31536000; includeSubDomains'
    },
    {
      key: 'Content-Security-Policy',
      value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ..."
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin'
    }
  ]
}
```

### 4.4 レート制限・DDoS対策

#### 4.4.1 レート制限

| エンドポイント | 制限 |
|--------------|------|
| 認証API（ログイン） | 5リクエスト/分/IP |
| 認証API（登録） | 3リクエスト/時間/IP |
| 一般API | 100リクエスト/分/ユーザー |
| Instagram API呼び出し | 200リクエスト/時間（Meta制限に準拠） |

**実装方法**: Redis + sliding window アルゴリズム

#### 4.4.2 ボット対策
- reCAPTCHA v3（登録・ログイン時）
- Cloudflare Bot Management（オプション）

---

## 5. パフォーマンス最適化

### 5.1 フロントエンド最適化

#### 5.1.1 コード分割・遅延読み込み
```typescript
// 動的インポート
const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), {
  loading: () => <Skeleton />,
  ssr: false
});

// ルートベースのコード分割（Next.js自動）
```

#### 5.1.2 画像最適化
- Next.js Image コンポーネント使用
- WebP形式への自動変換
- レスポンシブ画像（srcset）
- 遅延読み込み（Lazy Loading）
- Cloudinary / imgix使用

#### 5.1.3 バンドルサイズ最適化
- Tree Shaking
- 不要なライブラリの削除
- バンドルアナライザーによる定期確認
- 目標: First Load JS < 200KB

### 5.2 バックエンド最適化

#### 5.2.1 データベースクエリ最適化
- インデックス適切な設定
- N+1問題の回避（Prismaの include活用）
- クエリ実行計画の確認
- コネクションプーリング

#### 5.2.2 キャッシング戦略

**Redisキャッシュ対象**:
- ユーザーセッション
- 頻繁にアクセスされるマスターデータ（プラン、ランク定義）
- 動画メタデータ
- Instagram メトリクス（1時間キャッシュ）

**CDNキャッシュ**:
- 静的アセット（画像、CSS、JS）
- 動画サムネイル
- プロフィール画像

**ブラウザキャッシュ**:
- Cache-Control ヘッダー適切な設定

#### 5.2.3 非同期処理・バックグラウンドジョブ

**ジョブキュー**: BullMQ（Node.js） / Celery（Python）

**バックグラウンド処理対象**:
- Instagram データの定期取得（毎日深夜2:00）
- メール送信
- ランク再計算
- バッジ付与判定
- 画像リサイズ・最適化

### 5.3 インフラ最適化

#### 5.3.1 CDN活用
- Vercel Edge Network（グローバル配信）
- 静的コンテンツの自動キャッシング
- 動的コンテンツの Edge Caching

#### 5.3.2 データベース
- Read Replica（読み取り専用レプリカ）の活用
- コネクションプーリング（PgBouncer）
- クエリキャッシュ

#### 5.3.3 負荷分散
- ロードバランサー（ALB / Vercel自動）
- オートスケーリング設定

---

## 6. モニタリング・ログ管理

### 6.1 監視項目

#### 6.1.1 インフラ監視
- CPU使用率
- メモリ使用率
- ディスク使用率
- ネットワークトラフィック
- データベース接続数

#### 6.1.2 アプリケーション監視
- API応答時間
- エラー率
- リクエスト数
- アクティブユーザー数
- トランザクション成功率

#### 6.1.3 ビジネスメトリクス
- 会員登録数（日次）
- アクティブユーザー数（DAU/MAU）
- 動画視聴完了率
- 投稿数
- 決済成功率

### 6.2 ログ管理

#### 6.2.1 ログレベル
- **ERROR**: エラー、例外
- **WARN**: 警告（パフォーマンス低下など）
- **INFO**: 重要なイベント（ログイン、決済など）
- **DEBUG**: デバッグ情報（開発環境のみ）

#### 6.2.2 ログ収集・分析
- **収集**: CloudWatch Logs / Datadog
- **分析**: CloudWatch Insights / Datadog Dashboards
- **アラート**: Slack / PagerDuty連携

#### 6.2.3 監査ログ
- 管理者操作ログ
- 決済ログ
- 個人情報アクセスログ
- 保持期間: 3年

### 6.3 エラートラッキング

**ツール**: Sentry

**収集情報**:
- エラースタックトレース
- ユーザー情報（匿名化オプション）
- ブラウザ・デバイス情報
- リクエスト情報

---

## 7. CI/CD パイプライン

### 7.1 開発フロー

```
1. 開発者がfeatureブランチで開発
2. Pull Request作成
3. 自動テスト実行（GitHub Actions）
4. コードレビュー
5. mainブランチへマージ
6. 自動デプロイ（Vercel）
```

### 7.2 GitHub Actions ワークフロー

#### 7.2.1 CI (Continuous Integration)

```yaml
name: CI

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
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run build

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run security audit
        run: npm audit --production
```

#### 7.2.2 CD (Continuous Deployment)

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### 7.3 環境管理

| 環境 | 用途 | ブランチ | URL |
|------|------|---------|-----|
| Development | 開発環境 | develop | dev.sakiyomi.com |
| Staging | 検証環境 | staging | staging.sakiyomi.com |
| Production | 本番環境 | main | app.sakiyomi.com |

---

## 8. バックアップ・災害復旧

### 8.1 バックアップ戦略

#### 8.1.1 データベースバックアップ
- **自動バックアップ**: 毎日深夜3:00
- **保持期間**: 30日間
- **バックアップタイプ**: フルバックアップ + トランザクションログ
- **バックアップ先**: 別リージョンのS3

#### 8.1.2 ファイルストレージバックアップ
- **S3バージョニング**: 有効化
- **クロスリージョンレプリケーション**: 有効化

### 8.2 災害復旧計画（DR Plan）

#### 8.2.1 目標設定
- **RTO（Recovery Time Objective）**: 4時間以内
- **RPO（Recovery Point Objective）**: 1時間以内

#### 8.2.2 復旧手順書
1. 障害検知（監視アラート）
2. 影響範囲の特定
3. バックアップからの復元
4. データ整合性チェック
5. サービス再開
6. 事後検証

---

## 9. 開発環境構築手順

### 9.1 必要なソフトウェア

- Node.js 20+
- npm または pnpm
- Docker & Docker Compose
- Git
- PostgreSQL 15+ (ローカルまたはDocker)
- Redis (ローカルまたはDocker)

### 9.2 セットアップ手順

```bash
# 1. リポジトリクローン
git clone https://github.com/your-org/sakiyomi-platform.git
cd sakiyomi-platform

# 2. 依存関係インストール
npm install

# 3. 環境変数設定
cp .env.example .env.local
# .env.localを編集（データベース接続情報など）

# 4. Dockerコンテナ起動（PostgreSQL, Redis）
docker-compose up -d

# 5. データベースマイグレーション
npx prisma migrate dev

# 6. シードデータ投入
npx prisma db seed

# 7. 開発サーバー起動
npm run dev

# ブラウザで http://localhost:3000 にアクセス
```

### 9.3 推奨VSCode拡張機能

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

---

## 10. 技術的課題と対応方針

### 10.1 Instagram API制限への対応

**課題**:
- APIレート制限（200リクエスト/時間）
- アクセストークンの60日有効期限

**対応方針**:
- バッチ処理による効率的なデータ取得
- キャッシュの積極的活用
- トークン自動更新機構の実装
- ユーザーへの再認証フロー明示

### 10.2 スケーラビリティ

**課題**:
- 会員数増加に伴うデータベース負荷
- 動画視聴時の帯域幅

**対応方針**:
- データベースのシャーディング（将来的）
- Read Replicaの活用
- CDNによる動画配信
- Vimeoなど外部サービスの活用

### 10.3 リアルタイム通知

**課題**:
- 通知のリアルタイム配信

**対応方針（Level 2以降）**:
- WebSocket (Socket.io) または Server-Sent Events (SSE)
- ポーリングからの段階的移行
- プッシュ通知（PWA）の検討

---

## 11. コーディング規約

### 11.1 TypeScript/JavaScript

- **スタイルガイド**: Airbnb JavaScript Style Guide準拠
- **Linter**: ESLint
- **Formatter**: Prettier
- **命名規則**:
  - ファイル: kebab-case (`user-profile.tsx`)
  - コンポーネント: PascalCase (`UserProfile`)
  - 関数・変数: camelCase (`getUserProfile`)
  - 定数: UPPER_SNAKE_CASE (`API_BASE_URL`)
  - 型: PascalCase (`UserProfile`)

### 11.2 コンポーネント設計

- **Atomic Design** の採用
  - Atoms（Button, Input）
  - Molecules（SearchBar, UserCard）
  - Organisms（Header, PostList）
  - Templates（PageLayout）
  - Pages（HomePage）

### 11.3 コメント・ドキュメント

- **JSDoc** によるドキュメンテーション
- 複雑なロジックには必ずコメント
- README.md の充実

---

## 12. サードパーティライブラリ一覧

### 12.1 フロントエンド主要ライブラリ

| ライブラリ | 用途 | バージョン |
|-----------|------|-----------|
| next | フレームワーク | ^14.0.0 |
| react | UIライブラリ | ^18.0.0 |
| typescript | 言語 | ^5.0.0 |
| tailwindcss | スタイリング | ^3.4.0 |
| @tanstack/react-query | データフェッチング | ^5.0.0 |
| zustand | 状態管理 | ^4.5.0 |
| react-hook-form | フォーム管理 | ^7.51.0 |
| zod | バリデーション | ^3.22.0 |
| date-fns | 日付操作 | ^3.0.0 |
| recharts | グラフ描画 | ^2.10.0 |
| lucide-react | アイコン | ^0.344.0 |

### 12.2 バックエンド主要ライブラリ（Node.js）

| ライブラリ | 用途 | バージョン |
|-----------|------|-----------|
| @prisma/client | ORM | ^5.0.0 |
| next-auth | 認証 | ^5.0.0 |
| stripe | 決済 | ^14.0.0 |
| bcrypt | パスワードハッシュ | ^5.1.0 |
| jsonwebtoken | JWT | ^9.0.0 |
| ioredis | Redis クライアント | ^5.3.0 |
| nodemailer | メール送信 | ^6.9.0 |

---

**文書管理情報**
- バージョン: 1.0
- 作成日: 2025-12-02
- 最終更新日: 2025-12-02
- 承認状態: ドラフト
