/**
 * 数据库初始化脚本
 * 运行: pnpm tsx scripts/init-db.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { Pool } from "pg";

// 加载环境变量
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function initDatabase() {
  console.log("🚀 开始初始化数据库...");

  const POSTGRES_URL = process.env.POSTGRES_URL;
  
  if (!POSTGRES_URL) {
    console.error("❌ 错误: POSTGRES_URL 环境变量未设置");
    console.error("请在 .env.local 或 .env 文件中设置 POSTGRES_URL");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: POSTGRES_URL,
  });

  try {
    // 测试连接
    console.log("📡 测试数据库连接...");
    const result = await pool.query("SELECT NOW()");
    console.log("✅ 数据库连接成功");
    console.log(`   当前时间: ${result.rows[0].now}`);

    // 创建表（如果不存在）
    console.log("\n📦 创建数据库表...");
    
    // 创建 users 表
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
    console.log("   ✓ users 表");

    // 创建 projects 表
    await pool.query(`
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
    `);
    console.log("   ✓ projects 表");

    // 创建 scenes 表
    await pool.query(`
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
    `);
    console.log("   ✓ scenes 表");

    console.log("✅ 数据库表创建成功");

    // 创建索引
    console.log("\n🔍 创建索引...");
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    console.log("   ✓ idx_users_email");
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    `);
    console.log("   ✓ idx_projects_user_id");
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id);
    `);
    console.log("   ✓ idx_scenes_project_id");
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_scenes_order_index ON scenes(order_index);
    `);
    console.log("   ✓ idx_scenes_order_index");

    console.log("✅ 索引创建成功");

    console.log("\n🎉 数据库初始化完成！");
    console.log("\n下一步:");
    console.log("  1. 运行 'pnpm dev' 启动开发服务器");
    console.log("  2. 访问 http://localhost:3000/signup 注册账号");
    
  } catch (error: any) {
    console.error("\n❌ 数据库初始化失败:");
    console.error(error.message);
    
    if (error.code === "3D000") {
      console.error("\n💡 数据库不存在，请先创建数据库:");
      console.error("   psql -U postgres");
      console.error("   CREATE DATABASE nexis;");
      console.error("   \\q");
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

initDatabase();
