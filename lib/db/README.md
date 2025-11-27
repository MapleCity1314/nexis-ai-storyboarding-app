# 数据库访问层

本项目同时支持 **Supabase** 和 **本地 PostgreSQL** 两种数据库访问方式。

## 架构说明

```
┌─────────────────────────────────────────┐
│         Next.js Application             │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐   ┌───────────────┐  │
│  │   Supabase   │   │  PostgreSQL   │  │
│  │   Client     │   │   Direct      │  │
│  └──────────────┘   └───────────────┘  │
│         │                   │           │
└─────────┼───────────────────┼───────────┘
          │                   │
          ▼                   ▼
    ┌──────────┐      ┌──────────────┐
    │ Supabase │      │ PostgreSQL   │
    │ (Cloud)  │      │ (Local/Cloud)│
    └──────────┘      └──────────────┘
```

## 何时使用 Supabase

✅ **推荐使用场景：**
- 用户认证和授权
- 实时数据订阅
- 文件存储
- Row Level Security (RLS)
- 简单的 CRUD 操作
- 客户端直接访问

```typescript
import { createClient } from '@/lib/supabase/server';

export async function getProjects() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  return data;
}
```

## 何时使用 PostgreSQL

✅ **推荐使用场景：**
- 复杂的 SQL 查询（JOIN、聚合、子查询）
- 数据库事务
- 批量操作
- 数据迁移
- 性能敏感的查询
- 需要完全控制 SQL 的场景

```typescript
import { query, transaction } from '@/lib/db';

// 复杂查询
export async function getProjectStats(userId: string) {
  const result = await query(
    `SELECT p.*, COUNT(s.id) as scene_count
     FROM projects p
     LEFT JOIN scenes s ON s.project_id = p.id
     WHERE p.user_id = $1
     GROUP BY p.id`,
    [userId]
  );
  return result.rows;
}

// 事务
export async function createProjectWithScenes(data: any) {
  return transaction(async (client) => {
    const project = await client.query('INSERT INTO projects ...');
    await client.query('INSERT INTO scenes ...');
    return project.rows[0];
  });
}
```

## 配置

### 1. 环境变量

在 `.env.local` 中配置：

```bash
# Supabase 配置
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# PostgreSQL 配置（选择一种）

# 选项 1: 本地 PostgreSQL
POSTGRES_URL=postgresql://postgres:password@localhost:5432/nexis

# 选项 2: Supabase PostgreSQL (推荐用于生产环境)
POSTGRES_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 2. 安装本地 PostgreSQL (可选)

如果使用本地数据库：

**Windows:**
```bash
# 使用 Chocolatey
choco install postgresql

# 或下载安装器
# https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 3. 创建数据库

```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE nexis;

# 创建用户（可选）
CREATE USER nexis_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE nexis TO nexis_user;
```

## API 参考

### query()
执行 SQL 查询

```typescript
const result = await query('SELECT * FROM projects WHERE id = $1', [projectId]);
```

### transaction()
执行事务

```typescript
await transaction(async (client) => {
  await client.query('INSERT INTO ...');
  await client.query('UPDATE ...');
});
```

### getClient()
获取单个连接（用于手动事务控制）

```typescript
const client = await getClient();
try {
  await client.query('BEGIN');
  // ... 操作
  await client.query('COMMIT');
} finally {
  client.release();
}
```

## 最佳实践

### 1. 混合使用策略

```typescript
// ✅ 好的做法：结合两者优势
export async function getDetailedUserData() {
  // 使用 Supabase 认证
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 使用 PostgreSQL 复杂查询
  const stats = await query(
    'SELECT ... complex query ...',
    [user.id]
  );
  
  return { user, stats };
}
```

### 2. 连接池管理

```typescript
// ✅ 好的做法：使用连接池
import { query } from '@/lib/db';
await query('SELECT ...');

// ❌ 避免：每次创建新连接
import { Pool } from 'pg';
const pool = new Pool({ ... }); // 不要这样做
```

### 3. 参数化查询

```typescript
// ✅ 好的做法：使用参数化查询
await query('SELECT * FROM users WHERE id = $1', [userId]);

// ❌ 避免：字符串拼接（SQL 注入风险）
await query(`SELECT * FROM users WHERE id = '${userId}'`);
```

## 迁移和部署

### 开发环境
- 使用本地 PostgreSQL 进行开发
- 使用 Supabase 进行认证测试

### 生产环境
- 使用 Supabase 的 PostgreSQL（推荐）
- 或使用独立的 PostgreSQL 服务（如 AWS RDS、Railway）

### 数据库迁移
建议使用迁移工具：
- [Drizzle ORM](https://orm.drizzle.team/)
- [Prisma](https://www.prisma.io/)
- 或 Supabase 的迁移功能

## 故障排查

### 连接失败
```bash
# 检查 PostgreSQL 是否运行
# Windows
sc query postgresql-x64-16

# macOS/Linux
pg_isready
```

### 权限问题
```sql
-- 授予必要权限
GRANT ALL PRIVILEGES ON DATABASE nexis TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
```

### 连接池耗尽
调整 `lib/db/postgres.ts` 中的连接池配置：
```typescript
max: 20, // 增加最大连接数
idleTimeoutMillis: 30000, // 调整超时时间
```

## 参考资料

- [Supabase 文档](https://supabase.com/docs)
- [node-postgres 文档](https://node-postgres.com/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
