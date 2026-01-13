# Supabase Migrations

## マイグレーションの適用方法

### 方法1: Supabase Studio（SQL Editor）を使用（推奨）

1. Supabase Studioにアクセス
   ```
   https://supabase.com/dashboard/project/nfcvmthefrawdrekhivz/sql
   ```

2. 左サイドバーから「SQL Editor」を選択

3. 「New Query」をクリック

4. マイグレーションファイル（`20251215000001_create_course_tables.sql`）の内容全体をコピー

5. SQL Editorにペーストして「Run」をクリック

6. 成功メッセージを確認

### 方法2: Supabase CLIを使用

```bash
# Supabase CLIのインストール（まだの場合）
npm install -g supabase

# プロジェクトにログイン
supabase login

# マイグレーションの適用
supabase db push
```

### 方法3: psqlコマンドを使用

```bash
# PostgreSQL接続文字列を使用
psql "postgresql://postgres:[YOUR-PASSWORD]@db.nfcvmthefrawdrekhivz.supabase.co:5432/postgres" < supabase/migrations/20251215000001_create_course_tables.sql
```

## 適用済みマイグレーション

- [x] `20251213000001_create_chat_tables.sql` - チャット機能のテーブル
- [x] `20251213000002_create_group_chat_tables.sql` - グループチャット機能
- [x] `20251213000003_add_is_read_only_to_group_chats.sql` - グループチャット読み取り専用フラグ
- [x] `20251213000004_create_avatars_bucket.sql` - アバター画像バケット
- [x] `20251213000005_add_icon_url_to_group_chats.sql` - グループチャットアイコンURL
- [x] `20251213000006_create_group_icons_bucket.sql` - グループアイコンバケット
- [x] `20250115000000_create_knowledge_base.sql` - ナレッジベース
- [ ] `20251215000001_create_course_tables.sql` - **コース管理システム（新規）**
- [ ] `20251215000002_create_course_videos_bucket.sql` - **コース動画バケット（新規）**

## 作成されるテーブル

### 20251215000001_create_course_tables.sql

以下のテーブルが作成されます：

1. **categories** - コースのカテゴリ
2. **courses** - 学習コース
3. **chapters** - コース内のチャプター
4. **lessons** - 実際の動画レッスン
5. **user_progress** - ユーザーの学習進捗

### サンプルデータ

マイグレーションには以下のサンプルデータが含まれています：

**カテゴリ（4件）:**
- Instagramマーケティング基礎
- フォロワー獲得戦略
- コンテンツ制作
- 分析と改善

**コース（4件）:**
- Instagram基礎コース（初級）
- フォロワー1万人達成コース（中級）
- バズるコンテンツの作り方（中級）
- データドリブンInstagram運用（上級）

**チャプター＋レッスン:**
- Instagram基礎コースに3章、3レッスンのサンプルデータ

## トラブルシューティング

### エラー: "relation already exists"

テーブルが既に存在する場合、マイグレーションをスキップするか、既存のテーブルを削除してから再度実行してください。

```sql
-- 既存テーブルの削除（注意: データが失われます）
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
```

### テーブルの確認

```sql
-- 作成されたテーブルを確認
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('categories', 'courses', 'chapters', 'lessons', 'user_progress');

-- サンプルデータの確認
SELECT * FROM categories;
SELECT * FROM courses;
```

## RLS (Row Level Security) ポリシー

マイグレーションには以下のRLSポリシーが含まれています：

- **Categories**: 全員が閲覧可能、管理者のみ編集可能
- **Courses**: 公開済みコースは全員閲覧可能、管理者のみ編集可能
- **Chapters/Lessons**: コースと同じポリシー
- **User Progress**: 自分の進捗のみ閲覧・編集可能

## 次のステップ

マイグレーション適用後：

1. `/dashboard/courses` にアクセスしてコース一覧が表示されることを確認
2. カテゴリをクリックしてコース詳細ページが動作することを確認
3. 管理者画面からコース・レッスンの追加が可能なことを確認
