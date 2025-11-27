/**
 * 数据库连接测试脚本
 * 运行: pnpm tsx scripts/test-db.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import { Pool } from "pg";

// 加载环境变量
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function testDatabase() {
  console.log("🧪 开始测试数据库连接...\n");

  const POSTGRES_URL = process.env.POSTGRES_URL;
  
  if (!POSTGRES_URL) {
    console.error("❌ 错误: POSTGRES_URL 环境变量未设置");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: POSTGRES_URL,
  });

  try {
    // 1. 测试基本连接
    console.log("1️⃣ 测试基本连接...");
    const result = await pool.query("SELECT NOW() as current_time");
    console.log("✅ 连接成功！当前时间:", result.rows[0].current_time);

    // 2. 测试表是否存在
    console.log("\n2️⃣ 检查数据库表...");
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log("✅ 找到以下表:");
    tables.rows.forEach((row: any) => {
      console.log(`   - ${row.table_name}`);
    });

    // 3. 测试 users 表
    console.log("\n3️⃣ 测试 users 表...");
    const userCount = await pool.query("SELECT COUNT(*) as count FROM users");
    console.log(`✅ users 表存在，当前有 ${userCount.rows[0].count} 条记录`);

    // 4. 测试 projects 表
    console.log("\n4️⃣ 测试 projects 表...");
    const projectCount = await pool.query("SELECT COUNT(*) as count FROM projects");
    console.log(`✅ projects 表存在，当前有 ${projectCount.rows[0].count} 条记录`);

    // 5. 测试 scenes 表
    console.log("\n5️⃣ 测试 scenes 表...");
    const sceneCount = await pool.query("SELECT COUNT(*) as count FROM scenes");
    console.log(`✅ scenes 表存在，当前有 ${sceneCount.rows[0].count} 条记录`);

    console.log("\n🎉 所有测试通过！数据库配置正确。");
  } catch (error: any) {
    console.error("\n❌ 测试失败:", error.message);
    console.error("\n💡 请检查:");
    console.error("   1. PostgreSQL 服务是否运行");
    console.error("   2. .env.local 或 .env 中的 POSTGRES_URL 是否正确");
    console.error("   3. 数据库是否已创建");
    console.error("   4. 是否已运行 'pnpm db:init' 初始化表结构");
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testDatabase();
