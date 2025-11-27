/**
 * 数据库访问层
 * 
 * 提供多种数据库访问方式：
 * 1. Drizzle ORM - 推荐用于所有数据库操作（类型安全、性能优秀）
 * 2. PostgreSQL - 用于复杂的原始 SQL 查询
 * 3. Supabase - 用于认证、实时订阅、存储等功能（如果需要）
 */

// 导出 Drizzle ORM（推荐）
export { db, schema } from './drizzle';
export * from './schema';

// 导出原始 PostgreSQL 工具（用于复杂查询）
export * from './postgres';

// 导出 Supabase 客户端（用于认证等功能）
export { createClient as createSupabaseClient } from '@/lib/supabase/client';
export { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
