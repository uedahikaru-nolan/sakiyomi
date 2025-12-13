# Stripe決済セットアップガイド

このドキュメントでは、プラン購入機能のためのStripe決済のセットアップ手順を説明します。

## 1. Stripeアカウントの準備

1. [Stripe](https://stripe.com)にアクセスし、アカウントを作成またはログイン
2. ダッシュボードから**テストモード**を有効にする（開発環境の場合）

## 2. APIキーの取得

1. Stripeダッシュボードで「開発者」→「APIキー」にアクセス
2. 以下のキーをコピー：
   - **公開可能キー** (Publishable key): `pk_test_...`
   - **シークレットキー** (Secret key): `sk_test_...`

3. `.env.local`ファイルに追加：
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_SECRET_KEY=sk_test_your_key_here
```

## 3. プロダクトと価格の作成

各プランに対してStripeでプロダクトと価格を作成する必要があります。

### ベーシックプラン（9,800円/月）

1. Stripeダッシュボードで「商品」→「商品を追加」をクリック
2. 以下を入力：
   - **名前**: ベーシックプラン
   - **説明**: 全動画視聴可能
   - **価格**: 9800 JPY
   - **請求期間**: 月次（Recurring - Monthly）
3. 作成後、価格ID（`price_xxx...`）をコピー

### プレミアムプラン（19,800円/月）

同様に以下を入力：
- **名前**: プレミアムプラン
- **説明**: 全機能 + 個別相談
- **価格**: 19800 JPY
- **請求期間**: 月次（Recurring - Monthly）

## 4. データベースにStripe価格IDを登録

取得した価格IDをデータベースのplansテーブルに登録します：

```sql
-- ベーシックプランの価格IDを更新
UPDATE plans
SET stripe_price_id = 'price_xxxxxxxxxxxxxx'
WHERE name = 'ベーシックプラン';

-- プレミアムプランの価格IDを更新
UPDATE plans
SET stripe_price_id = 'price_yyyyyyyyyyyyyy'
WHERE name = 'プレミアムプラン';
```

Supabaseのダッシュボード → SQL Editorから実行してください。

## 5. Webhookの設定

Stripeからのイベント（支払い成功、サブスクリプション更新など）を受け取るためにWebhookを設定します。

### ローカル開発環境の場合

1. Stripe CLIをインストール：
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Windows
scoop install stripe
```

2. Stripe CLIでログイン：
```bash
stripe login
```

3. Webhookをリッスン：
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

4. 表示される**Webhook signing secret**（`whsec_...`）を`.env.local`に追加：
```env
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 本番環境の場合

1. Stripeダッシュボードで「開発者」→「Webhook」→「エンドポイントを追加」
2. エンドポイントURL: `https://yourdomain.com/api/webhooks/stripe`
3. 以下のイベントを選択：
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. 作成後、**Signing secret**をコピーして環境変数に設定

## 6. プランの機能リスト（オプション）

各プランに機能リストを追加する場合：

```sql
-- ベーシックプランの機能を追加
UPDATE plans
SET features = '["全動画視聴可能", "基本サポート", "コミュニティアクセス"]'::jsonb
WHERE name = 'ベーシックプラン';

-- プレミアムプランの機能を追加
UPDATE plans
SET features = '["全動画視聴可能", "優先サポート", "コミュニティアクセス", "個別相談（月1回）", "限定コンテンツアクセス"]'::jsonb
WHERE name = 'プレミアムプラン';
```

## 7. 動作確認

1. 開発サーバーを起動：
```bash
npm run dev
```

2. `/dashboard/plans`にアクセス
3. プランを選択して「このプランを選択」をクリック
4. Stripeのテスト用カード番号を使用して支払いをテスト：
   - カード番号: `4242 4242 4242 4242`
   - 有効期限: 未来の任意の日付
   - CVC: 任意の3桁の数字
   - 郵便番号: 任意の番号

## トラブルシューティング

### エラー: "Stripe価格IDが設定されていません"

→ データベースのplansテーブルにstripe_price_idが正しく設定されているか確認してください。

### Webhookが動作しない

→ Stripe CLIが起動しているか、または本番環境でWebhookエンドポイントが正しく設定されているか確認してください。

### 決済後にサブスクリプションが反映されない

→ Webhookのログを確認して、イベントが正しく処理されているか確認してください。

## セキュリティに関する注意事項

- 本番環境では必ずHTTPSを使用してください
- Stripeのシークレットキーは絶対に公開しないでください
- `.env.local`ファイルは`.gitignore`に含まれていることを確認してください
