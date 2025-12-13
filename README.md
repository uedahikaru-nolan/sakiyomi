# SAKIYOMI

SAKIYOMIプラットフォーム - Instagram運用支援サービス

## 機能

- 👤 ユーザー認証・管理
- 📚 コース・レッスン管理
- 💬 1対1チャット機能
- 👥 グループチャット機能
- 📊 Instagram連携・分析
- 🎖️ ランク・バッジシステム
- 💳 サブスクリプション管理（Stripe連携）

## 技術スタック

- **フロントエンド**: Next.js 15, React, TypeScript, Tailwind CSS
- **バックエンド**: Next.js Server Actions, Supabase
- **データベース**: PostgreSQL (Supabase)
- **認証**: Supabase Auth
- **リアルタイム**: Supabase Realtime
- **決済**: Stripe

## セットアップ

1. 依存関係のインストール:
\`\`\`bash
npm install
\`\`\`

2. 環境変数の設定:
\`.env.local\`ファイルを作成し、以下の環境変数を設定:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

3. 開発サーバーの起動:
\`\`\`bash
npm run dev
\`\`\`

## プロジェクト構成

\`\`\`
├── app/                    # Next.js App Router
│   ├── admin/             # 管理画面
│   ├── auth/              # 認証ページ
│   └── dashboard/         # ユーザーダッシュボード
├── components/            # Reactコンポーネント
│   ├── ui/               # 共通UIコンポーネント
│   └── features/         # 機能別コンポーネント
├── lib/                   # ユーティリティ・ヘルパー
│   ├── actions/          # Server Actions
│   ├── hooks/            # カスタムフック
│   └── supabase/         # Supabase設定
└── supabase/             # Supabaseマイグレーション
\`\`\`

## チャット機能

### 1対1チャット
- ユーザーと運営者の直接コミュニケーション
- リアルタイムメッセージ送受信
- 未読管理
- ステータス管理（対応中/解決済/クローズ）

### グループチャット
- 複数ユーザーとのグループ会話
- 管理者によるグループ作成
- メンバー管理
- リアルタイム更新

## デプロイ

Vercelでのデプロイを推奨:
\`\`\`bash
vercel
\`\`\`

## ライセンス

Private
