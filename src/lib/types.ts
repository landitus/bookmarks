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
  is_later: boolean; // "Later" filter - items to watch/read later
  is_favorite: boolean; // "Favorites" filter - starred/favorite items
  is_archived: boolean; // Archive state - hidden from Everything view
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
