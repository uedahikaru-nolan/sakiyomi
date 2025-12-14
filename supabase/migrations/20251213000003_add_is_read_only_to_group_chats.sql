-- グループチャットに読み取り専用フラグを追加
ALTER TABLE group_chats ADD COLUMN IF NOT EXISTS is_read_only boolean DEFAULT false;

-- コメント追加
COMMENT ON COLUMN group_chats.is_read_only IS '読み取り専用フラグ（trueの場合、管理者のみメッセージ送信可能）';
