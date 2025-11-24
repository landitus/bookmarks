export type ItemType = "video" | "article" | "thread" | "image";
export type ItemStatus = "inbox" | "queue" | "library" | "archive";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Item {
  id: string;
  user_id: string;
  url: string;
  title: string;
  description: string | null;
  image_url: string | null;
  type: ItemType;
  status: ItemStatus;
  metadata: Record<string, any> | null;
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
