# 開発ガイド

## 🚀 開発状況

### 実装完了（2025-12-03）

#### Phase 0: 基盤構築 ✅
- データベース設計（25テーブル）
- 認証システム（Supabase Auth）
- ルーティング・ミドルウェア
- UIコンポーネントライブラリ

#### Phase 1: コア機能 ✅
- ユーザープロフィール管理
- コミュニティ投稿機能
- コース管理基盤
- Instagram連携UI
- 管理者ダッシュボード

## 📁 プロジェクト構造

\`\`\`
sakiyomitool/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # 認証グループ
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/               # ユーザーダッシュボード
│   │   ├── layout.tsx          # 保護されたレイアウト
│   │   ├── page.tsx            # メインダッシュボード
│   │   ├── profile/            # プロフィール編集
│   │   ├── courses/            # コース一覧・詳細
│   │   ├── community/          # コミュニティ
│   │   └── instagram/          # Instagram連携
│   ├── admin/                   # 管理者エリア
│   │   ├── layout.tsx          # 管理者レイアウト
│   │   └── page.tsx            # 管理者ダッシュボード
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                      # 基本UIコンポーネント
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── badge.tsx
│   └── features/                # 機能別コンポーネント
│       ├── auth/
│       │   ├── login-form.tsx
│       │   └── signup-form.tsx
│       ├── profile/
│       │   └── profile-form.tsx
│       └── community/
│           └── create-post-form.tsx
├── lib/
│   ├── actions/                 # Server Actions
│   │   ├── auth.ts
│   │   ├── profile.ts
│   │   └── posts.ts
│   ├── supabase/                # Supabase設定
│   │   ├── client.ts           # クライアント用
│   │   ├── server.ts           # サーバー用
│   │   └── middleware.ts       # ミドルウェア用
│   └── utils/
│       ├── cn.ts               # Tailwindユーティリティ
│       └── get-user.ts         # ユーザー取得
├── types/
│   └── database.types.ts        # DB型定義
└── middleware.ts                # ルートミドルウェア
\`\`\`

## 🗄️ データベーススキーマ

### 主要テーブル関係

\`\`\`
users (会員)
  ├── user_profiles (プロフィール詳細)
  ├── subscriptions (サブスクリプション) → plans
  ├── instagram_accounts (Instagram連携)
  │   ├── instagram_metrics (メトリクス履歴)
  │   └── instagram_posts (投稿データ)
  ├── user_progress (学習進捗) → lessons
  ├── posts (投稿)
  │   ├── comments (コメント)
  │   └── reactions (リアクション)
  ├── user_ranks (ランク履歴) → ranks
  └── user_badges (バッジ取得) → badges
\`\`\`

## 🔐 認証フロー

### ログイン
1. ユーザーが `/auth/login` でメール・パスワード入力
2. `login()` Server Action実行
3. Supabase Auth認証
4. 成功時 → `/dashboard` へリダイレクト

### 新規登録
1. ユーザーが `/auth/signup` で情報入力
2. `signup()` Server Action実行
3. Supabase Authでユーザー作成
4. `users` テーブルにユーザー情報登録
5. 成功時 → `/dashboard` へリダイレクト

### 保護されたルート
- ミドルウェアで全リクエスト検証
- 未認証の場合 → `/auth/login` へリダイレクト
- 管理者ページはロールチェック

## 📝 開発タスク

### すぐに実装可能
- [ ] 動画視聴機能（Vimeo API連携）
- [ ] コメント機能
- [ ] いいね・リアクション機能
- [ ] 通知システム基盤
- [ ] ユーザー検索機能

### Phase 2: Instagram連携
- [ ] Instagram Graph API統合
- [ ] OAuth認証フロー
- [ ] データ自動取得バッチ
- [ ] メトリクスグラフ表示
- [ ] 投稿分析機能

### Phase 3: ゲーミフィケーション
- [ ] XPシステム実装
- [ ] ランク自動判定
- [ ] バッジ自動付与
- [ ] ログインボーナス
- [ ] リーダーボード

### Phase 4: 管理機能強化
- [ ] 会員管理（CRUD）
- [ ] コース・レッスン管理
- [ ] 投稿モデレーション
- [ ] 分析レポート
- [ ] メール配信機能

## 🔧 便利なコマンド

\`\`\`bash
# 開発サーバー起動
npm run dev

# 型チェック
npm run type-check

# Lint
npm run lint

# フォーマット
npm run format

# ビルド確認
npm run build
\`\`\`

## 🐛 デバッグ

### よくある問題

#### 1. 認証エラー
- `.env.local` の環境変数を確認
- Supabase プロジェクトの設定を確認

#### 2. データベースエラー
- Supabaseダッシュボードでテーブル存在確認
- RLSポリシーの設定（現在は無効化）

#### 3. ビルドエラー
- `npm run type-check` で型エラー確認
- `.next` フォルダを削除して再ビルド

## 📊 パフォーマンス目標

- First Load JS: < 200KB
- Time to Interactive: < 3s
- API Response Time: < 500ms
- Database Query Time: < 100ms

## 🔒 セキュリティチェックリスト

- [x] パスワードのハッシュ化（bcrypt）
- [x] HTTPS強制
- [x] CSRF対策（Next.js内蔵）
- [x] XSS対策（React自動エスケープ）
- [x] SQL Injection対策（Prisma/Supabase）
- [ ] レート制限
- [ ] 入力バリデーション強化
- [ ] セキュリティヘッダー設定

## 📈 次の優先順位

1. **動画視聴機能** - コアバリューの実現
2. **コメント・いいね** - コミュニティ活性化
3. **Instagram連携** - 差別化機能
4. **通知システム** - ユーザーエンゲージメント
5. **決済連携（Stripe）** - 収益化

---

最終更新: 2025-12-03
