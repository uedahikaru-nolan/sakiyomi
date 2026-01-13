-- ==========================================
-- コース管理システムのテーブル作成
-- ==========================================

-- 1. カテゴリテーブル
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- カテゴリのインデックス
CREATE UNIQUE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_sort_order ON categories(sort_order);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- カテゴリのコメント
COMMENT ON TABLE categories IS '学習コンテンツのカテゴリ';
COMMENT ON COLUMN categories.slug IS 'URLスラッグ（ユニーク）';
COMMENT ON COLUMN categories.sort_order IS '表示順';

-- ==========================================

-- 2. コーステーブル
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    level VARCHAR(20) NOT NULL DEFAULT 'beginner',
    duration_minutes INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_courses_level CHECK (level IN ('beginner', 'intermediate', 'advanced'))
);

-- コースのインデックス
CREATE UNIQUE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_category_id ON courses(category_id);
CREATE INDEX idx_courses_is_published ON courses(is_published);
CREATE INDEX idx_courses_level ON courses(level);
CREATE INDEX idx_courses_sort_order ON courses(sort_order);

-- コースのコメント
COMMENT ON TABLE courses IS '学習コース';
COMMENT ON COLUMN courses.level IS 'レベル（beginner/intermediate/advanced）';
COMMENT ON COLUMN courses.duration_minutes IS '総再生時間（分）';

-- ==========================================

-- 3. チャプターテーブル
CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- チャプターのインデックス
CREATE INDEX idx_chapters_course_id ON chapters(course_id);
CREATE INDEX idx_chapters_sort_order ON chapters(sort_order);

-- チャプターのコメント
COMMENT ON TABLE chapters IS 'コース内のチャプター';

-- ==========================================

-- 4. レッスンテーブル
CREATE TABLE IF NOT EXISTS lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_provider VARCHAR(20) NOT NULL DEFAULT 'vimeo',
    video_id VARCHAR(100) NOT NULL,
    video_url TEXT,
    thumbnail_url TEXT,
    duration_seconds INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_free BOOLEAN NOT NULL DEFAULT false,
    required_plan_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_lessons_video_provider CHECK (video_provider IN ('vimeo', 'youtube'))
);

-- レッスンのインデックス
CREATE INDEX idx_lessons_chapter_id ON lessons(chapter_id);
CREATE INDEX idx_lessons_sort_order ON lessons(sort_order);
CREATE INDEX idx_lessons_is_free ON lessons(is_free);
CREATE INDEX idx_lessons_video_provider ON lessons(video_provider);

-- レッスンのコメント
COMMENT ON TABLE lessons IS '実際の動画レッスン';
COMMENT ON COLUMN lessons.video_provider IS '動画プロバイダ（vimeo/youtube）';
COMMENT ON COLUMN lessons.is_free IS '無料公開フラグ';

-- ==========================================

-- 5. 学習進捗テーブル
CREATE TABLE IF NOT EXISTS user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'not_started',
    progress_percentage INTEGER NOT NULL DEFAULT 0,
    last_position_seconds INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_user_progress_status CHECK (status IN ('not_started', 'in_progress', 'completed')),
    CONSTRAINT chk_user_progress_percentage CHECK (progress_percentage >= 0 AND progress_percentage <= 100)
);

-- 学習進捗のインデックス
CREATE UNIQUE INDEX idx_user_progress_user_lesson ON user_progress(user_id, lesson_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);

-- 学習進捗のコメント
COMMENT ON TABLE user_progress IS '会員の学習進捗状況';
COMMENT ON COLUMN user_progress.status IS 'ステータス（not_started/in_progress/completed）';
COMMENT ON COLUMN user_progress.progress_percentage IS '進捗率（0-100）';

-- ==========================================

-- 6. updated_atを自動更新するトリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガーを設定
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================

-- 7. Row Level Security (RLS) の有効化
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- カテゴリ: 全員が閲覧可能、管理者のみ編集可能
CREATE POLICY "Categories are viewable by everyone"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Categories are editable by admins only"
    ON categories FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- コース: 全員が公開済みコースを閲覧可能、管理者のみ編集可能
CREATE POLICY "Published courses are viewable by everyone"
    ON courses FOR SELECT
    USING (is_published = true OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
    ));

CREATE POLICY "Courses are editable by admins only"
    ON courses FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- チャプター: コースと同じポリシー
CREATE POLICY "Chapters of published courses are viewable"
    ON chapters FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM courses
        WHERE courses.id = chapters.course_id
        AND (courses.is_published = true OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        ))
    ));

CREATE POLICY "Chapters are editable by admins only"
    ON chapters FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- レッスン: チャプターと同じポリシー
