# 投稿フィードバック機能のエラー修正

## エラー内容
「フィードバックの取得に失敗しました」というエラーが発生していました。

## 修正内容

### 1. データベースクエリの修正 (`lib/actions/post-feedback.ts`)

**問題**: Supabaseの複雑なJOINクエリが失敗していた

**修正**:
- 複雑なネストされたJOINクエリをシンプルな個別クエリに変更
- `getPostFeedback()` と `getPostFeedbackById()` で、まずフィードバックを取得し、その後ユーザー情報を個別に取得するように変更

### 2. マイグレーションファイルの修正 (`supabase/migrations/20251209000001_create_post_feedback_table.sql`)

**問題**: 既存のポリシーと競合する可能性があった

**修正**:
- テーブルのRLSポリシーを作成する前に、既存のポリシーを削除
- ストレージポリシーも同様に既存のポリシーを削除してから作成
- ポリシー名をより具体的に変更（例: "Users can upload their own feedback videos"）

## マイグレーションの再実行方法

1. Supabase Studioにアクセス:
   ```
   https://supabase.com/dashboard/project/nfcvmthefrawdrekhivz/sql
   ```

2. 既存のテーブルとポリシーを削除（必要に応じて）:
   ```sql
   -- テーブルを削除
   DROP TABLE IF EXISTS public.post_feedback CASCADE;

   -- トリガー関数を削除
   DROP FUNCTION IF EXISTS update_post_feedback_updated_at() CASCADE;
   ```

3. 修正したマイグレーションファイルの内容全体をコピー:
   `supabase/migrations/20251209000001_create_post_feedback_table.sql`

4. SQL Editorにペーストして「Run」をクリック

## 動作確認

マイグレーション実行後、以下を確認してください:

1. `/dashboard/post-feedback` にアクセス
2. 「新規フィードバック依頼」ボタンをクリック
3. フォームが正しく表示されることを確認
4. テストデータを入力して送信
5. 一覧ページでフィードバックが表示されることを確認

## トラブルシューティング

### エラー: "relation already exists"

既存のテーブルを削除してから再実行してください:

```sql
DROP TABLE IF EXISTS public.post_feedback CASCADE;
DROP FUNCTION IF EXISTS update_post_feedback_updated_at() CASCADE;
```

### エラー: RLSポリシー関連

既存のポリシーを削除してから再実行してください:

```sql
DROP POLICY IF EXISTS "Users can create their own post feedback" ON public.post_feedback;
DROP POLICY IF EXISTS "Users can view their own post feedback" ON public.post_feedback;
DROP POLICY IF EXISTS "Users can update their own post feedback" ON public.post_feedback;
DROP POLICY IF EXISTS "Admins can update feedback" ON public.post_feedback;
DROP POLICY IF EXISTS "Users can delete their own post feedback" ON public.post_feedback;
```

## 変更されたファイル

1. `lib/actions/post-feedback.ts` - クエリ処理の修正
2. `supabase/migrations/20251209000001_create_post_feedback_table.sql` - ポリシー削除処理の追加
