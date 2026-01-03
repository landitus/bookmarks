export type ItemType = "video" | "article" | "thread" | "image" | "product" | "website";

export type Theme = "light" | "dark" | "system";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  theme: Theme | null;
  api_key: string | null;
}

export interface Item {
  id: string;
  user_id: string;
  url: string;
  title: string;
  description: string | null;
  image_url: string | null;
  type: ItemType;
  is_kept: boolean; // Triage state: false = Inbox, true = Library
  is_favorite: boolean; // Star items within Library
  is_archived: boolean; // Soft delete - moves to Archive
  kept_at: string | null; // When item was moved to Library (for sorting)
  archived_at: string | null; // When item was moved to Archive (for sorting)
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Content extraction fields
  content: string | null; // Extracted article content (markdown)
  word_count: number | null; // Word count of content
  reading_time: number | null; // Estimated reading time in minutes
  author: string | null; // Article author
  publish_date: string | null; // Original publish date
  // AI-generated fields
  ai_summary: string | null; // AI-generated summary
  ai_content_type: string | null; // AI-detected content type
  // Processing status
  processing_status: "pending" | "processing" | "completed" | "failed" | null;
}

export interface Topic {
  id: string;
  user_id: string;
  name: string;
  slug: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
}
