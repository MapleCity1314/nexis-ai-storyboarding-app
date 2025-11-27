/**
 * 数据库使用示例
 * 
 * 展示如何同时使用 Supabase 和本地 PostgreSQL
 */

import { query, transaction, getClient } from './postgres';
import { createClient } from '@/lib/supabase/server';

// ============================================================================
// 示例 1: 使用 PostgreSQL 进行复杂查询
// ============================================================================

export async function getProjectsWithStats(userId: string) {
  const result = await query(
    `
    SELECT 
      p.id,
      p.name,
      p.created_at,
      COUNT(DISTINCT s.id) as scene_count,
      COUNT(DISTINCT c.id) as character_count
    FROM projects p
    LEFT JOIN scenes s ON s.project_id = p.id
    LEFT JOIN characters c ON c.project_id = p.id
    WHERE p.user_id = $1
    GROUP BY p.id, p.name, p.created_at
    ORDER BY p.created_at DESC
    `,
    [userId]
  );
  
  return result.rows;
}

// ============================================================================
// 示例 2: 使用事务确保数据一致性
// ============================================================================

export async function createProjectWithScenes(
  userId: string,
  projectName: string,
  sceneNames: string[]
) {
  return transaction(async (client) => {
    // 创建项目
    const projectResult = await client.query(
      'INSERT INTO projects (user_id, name) VALUES ($1, $2) RETURNING id',
      [userId, projectName]
    );
    const projectId = projectResult.rows[0].id;

    // 批量创建场景
    for (const sceneName of sceneNames) {
      await client.query(
        'INSERT INTO scenes (project_id, name) VALUES ($1, $2)',
        [projectId, sceneName]
      );
    }

    return projectId;
  });
}

// ============================================================================
// 示例 3: 使用 Supabase 进行认证和实时订阅
// ============================================================================

export async function getUserProjects() {
  const supabase = await createClient();
  
  // 使用 Supabase 的 RLS (Row Level Security)
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ============================================================================
// 示例 4: 混合使用 - Supabase 认证 + PostgreSQL 查询
// ============================================================================

export async function getDetailedProjectAnalytics() {
  // 1. 使用 Supabase 获取当前用户
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error('Not authenticated');

  // 2. 使用 PostgreSQL 执行复杂分析查询
  const result = await query(
    `
    SELECT 
      DATE_TRUNC('day', created_at) as date,
      COUNT(*) as projects_created,
      SUM(scene_count) as total_scenes
    FROM projects
    WHERE user_id = $1
      AND created_at >= NOW() - INTERVAL '30 days'
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY date DESC
    `,
    [user.id]
  );

  return result.rows;
}

// ============================================================================
// 示例 5: 使用连接池进行批量操作
// ============================================================================

export async function batchUpdateScenes(updates: Array<{ id: string; name: string }>) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    for (const update of updates) {
      await client.query(
        'UPDATE scenes SET name = $1, updated_at = NOW() WHERE id = $2',
        [update.name, update.id]
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
