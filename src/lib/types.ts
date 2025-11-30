export type ItemType = "video" | "article" | "thread" | "image";

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