CREATE POLICY "Lessons of published courses are viewable"
    ON lessons FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM chapters
        JOIN courses ON courses.id = chapters.course_id
        WHERE chapters.id = lessons.chapter_id
        AND (courses.is_published = true OR EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        ))
    ));

CREATE POLICY "Lessons are editable by admins only"
    ON lessons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role IN ('admin', 'super_admin')
        )
    );

-- 学習進捗: 自分の進捗のみ閲覧・編集可能
CREATE POLICY "Users can view their own progress"
    ON user_progress FOR SELECT
    USING (auth.uid() = user_id OR EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role IN ('admin', 'super_admin')
    ));

CREATE POLICY "Users can manage their own progress"
    ON user_progress FOR ALL
    USING (auth.uid() = user_id);

-- ==========================================
-- サンプルデータの挿入
-- ==========================================

-- カテゴリの挿入
INSERT INTO categories (name, slug, description, sort_order, is_active) VALUES
('Instagramマーケティング基礎', 'instagram-basics', 'Instagramマーケティングの基本を学びます', 1, true),
('フォロワー獲得戦略', 'follower-growth', 'フォロワーを増やすための実践的な戦略', 2, true),
('コンテンツ制作', 'content-creation', '魅力的なコンテンツの作り方', 3, true),
('分析と改善', 'analytics-improvement', 'データ分析による継続的な改善', 4, true)
ON CONFLICT (slug) DO NOTHING;

-- カテゴリIDを取得してコースを挿入
DO $$
DECLARE
    cat_basics_id UUID;
    cat_growth_id UUID;
    cat_content_id UUID;
    cat_analytics_id UUID;
    course_basics_id UUID;
    chapter1_id UUID;
BEGIN
    -- カテゴリIDの取得
    SELECT id INTO cat_basics_id FROM categories WHERE slug = 'instagram-basics';
    SELECT id INTO cat_growth_id FROM categories WHERE slug = 'follower-growth';
    SELECT id INTO cat_content_id FROM categories WHERE slug = 'content-creation';
    SELECT id INTO cat_analytics_id FROM categories WHERE slug = 'analytics-improvement';

    -- コースの挿入
    INSERT INTO courses (category_id, title, slug, description, level, duration_minutes, sort_order, is_published, published_at)
    VALUES
    (cat_basics_id, 'Instagram基礎コース', 'instagram-fundamentals', 'Instagramマーケティングの基礎を体系的に学ぶコースです', 'beginner', 120, 1, true, CURRENT_TIMESTAMP),
    (cat_growth_id, 'フォロワー1万人達成コース', 'follower-10k', 'フォロワー1万人を達成するための実践的な戦略', 'intermediate', 180, 1, true, CURRENT_TIMESTAMP),
    (cat_content_id, 'バズるコンテンツの作り方', 'viral-content', 'エンゲージメントを高めるコンテンツ制作術', 'intermediate', 150, 1, true, CURRENT_TIMESTAMP),
    (cat_analytics_id, 'データドリブンInstagram運用', 'data-driven-instagram', 'データ分析を活用した運用改善', 'advanced', 200, 1, true, CURRENT_TIMESTAMP)
    ON CONFLICT (slug) DO NOTHING
    RETURNING id INTO course_basics_id;

    -- チャプターの挿入（Instagram基礎コースのみ）
    IF course_basics_id IS NULL THEN
        SELECT id INTO course_basics_id FROM courses WHERE slug = 'instagram-fundamentals';
    END IF;

    INSERT INTO chapters (course_id, title, description, sort_order)
    VALUES
    (course_basics_id, '第1章：Instagramの基本', 'Instagramの基本的な仕組みと特徴を理解します', 1),
    (course_basics_id, '第2章：アカウント設計', '目的に合わせたアカウント設計の方法', 2),
    (course_basics_id, '第3章：プロフィール最適化', '魅力的なプロフィールの作り方', 3)
    RETURNING id INTO chapter1_id;

    -- レッスンの挿入（第1章のみ）
    IF chapter1_id IS NULL THEN
        SELECT id INTO chapter1_id FROM chapters WHERE course_id = course_basics_id AND sort_order = 1;
    END IF;

    INSERT INTO lessons (chapter_id, title, description, video_provider, video_id, duration_seconds, sort_order, is_free)
    VALUES
    (chapter1_id, 'レッスン1：Instagramとは', 'Instagramの基本的な特徴と他のSNSとの違い', 'vimeo', '123456789', 600, 1, true),
    (chapter1_id, 'レッスン2：アルゴリズムの理解', 'Instagramのアルゴリズムの仕組み', 'vimeo', '123456790', 900, 2, true),
    (chapter1_id, 'レッスン3：投稿の種類と特徴', 'フィード、ストーリーズ、リールの違いと使い分け', 'vimeo', '123456791', 720, 3, false)
    ON CONFLICT DO NOTHING;
END $$;
