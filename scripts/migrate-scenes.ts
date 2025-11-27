/**
 * 场景表字段迁移脚本
 * 运行: pnpm db:migrate-scenes
 */

import { config } from "dotenv";
import { resolve } from "path";
import { Pool } from "pg";

// 加载环境变量
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function migrateScenes() {
  console.log("🚀 开始迁移场景表字段...");

  const POSTGRES_URL = process.env.POSTGRES_URL;
  
  if (!POSTGRES_URL) {
    console.error("❌ 错误: POSTGRES_URL 环境变量未设置");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: POSTGRES_URL,
  });

  try {
    console.log("📡 连接数据库...");

    // 添加新字段到 scenes 表
    console.log("\n📦 添加场景表新字段...");
    
    const sceneFields = [
      { name: "shot_number", type: "TEXT", description: "镜头编号" },
      { name: "frame", type: "TEXT", description: "画面描述" },
      { name: "shot_type", type: "TEXT", description: "镜头类型" },
      { name: "duration_seconds", type: "INTEGER", description: "时长（秒）" },
      { name: "notes", type: "TEXT", description: "备注" },
    ];

    for (const field of sceneFields) {
      try {
        await pool.query(`
          ALTER TABLE scenes 
          ADD COLUMN IF NOT EXISTS ${field.name} ${field.type};
        `);
        console.log(`   ✓ ${field.description} (${field.name})`);
      } catch (error: any) {
        if (error.code === '42701') {
          console.log(`   - ${field.description} (${field.name}) 已存在`);
        } else {
          throw error;
        }
      }
    }

    // 为 projects 表添加 image_size 字段
    console.log("\n📦 更新项目表...");
    try {
      await pool.query(`
        ALTER TABLE projects 
        ADD COLUMN IF NOT EXISTS image_size TEXT DEFAULT '1328*1328';
      `);
      console.log(`   ✓ 图片尺寸字段 (image_size)`);
    } catch (error: any) {
      if (error.code === '42701') {
        console.log(`   - 图片尺寸字段 (image_size) 已存在`);
      } else {
        throw error;
      }
    }

    // 验证字段
    console.log("\n🔍 验证字段...");
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'scenes' 
      ORDER BY column_name;
    `);
    
    console.log("✅ scenes 表字段:");
    result.rows.forEach((row: any) => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });

    const projectResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'projects' 
      ORDER BY column_name;
    `);
    
    console.log("\n✅ projects 表字段:");
    projectResult.rows.forEach((row: any) => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });

    console.log("\n🎉 字段迁移完成！");
    console.log("\n现在可以使用以下新功能:");
    console.log("  - 镜头编号管理");
    console.log("  - 画面描述");
    console.log("  - 镜头类型设置");
    console.log("  - 时长控制");
    console.log("  - 备注信息");
    console.log("  - 项目图片尺寸配置");
    
  } catch (error: any) {
    console.error("\n❌ 迁移失败:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateScenes();
