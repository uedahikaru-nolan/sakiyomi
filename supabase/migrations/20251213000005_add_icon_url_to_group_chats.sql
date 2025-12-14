-- Add icon_url column to group_chats table
ALTER TABLE group_chats ADD COLUMN IF NOT EXISTS icon_url text;

COMMENT ON COLUMN group_chats.icon_url IS 'グループチャットのアイコン画像URL';
