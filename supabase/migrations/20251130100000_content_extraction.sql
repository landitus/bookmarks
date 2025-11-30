-- ============================================================================
-- PORTABLE - Content Extraction & AI Features Migration
-- Created: November 30, 2025
-- Description: Add columns for article content, reading metadata, and AI features
-- ============================================================================

-- ============================================================================
-- NEW ENUM VALUES
-- ============================================================================

-- Add new item types for better content classification
ALTER TYPE item_type ADD VALUE IF NOT EXISTS 'product';
ALTER TYPE item_type ADD VALUE IF NOT EXISTS 'website';

-- ============================================================================
-- NEW COLUMNS FOR CONTENT EXTRACTION
-- ============================================================================

-- Extracted article content (markdown format from Jina Reader)
ALTER TABLE items ADD COLUMN IF NOT EXISTS content text;

-- Reading metrics
ALTER TABLE items ADD COLUMN IF NOT EXISTS word_count integer;
ALTER TABLE items ADD COLUMN IF NOT EXISTS reading_time integer; -- in minutes

-- Article metadata
ALTER TABLE items ADD COLUMN IF NOT EXISTS author text;
ALTER TABLE items ADD COLUMN IF NOT EXISTS publish_date timestamptz;

-- ============================================================================
-- NEW COLUMNS FOR AI FEATURES
-- ============================================================================

-- AI-generated summary (2-3 sentences)
ALTER TABLE items ADD COLUMN IF NOT EXISTS ai_summary text;

-- AI-detected content type (more granular than item_type enum)
-- Examples: "longform-article", "news", "tutorial", "product-page", "landing-page"
ALTER TABLE items ADD COLUMN IF NOT EXISTS ai_content_type text;

-- ============================================================================
-- INDEXES FOR NEW COLUMNS
-- ============================================================================

-- Index for filtering by AI content type
CREATE INDEX IF NOT EXISTS items_ai_content_type_idx ON items(ai_content_type);

-- Index for sorting by reading time
CREATE INDEX IF NOT EXISTS items_reading_time_idx ON items(reading_time);

-- Unique constraint on topics for upsert support
CREATE UNIQUE INDEX IF NOT EXISTS topics_user_slug_unique ON topics(user_id, slug);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON COLUMN items.content IS 'Extracted article content in markdown format (via Jina Reader API)';
COMMENT ON COLUMN items.word_count IS 'Word count of extracted content';
COMMENT ON COLUMN items.reading_time IS 'Estimated reading time in minutes (based on 200 wpm)';
COMMENT ON COLUMN items.author IS 'Article author name';
COMMENT ON COLUMN items.publish_date IS 'Original publish date of the article';
COMMENT ON COLUMN items.ai_summary IS 'AI-generated 2-3 sentence summary';
COMMENT ON COLUMN items.ai_content_type IS 'AI-detected content type (e.g., longform-article, tutorial, product-page)';

