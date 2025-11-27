-- 数据库设置脚本
-- 使用方法: psql -U postgres -f scripts/setup-database.sql

-- 创建数据库（如果不存在）
SELECT 'CREATE DATABASE nexis'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nexis')\gexec

-- 连接到数据库
\c nexis

-- 创建 users 表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 创建 projects 表
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  is_deleted INTEGER DEFAULT 0 NOT NULL,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 创建 scenes 表
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  content TEXT,
  image_url TEXT,
  ai_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_scenes_order_index ON scenes(order_index);

-- 显示创建的表
\dt

-- 完成
\echo '✅ 数据库设置完成！'
\echo '📊 表结构：'
\echo '  - users (用户表)'
\echo '  - projects (项目表)'
\echo '  - scenes (场景表)'
\echo ''
\echo '下一步：'
\echo '1. 配置 .env.local 文件'
\echo '2. 运行 pnpm dev 启动开发服务器'
\echo '3. 访问 http://localhost:3000/signup 注册账号'
