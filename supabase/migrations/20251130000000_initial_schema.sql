-- ============================================================================
-- PORTABLE - Initial Schema Migration
-- Created: November 30, 2025
-- Description: Complete database schema for Portable bookmarking app
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE item_type AS ENUM ('video', 'article', 'thread', 'image');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  theme text DEFAULT 'system',
  api_key text DEFAULT gen_random_uuid()::text,
  updated_at timestamptz
);

-- Items (bookmarks)
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url text NOT NULL,
  title text,
  description text,
  image_url text,
  type item_type NOT NULL DEFAULT 'article',
  metadata jsonb,
  is_later boolean NOT NULL DEFAULT false,
  is_favorite boolean NOT NULL DEFAULT false,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Topics (tags)
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Item-Topics junction table
CREATE TABLE IF NOT EXISTS item_topics (
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, topic_id)
);

-- Projects (collections)
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Project-Items junction table
CREATE TABLE IF NOT EXISTS project_items (
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, item_id)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS items_user_id_idx ON items(user_id);
CREATE INDEX IF NOT EXISTS items_created_at_idx ON items(created_at DESC);
CREATE INDEX IF NOT EXISTS topics_user_id_idx ON topics(user_id);
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_api_key_unique ON profiles(api_key);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_items ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Items policies
CREATE POLICY "Users can view own items." ON items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own items." ON items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own items." ON items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own items." ON items
  FOR DELETE USING (auth.uid() = user_id);

-- Topics policies
CREATE POLICY "Users can view own topics." ON topics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own topics." ON topics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own topics." ON topics
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own topics." ON topics
  FOR DELETE USING (auth.uid() = user_id);

-- Item_topics policies
CREATE POLICY "Users can view own item_topics." ON item_topics
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM items WHERE items.id = item_topics.item_id AND items.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own item_topics." ON item_topics
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM items WHERE items.id = item_topics.item_id AND items.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own item_topics." ON item_topics
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM items WHERE items.id = item_topics.item_id AND items.user_id = auth.uid())
  );

-- Projects policies
CREATE POLICY "Users can view own projects." ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects." ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects." ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects." ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Project_items policies
CREATE POLICY "Users can view own project_items." ON project_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_items.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own project_items." ON project_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_items.project_id AND projects.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own project_items." ON project_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM projects WHERE projects.id = project_items.project_id AND projects.user_id = auth.uid())
  );

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- REALTIME
-- ============================================================================

-- Enable realtime for items (for live updates from extension)
ALTER PUBLICATION supabase_realtime ADD TABLE items;

-- Set replica identity for better realtime with RLS
ALTER TABLE items REPLICA IDENTITY FULL;
