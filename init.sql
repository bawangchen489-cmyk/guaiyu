-- Database initialization script for GUAIYU Portfolio
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    codename TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 2. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT DEFAULT '陈衍文',
    image TEXT NOT NULL,
    avatar TEXT,
    likes INTEGER DEFAULT 0,
    views TEXT DEFAULT '0',
    height TEXT DEFAULT 'h-64',
    category TEXT NOT NULL,
    description TEXT,
    project_date DATE DEFAULT CURRENT_DATE,
    client TEXT,
    tools TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 3. USER_LIKES TABLE (关联表 - 使用 TEXT 类型的 user_id 支持匿名用户)
-- ============================================
CREATE TABLE IF NOT EXISTS user_likes (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, project_id)
);

-- ============================================
-- 4. EXPERIENCE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS experience (
    id SERIAL PRIMARY KEY,
    year_range TEXT NOT NULL,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0
);

-- ============================================
-- 4.5 COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL DEFAULT '游客',
    user_avatar TEXT,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. RPC FUNCTIONS FOR ATOMIC OPERATIONS
-- ============================================

-- 点赞数+1
CREATE OR REPLACE FUNCTION increment_likes(project_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    new_likes INTEGER;
BEGIN
    UPDATE projects 
    SET likes = likes + 1 
    WHERE id = project_id
    RETURNING likes INTO new_likes;
    RETURN new_likes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 点赞数-1
CREATE OR REPLACE FUNCTION decrement_likes(project_id INTEGER)
RETURNS INTEGER AS $$
DECLARE
    new_likes INTEGER;
BEGIN
    UPDATE projects 
    SET likes = GREATEST(0, likes - 1) 
    WHERE id = project_id
    RETURNING likes INTO new_likes;
    RETURN new_likes;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 浏览量+1
CREATE OR REPLACE FUNCTION increment_views(project_id INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE projects 
    SET views = (COALESCE(NULLIF(views, '')::INTEGER, 0) + 1)::TEXT 
    WHERE id = project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 先删除可能存在的旧策略，避免冲突
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can be created by anyone" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Projects are viewable by everyone" ON projects;
DROP POLICY IF EXISTS "Projects can be created by anyone" ON projects;
DROP POLICY IF EXISTS "Projects can be updated by anyone" ON projects;
DROP POLICY IF EXISTS "Projects can be deleted by anyone" ON projects;
DROP POLICY IF EXISTS "User likes are viewable by everyone" ON user_likes;
DROP POLICY IF EXISTS "User likes can be created by anyone" ON user_likes;
DROP POLICY IF EXISTS "User likes can be deleted by anyone" ON user_likes;
DROP POLICY IF EXISTS "Experience is viewable by everyone" ON experience;
DROP POLICY IF EXISTS "Experience can be inserted" ON experience;
DROP POLICY IF EXISTS "Experience can be updated" ON experience;
DROP POLICY IF EXISTS "Experience can be deleted" ON experience;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Comments can be created by anyone" ON comments;
DROP POLICY IF EXISTS "Comments can be deleted by anyone" ON comments;

-- Users: 允许所有人读取，允许创建和更新
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can be created by anyone" ON users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (true);

-- Projects: 允许所有人读取、创建、更新、删除
CREATE POLICY "Projects are viewable by everyone" ON projects FOR SELECT USING (true);
CREATE POLICY "Projects can be created by anyone" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Projects can be updated by anyone" ON projects FOR UPDATE USING (true);
CREATE POLICY "Projects can be deleted by anyone" ON projects FOR DELETE USING (true);

-- User Likes: 允许所有操作
CREATE POLICY "User likes are viewable by everyone" ON user_likes FOR SELECT USING (true);
CREATE POLICY "User likes can be created by anyone" ON user_likes FOR INSERT WITH CHECK (true);
CREATE POLICY "User likes can be deleted by anyone" ON user_likes FOR DELETE USING (true);

-- Experience: 允许所有人读取和修改
CREATE POLICY "Experience is viewable by everyone" ON experience FOR SELECT USING (true);
CREATE POLICY "Experience can be inserted" ON experience FOR INSERT WITH CHECK (true);
CREATE POLICY "Experience can be updated" ON experience FOR UPDATE USING (true);
CREATE POLICY "Experience can be deleted" ON experience FOR DELETE USING (true);

-- Comments: 允许所有人读取、创建、删除
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Comments can be created by anyone" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Comments can be deleted by anyone" ON comments FOR DELETE USING (true);

-- ============================================
-- 7. SEED DATA
-- ============================================

-- Experience seed data (使用 DO 块处理重复插入)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM experience WHERE year_range = '2025至今') THEN
        INSERT INTO experience (year_range, role, company, description, sort_order) VALUES 
        ('2025至今', '电商设计师', 'TechFlow Inc.', '主导了多次S级大促的视觉设计，提升了 40% 的点击转化率。', 1);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM experience WHERE year_range = '2024-2025年') THEN
        INSERT INTO experience (year_range, role, company, description, sort_order) VALUES 
        ('2024-2025年', '电商设计实习', 'Freelance', '为超过 20 个初创品牌提供从 0 到 1 的品牌识别设计服务。', 2);
    END IF;
