# Nexis AI 故事板系统

一个基于 AI 的智能故事板创作平台，帮助创作者快速构建和可视化故事场景。

## ✨ 主要功能

- 🎨 **AI 图片生成** - 使用通义万相自动生成场景图片
- 🎬 **专业分镜管理** - 支持镜头编号、类型、时长等详细信息
- 📊 **多视图展示** - 卡片视图和表格视图自由切换
- 🤖 **智能 AI 助手** - 自然语言交互，快速创建和编辑场景
- 🔄 **拖拽排序** - 灵活调整场景顺序
- 📤 **导出功能** - 导出为 Excel 表格

## 🚀 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL 数据库
- pnpm（推荐）或 npm

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd nexis-ai-storyboarding-app
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **配置环境变量**
   ```bash
   cp .env.example .env.local
   ```
   
   编辑 `.env.local`，填写必要的配置：
   - `POSTGRES_URL` - PostgreSQL 数据库连接字符串
   - `NEXTAUTH_SECRET` - 认证密钥
   - `DASHSCOPE_API_KEY` - 通义万相 API 密钥

4. **运行数据库迁移**
   ```bash
   pnpm db:migrate-scenes
   ```

5. **启动开发服务器**
   ```bash
   pnpm dev
   ```

6. **访问应用**
   
   打开浏览器访问 http://localhost:3000

## 📖 使用指南

### 创建项目

1. 注册/登录账号
2. 点击"创建项目"
3. 输入项目名称和描述
4. 进入项目编辑器

### 使用 AI 创建场景

在 AI 聊天框中输入指令：

```
创建一个新场景：
- 镜头编号：1
- 镜头类型：全景
- 画面：夜晚的赛博朋克城市，霓虹灯闪烁
- 时长：5秒
然后生成图片
```

### 管理场景

- **拖拽排序** - 抓取场景卡片的 "SCENE X" 标签拖动
- **上移/下移** - 点击场景卡片右上角的箭头按钮
- **编辑内容** - 直接在卡片或表格中编辑
- **查看大图** - 点击场景图片查看完整大图

### 导出故事板

点击编辑器头部的"导出 XLSX"按钮，将故事板导出为 Excel 文件。

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **数据库**: PostgreSQL + Drizzle ORM
- **认证**: NextAuth.js
- **AI**: AI SDK, 通义万相
- **状态管理**: Zustand
- **拖拽**: @dnd-kit
- **导出**: xlsx

## 📦 可用命令

```bash
# 开发
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 代码检查

# 数据库
pnpm db:generate  # 生成数据库迁移
pnpm db:migrate   # 运行数据库迁移
pnpm db:push      # 推送数据库变更
pnpm db:studio    # 打开数据库管理界面
pnpm db:migrate-scenes  # 运行场景表迁移

# 打包
pnpm package      # 打包项目为 ZIP
```

## 🎯 核心功能

### 1. 卡片视图
- 固定图片高度，统一展示
- 点击图片查看大图
- 完整的分镜信息展示
- 时间方向指引箭头

### 2. 表格视图
- 可编辑的表格单元格
- 图片上传功能
- 批量编辑支持

### 3. AI 聊天
- 自然语言交互
- 工具调用可视化
- 完成后自动折叠
- 光流动画效果

### 4. 场景管理
- 拖拽排序
- 上移/下移按钮
- 批量操作
- 实时保存

## 🔧 配置说明

### 数据库配置

在 `.env.local` 中配置 PostgreSQL 连接：

```env
POSTGRES_URL="postgresql://user:password@localhost:5432/nexis"
```

### AI 配置

配置通义万相 API：

```env
DASHSCOPE_API_KEY="your-api-key"
```

### 认证配置

生成认证密钥：

```bash
openssl rand -base64 32
```

添加到 `.env.local`：

```env
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## 📝 开发指南

### 项目结构

```
nexis-ai-storyboarding-app/
├── app/                    # Next.js App Router
│   ├── actions/           # Server Actions
│   ├── api/               # API Routes
│   ├── auth/              # 认证页面
│   ├── editor/            # 编辑器页面
│   └── projects/          # 项目页面
├── components/            # React 组件
│   ├── editor/           # 编辑器组件
│   ├── projects/         # 项目组件
│   └── ui/               # UI 组件
├── lib/                   # 工具库
│   ├── ai/               # AI 工具
│   ├── db/               # 数据库
│   └── store/            # 状态管理
├── scripts/              # 脚本
└── types/                # 类型定义
```

### 添加新功能

1. 在 `lib/ai/tool/` 创建新的 AI 工具
2. 在 `app/api/chat/route.ts` 注册工具
3. 在 `components/editor/` 添加 UI 组件
4. 更新类型定义

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [shadcn/ui](https://ui.shadcn.com/)
- [通义万相](https://dashscope.aliyun.com/)

---

Made with ❤️ by Nexis Team
