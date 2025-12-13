-- チャット機能のテーブル作成
-- 作成日: 2025-12-13
-- 説明: ユーザーと運営者が1対1でチャットできる機能

-- =============================================
-- 1. chat_rooms テーブル
-- =============================================
-- ユーザーごとに1つのチャットルームを作成
-- 運営者とユーザーが1対1で会話

CREATE TABLE IF NOT EXISTS chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status varchar(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'closed')),
  last_message_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- 1ユーザー1チャットルームの制約
  CONSTRAINT unique_user_chat_room UNIQUE (user_id)
);

-- インデックス作成
CREATE INDEX idx_chat_rooms_user_id ON chat_rooms(user_id);
CREATE INDEX idx_chat_rooms_status ON chat_rooms(status);
CREATE INDEX idx_chat_rooms_last_message ON chat_rooms(last_message_at DESC NULLS LAST);

-- コメント
COMMENT ON TABLE chat_rooms IS 'ユーザーと運営者の1対1チャットルーム';
COMMENT ON COLUMN chat_rooms.status IS 'チャットのステータス: open(対応中), resolved(解決済), closed(クローズ済)';
COMMENT ON COLUMN chat_rooms.last_message_at IS '最終メッセージ送信日時（ソート用）';

-- =============================================
-- 2. chat_messages テーブル
-- =============================================
-- チャットルーム内のメッセージを保存

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id uuid NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message text NOT NULL CHECK (char_length(message) > 0 AND char_length(message) <= 2000),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_chat_messages_room_created ON chat_messages(chat_room_id, created_at DESC);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_unread ON chat_messages(chat_room_id, is_read) WHERE is_read = false;

-- コメント
COMMENT ON TABLE chat_messages IS 'チャットメッセージ';
COMMENT ON COLUMN chat_messages.message IS 'メッセージ本文（最大2000文字）';
COMMENT ON COLUMN chat_messages.is_read IS '既読フラグ';

-- =============================================
-- 3. 自動更新トリガー
-- =============================================
-- updated_at を自動更新する関数

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- chat_rooms の updated_at 自動更新トリガー
CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- chat_messages の updated_at 自動更新トリガー
CREATE TRIGGER update_chat_messages_updated_at
  BEFORE UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 4. last_message_at 自動更新トリガー
-- =============================================
-- メッセージが送信されたら chat_rooms.last_message_at を更新

CREATE OR REPLACE FUNCTION update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms
  SET last_message_at = NEW.created_at
  WHERE id = NEW.chat_room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_last_message_on_insert
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_room_last_message();

-- =============================================
-- 5. Row Level Security (RLS) ポリシー
-- =============================================

-- RLS有効化
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- ========== chat_rooms のRLSポリシー ==========

-- ユーザーは自分のチャットルームのみ閲覧可能
CREATE POLICY "Users can view own chat room"
  ON chat_rooms
  FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分のチャットルームのみ作成可能
CREATE POLICY "Users can create own chat room"
  ON chat_rooms
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 運営者（admin/super_admin）は全てのチャットルームを閲覧可能
CREATE POLICY "Admins can view all chat rooms"
  ON chat_rooms
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 運営者は全てのチャットルームを更新可能（ステータス変更など）
CREATE POLICY "Admins can update all chat rooms"
  ON chat_rooms
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- ========== chat_messages のRLSポリシー ==========

-- ユーザーは自分のチャットルームのメッセージのみ閲覧可能
CREATE POLICY "Users can view own room messages"
  ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = chat_messages.chat_room_id
      AND user_id = auth.uid()
    )
  );

-- ユーザーは自分のチャットルームにメッセージを送信可能
CREATE POLICY "Users can send messages to own room"
  ON chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = chat_room_id
      AND user_id = auth.uid()
    )
    AND sender_id = auth.uid()
  );

-- 運営者は全てのメッセージを閲覧可能
CREATE POLICY "Admins can view all messages"
  ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- 運営者は全てのチャットルームにメッセージを送信可能
CREATE POLICY "Admins can send messages to all rooms"
  ON chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
    AND sender_id = auth.uid()
  );

-- 運営者はメッセージを既読に更新可能
CREATE POLICY "Admins can update messages"
  ON chat_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
    )
  );

-- ユーザーは自分のチャットルームのメッセージを既読に更新可能
CREATE POLICY "Users can update own room messages"
  ON chat_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE id = chat_messages.chat_room_id
      AND user_id = auth.uid()
    )
  );

-- =============================================
-- 6. Realtime設定
-- =============================================
-- chat_messages テーブルでRealtimeを有効化

ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;

-- =============================================
-- 完了
-- =============================================
-- マイグレーション完了
