-- Add processing_error column to track why processing failed
-- This column stores error messages when content extraction or AI processing fails
ALTER TABLE items ADD COLUMN IF NOT EXISTS processing_error TEXT;

