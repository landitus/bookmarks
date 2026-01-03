-- ============================================================================
-- PORTABLE - Processing Status Migration
-- Created: November 30, 2025
-- Description: Add processing_status column for background AI processing
-- ============================================================================

-- Processing status for background AI/content extraction
-- null = legacy items (no processing needed)
-- 'pending' = waiting to be processed
-- 'processing' = currently being processed
-- 'completed' = processing finished successfully
-- 'failed' = processing failed
ALTER TABLE items ADD COLUMN IF NOT EXISTS processing_status text;

-- Index for finding items that need processing
CREATE INDEX IF NOT EXISTS items_processing_status_idx ON items(processing_status) 
  WHERE processing_status IN ('pending', 'processing');

COMMENT ON COLUMN items.processing_status IS 'Background processing status: pending, processing, completed, failed';







