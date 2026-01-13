-- Discord用のプロンプト設定テーブルを作成
-- 作成日: 2025-12-22
-- 説明: Discord返信AI用のシステムプロンプトと知識を保存

CREATE TABLE IF NOT EXISTS discord_prompt_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_prompt TEXT NOT NULL,
  tone_description TEXT,
  additional_knowledge TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_discord_prompt_settings_is_active ON discord_prompt_settings(is_active) WHERE is_active = true;

-- コメント追加
COMMENT ON TABLE discord_prompt_settings IS 'Discord返信AI用のプロンプト設定';
COMMENT ON COLUMN discord_prompt_settings.system_prompt IS 'AIの基本的な振る舞いを定義するシステムプロンプト';
COMMENT ON COLUMN discord_prompt_settings.tone_description IS '話し方・トーンの説明（例：親切で丁寧、フランクでカジュアルなど）';
COMMENT ON COLUMN discord_prompt_settings.additional_knowledge IS '追加の知識・コンテキスト情報';
COMMENT ON COLUMN discord_prompt_settings.is_active IS '有効/無効フラグ（有効なのは1つのみ）';

-- updated_at自動更新トリガー
CREATE TRIGGER update_discord_prompt_settings_updated_at
  BEFORE UPDATE ON discord_prompt_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS有効化
ALTER TABLE discord_prompt_settings ENABLE ROW LEVEL SECURITY;

-- 全員が閲覧可能
CREATE POLICY "Anyone can view active prompt settings"
  ON discord_prompt_settings
  FOR SELECT
  USING (is_active = true);

-- 管理者のみ作成・更新・削除可能
CREATE POLICY "Admins can manage prompt settings"
  ON discord_prompt_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- デフォルトのプロンプト設定を挿入
INSERT INTO discord_prompt_settings (
  system_prompt,
  tone_description,
  additional_knowledge,
  is_active
) VALUES (
  'あなたはSAKIYOMIスクールのDiscordサーバーの管理者です。Instagramマーケティングやソーシャルメディア運用の専門知識を持っています。',
  '親切で丁寧、かつフレンドリーな口調で対応します。絵文字を適度に使用して親しみやすい雰囲気を出します。',
  'SAKIYOMIスクールは、Instagram運用を学べるオンラインスクールです。フォロワー獲得、エンゲージメント向上、収益化などを支援しています。',
  true
) ON CONFLICT DO NOTHING;
