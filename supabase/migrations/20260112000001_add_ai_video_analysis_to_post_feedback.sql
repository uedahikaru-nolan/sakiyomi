-- Add AI video analysis columns to post_feedback table
ALTER TABLE public.post_feedback
ADD COLUMN IF NOT EXISTS ai_video_analysis JSONB,
ADD COLUMN IF NOT EXISTS ai_video_analyzed_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_post_feedback_ai_analyzed ON public.post_feedback(ai_video_analyzed_at DESC);

-- Comment on columns for documentation
COMMENT ON COLUMN public.post_feedback.ai_video_analysis IS 'AI動画分析の結果をJSON形式で保存';
COMMENT ON COLUMN public.post_feedback.ai_video_analyzed_at IS 'AI動画分析を実行した日時';