-- Discord管理者フラグの追加
-- 作成日: 2025-12-22
-- 説明: discord_usersテーブルに管理者フラグを追加

-- is_adminカラムを追加
ALTER TABLE discord_users
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- インデックスを作成（管理者検索の高速化）
CREATE INDEX IF NOT EXISTS idx_discord_users_is_admin ON discord_users(is_admin) WHERE is_admin = true;

-- コメント追加
COMMENT ON COLUMN discord_users.is_admin IS 'Discord管理者フラグ（trueの場合、赤色で表示）';

-- RLSポリシーの更新（管理者のみis_adminを更新可能）
-- まず既存のポリシーを確認してから、必要に応じて追加
