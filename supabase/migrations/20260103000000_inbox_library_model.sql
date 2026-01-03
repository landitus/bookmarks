-- ============================================================================
-- PORTABLE - Inbox/Library/Archive Model Migration
-- Created: January 3, 2026
-- Description: Add triage columns for Inbox/Library/Archive workflow
-- ============================================================================

-- Add is_kept column to track if item has been triaged to Library
-- Inbox: is_kept = false AND is_archived = false
-- Library: is_kept = true AND is_archived = false  
-- Archive: is_archived = true
ALTER TABLE items ADD COLUMN IF NOT EXISTS is_kept BOOLEAN NOT NULL DEFAULT false;

-- Add kept_at timestamp for sorting Library by "when kept"
-- This is set when an item is moved from Inbox to Library
ALTER TABLE items ADD COLUMN IF NOT EXISTS kept_at TIMESTAMPTZ;

-- Add archived_at timestamp for sorting Archive by "when archived"
-- This is set when an item is moved to Archive
ALTER TABLE items ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

-- Create index for efficient bucket queries
CREATE INDEX IF NOT EXISTS items_triage_state_idx ON items(is_kept, is_archived);

-- Create indexes for sorting within buckets
CREATE INDEX IF NOT EXISTS items_kept_at_idx ON items(kept_at DESC) WHERE is_kept = true AND is_archived = false;
CREATE INDEX IF NOT EXISTS items_archived_at_idx ON items(archived_at DESC) WHERE is_archived = true;

-- Migrate existing data:
-- - Items marked as favorites should be kept (they were intentionally saved)
-- - Items marked as later should be kept (user wanted to consume them)
-- - Set kept_at to created_at for migrated items (preserve relative order)
-- This ensures existing users don't lose their curated content
UPDATE items 
SET is_kept = true, kept_at = created_at
WHERE is_favorite = true OR is_later = true;

-- Set archived_at for already archived items
UPDATE items
SET archived_at = updated_at
WHERE is_archived = true;

-- Note: is_later column is deprecated but kept for now for backwards compatibility
-- It will be removed in a future migration after the UI is updated
-- COMMENT ON COLUMN items.is_later IS 'DEPRECATED: Use is_kept instead. Will be removed in future migration.';

