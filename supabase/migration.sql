-- HomeFeed Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- ============================================================
-- ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('buyer', 'agent', 'investor', 'admin');
CREATE TYPE property_type AS ENUM ('single_family', 'condo', 'townhouse', 'multi_family');
CREATE TYPE property_status AS ENUM ('active', 'pending', 'sold');
CREATE TYPE follow_target AS ENUM ('agent', 'neighborhood');

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'buyer',
  vibe_profile JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- AGENTS
-- ============================================================
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  brokerage TEXT NOT NULL,
  years_exp INTEGER DEFAULT 0,
  license_number TEXT NOT NULL,
  homes_sold_ytd INTEGER DEFAULT 0,
  avg_days_to_close INTEGER DEFAULT 0,
  avg_sale_vs_list NUMERIC(5,2) DEFAULT 100,
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  specialties TEXT[] DEFAULT '{}',
  neighborhoods TEXT[] DEFAULT '{}',
  bio TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Agents are viewable by everyone" ON agents FOR SELECT USING (true);
CREATE POLICY "Agents can update own profile" ON agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage agents" ON agents FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- NEIGHBORHOODS
-- ============================================================
CREATE TABLE neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  median_price INTEGER DEFAULT 0,
  price_change_yoy TEXT DEFAULT '+0%',
  avg_days_on_market INTEGER DEFAULT 0,
  active_listings INTEGER DEFAULT 0,
  resident_count INTEGER DEFAULT 0,
  vibe_scores JSONB DEFAULT '{}',
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE neighborhoods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Neighborhoods are viewable by everyone" ON neighborhoods FOR SELECT USING (true);
CREATE POLICY "Admins can manage neighborhoods" ON neighborhoods FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- PROPERTIES
-- ============================================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  price INTEGER NOT NULL,
  beds INTEGER NOT NULL,
  baths NUMERIC(3,1) NOT NULL,
  sqft INTEGER NOT NULL,
  lot_size NUMERIC(6,2) DEFAULT 0,
  year_built INTEGER NOT NULL,
  property_type property_type DEFAULT 'single_family',
  status property_status DEFAULT 'active',
  images TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  agent_id UUID REFERENCES agents(id),
  neighborhood_id UUID REFERENCES neighborhoods(id),
  match_score INTEGER DEFAULT 50,
  days_on_market INTEGER DEFAULT 0,
  list_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Properties are viewable by everyone" ON properties FOR SELECT USING (true);
CREATE POLICY "Agents can manage their listings" ON properties FOR ALL USING (
  agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage all properties" ON properties FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- LIKES
-- ============================================================
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, property_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Likes are viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can like" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON likes FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- SAVES
-- ============================================================
CREATE TABLE saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, property_id)
);

ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Saves are viewable by owner" ON saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can save" ON saves FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unsave" ON saves FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- COMMENTS
-- ============================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) <= 2000),
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  like_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can comment" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- BOARDS
-- ============================================================
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public boards are viewable" ON boards FOR SELECT USING (is_public OR auth.uid() = user_id);
CREATE POLICY "Users can manage own boards" ON boards FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- BOARD PROPERTIES (junction table)
-- ============================================================
CREATE TABLE board_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(board_id, property_id)
);

ALTER TABLE board_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Board properties follow board visibility" ON board_properties FOR SELECT USING (
  board_id IN (SELECT id FROM boards WHERE is_public OR user_id = auth.uid())
);
CREATE POLICY "Board owners can manage items" ON board_properties FOR ALL USING (
  board_id IN (SELECT id FROM boards WHERE user_id = auth.uid())
);

-- ============================================================
-- FOLLOWS (agents + neighborhoods)
-- ============================================================
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  target_type follow_target NOT NULL,
  target_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, target_type, target_id)
);

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can follow" ON follows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unfollow" ON follows FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- REVIEWS (neighborhood reviews)
-- ============================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood_id UUID NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  years_lived INTEGER DEFAULT 0,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  text TEXT NOT NULL CHECK (char_length(text) <= 5000),
  helpful INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can edit own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- MESSAGES
-- ============================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) <= 5000),
  property_id UUID REFERENCES properties(id),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see own messages" ON messages FOR SELECT USING (
  auth.uid() = sender_id OR auth.uid() = receiver_id
);
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Receivers can mark read" ON messages FOR UPDATE USING (auth.uid() = receiver_id);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood_id);
CREATE INDEX idx_properties_agent ON properties(agent_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);
CREATE INDEX idx_likes_property ON likes(property_id);
CREATE INDEX idx_likes_user ON likes(user_id);
CREATE INDEX idx_saves_user ON saves(user_id);
CREATE INDEX idx_comments_property ON comments(property_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_boards_user ON boards(user_id);
CREATE INDEX idx_follows_user ON follows(user_id);
CREATE INDEX idx_follows_target ON follows(target_type, target_id);
CREATE INDEX idx_reviews_neighborhood ON reviews(neighborhood_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION get_property_stats(p_id UUID)
RETURNS TABLE(like_count BIGINT, comment_count BIGINT, save_count BIGINT) AS $$
  SELECT
    (SELECT COUNT(*) FROM likes WHERE property_id = p_id),
    (SELECT COUNT(*) FROM comments WHERE property_id = p_id),
    (SELECT COUNT(*) FROM saves WHERE property_id = p_id);
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_follower_count(t_type follow_target, t_id UUID)
RETURNS BIGINT AS $$
  SELECT COUNT(*) FROM follows WHERE target_type = t_type AND target_id = t_id;
$$ LANGUAGE sql STABLE;

-- ============================================================
-- REALTIME (enable for live updates)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE likes;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE saves;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ============================================================
-- STORAGE BUCKET (for property images)
-- ============================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true);

CREATE POLICY "Anyone can view property images" ON storage.objects
  FOR SELECT USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'property-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own uploads" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]
  );
