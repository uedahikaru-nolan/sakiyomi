-- Add separate feedback fields to post_feedback table
ALTER TABLE post_feedback
ADD COLUMN IF NOT EXISTS feedback_good TEXT,
ADD COLUMN IF NOT EXISTS feedback_more TEXT,
ADD COLUMN IF NOT EXISTS feedback_next_points TEXT,
ADD COLUMN IF NOT EXISTS feedback_insights TEXT;

-- Remove the old single feedback field (keep for backward compatibility, will be deprecated)
-- We'll keep instructor_feedback for now but use the new fields going forward
