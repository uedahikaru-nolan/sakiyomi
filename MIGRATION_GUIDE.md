# マイグレーション実行手順

## エラーの原因
`course-videos` Storageバケットが存在しないため、動画アップロードに失敗しています。

## 解決方法

以下のいずれかの方法でマイグレーションを実行してください。

### 方法1: Supabase Studio（推奨）

1. Supabase Dashboardにアクセス: https://supabase.com/dashboard
2. プロジェクトを選択
3. 左メニューから「SQL Editor」を選択
4. 以下の2つのマイグレーションを順番に実行：

#### ステップ1: コーステーブル作成
`supabase/migrations/20251215000001_create_course_tables.sql` の内容をコピーして実行

#### ステップ2: course-videosバケット作成
`supabase/migrations/20251215000002_create_course_videos_bucket.sql` の内容をコピーして実行

### 方法2: Supabase CLI

```bash
# Supabaseにログイン（まだの場合）
npx supabase login

# プロジェクトにリンク
npx supabase link --project-ref YOUR_PROJECT_REF

# マイグレーションを実行
npx supabase db push
```

### 方法3: 手動SQL実行

Supabase Studio > SQL Editorで以下のSQLを実行：

```sql
-- course-videosバケット作成
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-videos',
  'course-videos',
  true,
  524288000, -- 500MB
  ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska']
)
ON CONFLICT (id) DO NOTHING;

-- ポリシー作成
CREATE POLICY "Admins can upload course videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'course-videos' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can update course videos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'course-videos' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Admins can delete course videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'course-videos' AND
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

CREATE POLICY "Public can view course videos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-videos');
```

## 確認方法

マイグレーション実行後、以下で確認：

1. Supabase Dashboard > Storage
2. `course-videos` バケットが存在することを確認
3. コース作成ページで動画アップロードを試す

## トラブルシューティング

### エラー: "Bucket already exists"
→ 問題ありません。バケットは既に作成されています。

### エラー: "Policy already exists"
→ 問題ありません。ポリシーは既に作成されています。

### それでも動画アップロードできない場合
1. ブラウザのコンソールでエラー詳細を確認
2. Supabase Dashboard > Storage > Policies でポリシーが正しく設定されているか確認
3. ユーザーのroleが `admin` または `super_admin` であることを確認
