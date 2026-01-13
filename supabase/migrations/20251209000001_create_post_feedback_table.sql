-- Create post_feedback table
CREATE TABLE IF NOT EXISTS public.post_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 添削依頼情報
  pre_post_video_url TEXT, -- 投稿前の動画URL (Supabase Storage)
  post_url TEXT, -- 投稿後のURL

  -- 投稿の狙い
  target_audience TEXT NOT NULL, -- ターゲット
  target_benefit TEXT NOT NULL, -- ターゲットが得られること
  reference_post_url TEXT, -- 参考にした投稿のURL

  -- 工夫した点
  first_3_seconds TEXT, -- 冒頭3秒
  structure_content TEXT, -- 構成・内容
  shooting_editing TEXT, -- 撮影・編集

  -- インサイト
  video_duration_seconds INTEGER, -- 動画の尺(秒数)
  view_count INTEGER, -- 閲覧数（再生数）
  reach_count INTEGER, -- リーチしたアカウント
  average_watch_time_seconds INTEGER, -- 平均再生時間(秒数)
  three_second_retention_rate DECIMAL(5,2), -- 最初の3秒以上の再生率
  save_count INTEGER, -- 保存数
  comment_count INTEGER, -- コメント数
  like_count INTEGER, -- いいね！の数
  share_count INTEGER, -- シェア数
  follow_count INTEGER, -- フォロー数

  -- 仮説
  good_points TEXT, -- よかった点（仮説）
  bad_points TEXT, -- 悪かった点（仮説）
  next_verification TEXT, -- 次回に向けて検証したいこと

  -- フィードバック
  instructor_feedback TEXT, -- 講師からのフィードバック
  feedback_status TEXT DEFAULT 'pending' CHECK (feedback_status IN ('pending', 'in_review', 'completed')),

  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_post_feedback_user_id ON public.post_feedback(user_id);
CREATE INDEX idx_post_feedback_status ON public.post_feedback(feedback_status);
CREATE INDEX idx_post_feedback_created_at ON public.post_feedback(created_at DESC);

-- RLS (Row Level Security) 有効化
ALTER TABLE public.post_feedback ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（エラー回避）
DROP POLICY IF EXISTS "Users can create their own post feedback" ON public.post_feedback;
DROP POLICY IF EXISTS "Users can view their own post feedback" ON public.post_feedback;
DROP POLICY IF EXISTS "Users can update their own post feedback" ON public.post_feedback;
DROP POLICY IF EXISTS "Admins can update feedback" ON public.post_feedback;
DROP POLICY IF EXISTS "Users can delete their own post feedback" ON public.post_feedback;

-- ユーザーは自分の投稿フィードバックのみ作成可能
CREATE POLICY "Users can create their own post feedback"
  ON public.post_feedback
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の投稿フィードバックのみ閲覧可能（管理者は全て閲覧可能）
CREATE POLICY "Users can view their own post feedback"
  ON public.post_feedback
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- ユーザーは自分の投稿フィードバックのみ更新可能
CREATE POLICY "Users can update their own post feedback"
  ON public.post_feedback
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 管理者のみフィードバックを更新可能
CREATE POLICY "Admins can update feedback"
  ON public.post_feedback
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'super_admin')
    )
  );

-- ユーザーは自分の投稿フィードバックのみ削除可能
CREATE POLICY "Users can delete their own post feedback"
  ON public.post_feedback
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 更新日時を自動更新するトリガー
CREATE OR REPLACE FUNCTION update_post_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER post_feedback_updated_at
  BEFORE UPDATE ON public.post_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_post_feedback_updated_at();

-- ストレージバケットの作成（投稿前動画用）
-- publicをtrueに設定して、認証不要でアクセス可能にする
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-feedback-videos', 'post-feedback-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 既存のポリシーを削除（エラー回避）
DROP POLICY IF EXISTS "Users can upload their own feedback videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own feedback videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own feedback videos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view feedback videos" ON storage.objects;

-- ストレージポリシー: ユーザーは自分のフォルダにのみアップロード可能
CREATE POLICY "Users can upload their own feedback videos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'post-feedback-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ストレージポリシー: publicバケットなので全員が閲覧可能
CREATE POLICY "Public can view feedback videos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'post-feedback-videos');

-- ストレージポリシー: ユーザーは自分のファイルのみ削除可能
CREATE POLICY "Users can delete their own feedback videos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'post-feedback-videos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