END $$;

-- Projects seed data (使用 DO 块处理重复插入)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM projects WHERE title = '未来城市控制台') THEN
        INSERT INTO projects (title, image, category, description, project_date, client, tools, views, likes, height) VALUES 
        ('未来城市控制台', 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800', '电商设计', '这是一套为未来城市管理系统设计的 UI 组件库。', '2026-05-12', 'Future City Lab', 'Figma, After Effects', '5.2k', 1240, 'h-64');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM projects WHERE title = '极简主义品牌识别') THEN
        INSERT INTO projects (title, image, category, description, project_date, client, tools, views, likes, height) VALUES 
        ('极简主义品牌识别', 'https://images.unsplash.com/photo-1600607686527-6fb886090705?auto=format&fit=crop&q=80&w=800', '品牌设计', '摒弃多余的装饰，回归品牌本质。', '2026-04-28', 'Mono Studio', 'Illustrator, Photoshop', '3.1k', 890, 'h-96');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM projects WHERE title = '深海梦境渲染') THEN
        INSERT INTO projects (title, image, category, description, project_date, client, tools, views, likes, height) VALUES 
        ('深海梦境渲染', 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&q=80&w=800', 'AI作品/视频', '使用 Blender 和 AI 辅助生成的超现实主义场景。', '2026-04-15', '个人创作', 'Midjourney, Blender', '12k', 3400, 'h-72');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM projects WHERE title = '可持续包装实验') THEN
        INSERT INTO projects (title, image, category, description, project_date, client, tools, views, likes, height) VALUES 
        ('可持续包装实验', 'https://images.unsplash.com/photo-1629196914375-f7e48f477b6d?auto=format&fit=crop&q=80&w=800', '包装设计', '完全使用可降解材料设计的概念包装。', '2026-03-30', 'EcoLife', 'C4D, Photoshop', '1.8k', 560, 'h-80');
    END IF;
END $$;

-- ============================================
-- 8. STORAGE BUCKET POLICIES
-- ============================================
-- Note: 需要先在 Supabase Dashboard 中创建名为 'images' 的存储桶
-- 然后运行以下策略：

-- 先删除可能存在的旧策略
DROP POLICY IF EXISTS "Public read access for images" ON storage.objects;
DROP POLICY IF EXISTS "Public upload access for images" ON storage.objects;
DROP POLICY IF EXISTS "Public update access for images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete access for images" ON storage.objects;

-- 允许所有人读取图片
CREATE POLICY "Public read access for images" ON storage.objects 
    FOR SELECT USING (bucket_id = 'images');

-- 允许所有人上传图片
CREATE POLICY "Public upload access for images" ON storage.objects 
    FOR INSERT WITH CHECK (bucket_id = 'images');

-- 允许所有人更新图片
CREATE POLICY "Public update access for images" ON storage.objects 
    FOR UPDATE USING (bucket_id = 'images');

-- 允许所有人删除图片
CREATE POLICY "Public delete access for images" ON storage.objects 
    FOR DELETE USING (bucket_id = 'images');