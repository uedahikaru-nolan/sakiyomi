-- グループチャット機能のテーブル作成

-- 1. group_chats テーブル
CREATE TABLE IF NOT EXISTS group_chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(100) NOT NULL,
  description text,
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. group_chat_members テーブル
CREATE TABLE IF NOT EXISTS group_chat_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_chat_id uuid NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  last_read_at timestamptz,
  UNIQUE(group_chat_id, user_id)
);

-- 3. group_chat_messages テーブル
CREATE TABLE IF NOT EXISTS group_chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_chat_id uuid NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL CHECK (char_length(message) > 0 AND char_length(message) <= 2000),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_group_chats_created_by ON group_chats(created_by);
CREATE INDEX IF NOT EXISTS idx_group_chats_last_message_at ON group_chats(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_chat_members_user_id ON group_chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_members_group_id ON group_chat_members(group_chat_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_group_id ON group_chat_messages(group_chat_id);
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_created_at ON group_chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_chat_messages_sender_id ON group_chat_messages(sender_id);

-- updated_at自動更新のトリガー関数（既存の関数を使用）
-- トリガーの作成
CREATE TRIGGER update_group_chats_updated_at
  BEFORE UPDATE ON group_chats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_chat_messages_updated_at
  BEFORE UPDATE ON group_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- last_message_at自動更新のトリガー関数
CREATE OR REPLACE FUNCTION update_group_chat_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE group_chats
  SET last_message_at = NEW.created_at
  WHERE id = NEW.group_chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガーの作成
CREATE TRIGGER update_group_chat_last_message_at_trigger
  AFTER INSERT ON group_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_group_chat_last_message_at();

-- RLS (Row Level Security) の有効化
ALTER TABLE group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_chat_messages ENABLE ROW LEVEL SECURITY;

-- ===== group_chats のRLSポリシー =====

-- 読み取り: メンバーまたは管理者のみ閲覧可能
CREATE POLICY "Users can view groups they are members of"
ON group_chats FOR SELECT
TO authenticated
USING (
  -- 管理者は全て見れる
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
  OR
  -- 自分がメンバーであるグループを見れる
  EXISTS (
    SELECT 1 FROM group_chat_members
    WHERE group_chat_members.group_chat_id = group_chats.id
    AND group_chat_members.user_id = auth.uid()
  )
);

-- 作成: 管理者のみ作成可能
CREATE POLICY "Admins can create groups"
ON group_chats FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- 更新: 管理者のみ更新可能
CREATE POLICY "Admins can update groups"
ON group_chats FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- 削除: 管理者のみ削除可能
CREATE POLICY "Admins can delete groups"
ON group_chats FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- ===== group_chat_members のRLSポリシー =====

-- 読み取り: 自分のレコードまたは管理者なら閲覧可能（無限再帰を避ける）
CREATE POLICY "Users can view group members"
ON group_chat_members FOR SELECT
TO authenticated
USING (
  -- 自分がメンバーとして登録されているレコードを見れる
  user_id = auth.uid()
  OR
  -- または、管理者は全て見れる
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- 作成: 管理者のみメンバー追加可能
CREATE POLICY "Admins can add members"
ON group_chat_members FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- 更新: 自分のlast_read_atのみ更新可能
CREATE POLICY "Users can update their own last_read_at"
ON group_chat_members FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 削除: 管理者のみメンバー削除可能
CREATE POLICY "Admins can remove members"
ON group_chat_members FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- ===== group_chat_messages のRLSポリシー =====

-- 読み取り: グループメンバーのみ閲覧可能
CREATE POLICY "Members can view group messages"
ON group_chat_messages FOR SELECT
TO authenticated
USING (
  group_chat_id IN (
    SELECT group_chat_id FROM group_chat_members
    WHERE user_id = auth.uid()
  )
);

-- 作成: グループメンバーのみ送信可能
CREATE POLICY "Members can send messages"
ON group_chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND group_chat_id IN (
    SELECT group_chat_id FROM group_chat_members
    WHERE user_id = auth.uid()
  )
);

-- 更新: 自分のメッセージのみ更新可能
CREATE POLICY "Users can update their own messages"
ON group_chat_messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

-- 削除: 自分のメッセージまたは管理者が削除可能
CREATE POLICY "Users can delete their own messages or admins can delete any"
ON group_chat_messages FOR DELETE
TO authenticated
USING (
  sender_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'super_admin')
  )
);

-- Realtime publication設定
ALTER PUBLICATION supabase_realtime ADD TABLE group_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE group_chat_members;
ALTER PUBLICATION supabase_realtime ADD TABLE group_chats;

-- コメント追加
COMMENT ON TABLE group_chats IS 'グループチャットの基本情報';
COMMENT ON TABLE group_chat_members IS 'グループチャットのメンバー管理';
COMMENT ON TABLE group_chat_messages IS 'グループチャットのメッセージ';
