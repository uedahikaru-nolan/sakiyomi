# 投稿フィードバック動画 - ストレージ修正手順

## 問題
動画がアップロードされているが、表示されない。
原因: ストレージバケットが `public: false` で作成されているため、認証なしでアクセスできない。

## 解決方法

### 方法1: Supabase Studioで手動修正（推奨・最速）

1. **Supabase Studioにアクセス**
   ```
   https://supabase.com/dashboard/project/nfcvmthefrawdrekhivz/storage/buckets
   ```

2. **バケット設定を変更**
   - `post-feedback-videos` バケットを見つける
   - 右側の「⋮」メニューをクリック
   - 「Edit bucket」を選択
   - 「Public bucket」を **ON** に変更
   - 「Save」をクリック

3. **ポリシーを更新**
   - 左メニューから「Policies」を選択
   - `post-feedback-videos` バケットのポリシーを確認
   - 古いポリシーがあれば削除
   - 以下のSQLを実行:

   ```sql
   -- 古いポリシーを削除
   DROP POLICY IF EXISTS "Users can view their own feedback videos" ON storage.objects;
   DROP POLICY IF EXISTS "Public can view feedback videos" ON storage.objects;

   -- 新しいポリシーを作成
   CREATE POLICY "Public can view feedback videos"
     ON storage.objects
     FOR SELECT
     USING (bucket_id = 'post-feedback-videos');
   ```

### 方法2: マイグレーションファイルで修正

1. **Supabase Studio SQL Editorにアクセス**
   ```
   https://supabase.com/dashboard/project/nfcvmthefrawdrekhivz/sql
   ```

2. **以下のSQLを実行**

```sql
-- バケットをpublicに変更
UPDATE storage.buckets
SET public = true
WHERE id = 'post-feedback-videos';

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Users can view their own feedback videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view feedback videos" ON storage.objects;

-- 新しいポリシーを作成（全員が閲覧可能）
CREATE POLICY "Public can view feedback videos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post-feedback-videos');
```

## 動作確認

1. 新しい動画をアップロード
2. フィードバック詳細ページにアクセス
3. 動画プレーヤーが表示され、再生できることを確認

## 既存の動画について

既にアップロードされた動画も、バケットをpublicにすることで自動的にアクセス可能になります。
再アップロードは不要です。

## トラブルシューティング

### 動画が表示されない場合

1. **ブラウザのコンソールを確認**
   - F12キーを押して開発者ツールを開く
   - Consoleタブで動画URLのエラーを確認

2. **動画URLを直接開く**
   - 詳細ページのHTMLソースを確認
   - `<video>`タグの`src`属性のURLをコピー
   - 新しいタブで直接開いてアクセスできるか確認

3. **バケットの設定を確認**
   ```sql
   SELECT id, name, public FROM storage.buckets WHERE id = 'post-feedback-videos';
   ```
   - `public`カラムが`true`になっているか確認

4. **ポリシーを確認**
   - Supabase Studio → Storage → Policies
   - `post-feedback-videos`バケットに正しいポリシーがあるか確認

### エラー: "403 Forbidden"

バケットがまだprivateか、ポリシーが正しく設定されていません。
上記の手順を再度実行してください。

### エラー: "404 Not Found"

動画ファイルが実際にアップロードされていない可能性があります。
- Supabase Studio → Storage → Buckets → post-feedback-videos
- ファイルが存在するか確認

## セキュリティについて

バケットをpublicにすることで、URLを知っていれば誰でも動画を閲覧できます。
ただし:
- URLは推測が困難（ユーザーID + タイムスタンプ）
- アップロードは認証済みユーザーのみ可能
- 削除は自分のファイルのみ可能

より高いセキュリティが必要な場合は、signed URLを使用する方法もありますが、
URLの有効期限管理が必要になります。
