import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "@/lib/env";
import * as schema from "./schema";

// 创建连接池
const pool = new Pool({
  connectionString: env.POSTGRES_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// 创建 Drizzle 实例
export const db = drizzle(pool, { schema });

// 导出 schema 供查询使用
export { schema };
