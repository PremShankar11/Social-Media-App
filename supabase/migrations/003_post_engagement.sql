-- Post Engagement Tables
-- Run this in the Supabase SQL editor

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(trim(text)) > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Replies table
CREATE TABLE IF NOT EXISTS replies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(trim(text)) > 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Post likes table
CREATE TABLE IF NOT EXISTS post_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (post_id, user_id)
);

-- Comment likes table
CREATE TABLE IF NOT EXISTS comment_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (comment_id, user_id)
);

-- Reply likes table
CREATE TABLE IF NOT EXISTS reply_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID NOT NULL REFERENCES replies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (reply_id, user_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_replies_comment_id ON replies(comment_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_reply_likes_reply_id ON reply_likes(reply_id);

-- RLS Policies
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reply_likes ENABLE ROW LEVEL SECURITY;

-- Comments: anyone authenticated can read; only author can insert/delete
CREATE POLICY "comments_select" ON comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_insert" ON comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "comments_delete" ON comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Replies: anyone authenticated can read; only author can insert/delete
CREATE POLICY "replies_select" ON replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "replies_insert" ON replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "replies_delete" ON replies FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Post likes: anyone authenticated can read; only own likes can be inserted/deleted
CREATE POLICY "post_likes_select" ON post_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "post_likes_insert" ON post_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "post_likes_delete" ON post_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Comment likes: anyone authenticated can read; only own likes can be inserted/deleted
CREATE POLICY "comment_likes_select" ON comment_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "comment_likes_insert" ON comment_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comment_likes_delete" ON comment_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Reply likes: anyone authenticated can read; only own likes can be inserted/deleted
CREATE POLICY "reply_likes_select" ON reply_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "reply_likes_insert" ON reply_likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reply_likes_delete" ON reply_likes FOR DELETE TO authenticated USING (auth.uid() = user_id);
