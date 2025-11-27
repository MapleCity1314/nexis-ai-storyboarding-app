import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { env } from '@/lib/env';

// 全局连接池实例
let pool: Pool | null = null;

/**
 * 获取 PostgreSQL 连接池
 * 使用单例模式确保只创建一个连接池
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: env.POSTGRES_URL,
      // 连接池配置
      max: 20, // 最大连接数
      idleTimeoutMillis: 30000, // 空闲连接超时时间
      connectionTimeoutMillis: 2000, // 连接超时时间
    });

    // 错误处理
    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
  }

  return pool;
}

/**
 * 执行 SQL 查询
 * @param text SQL 查询语句
 * @param params 查询参数
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  return pool.query<T>(text, params);
}

/**
 * 获取单个客户端连接（用于事务）
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
}

/**
 * 执行事务
 * @param callback 事务回调函数
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * 关闭连接池（通常在应用关闭时调用）
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
