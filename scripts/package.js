/**
 * 打包脚本 - 将项目打包为 ZIP 文件
 * 运行: pnpm package
 */

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// 获取项目信息
const packageJson = require('../package.json');
const projectName = packageJson.name || 'nexis';
const version = packageJson.version || '1.0.0';

// 输出文件名
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputFileName = `${projectName}-v${version}-${timestamp}.zip`;
const outputPath = path.join(__dirname, '..', 'dist', outputFileName);

// 确保 dist 目录存在
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 需要排除的文件和目录
const excludePatterns = [
  'node_modules',
  '.next',
  'dist',
  '.git',
  '.env.local',
  '.env',
  '*.log',
  '.DS_Store',
  'Thumbs.db',
  '.vscode',
  '.idea',
  '*.zip',
  'coverage',
  '.turbo',
  '*.md', // 排除所有 MD 文档
  '!README.md', // 但保留 README.md
];

// 检查文件是否应该被排除
function shouldExclude(filePath) {
  const relativePath = path.relative(path.join(__dirname, '..'), filePath);
  const fileName = path.basename(filePath);
  
  // 特殊处理：保留 README.md
  if (fileName === 'README.md') {
    return false;
  }
  
  return excludePatterns.some(pattern => {
    // 跳过 !README.md 这样的排除规则
    if (pattern.startsWith('!')) {
      return false;
    }
    
    if (pattern.includes('*')) {
      // 通配符匹配
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(fileName);
    }
    // 目录或文件名匹配
    return relativePath.startsWith(pattern) || relativePath.includes(`/${pattern}/`) || relativePath.includes(`\\${pattern}\\`);
  });
}

console.log('📦 开始打包项目...\n');
console.log(`项目名称: ${projectName}`);
console.log(`版本号: ${version}`);
console.log(`输出文件: ${outputFileName}\n`);

// 创建输出流
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
  zlib: { level: 9 } // 最高压缩级别
});

// 监听事件
output.on('close', function() {
  const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  console.log(`\n✅ 打包完成！`);
  console.log(`📦 文件大小: ${sizeInMB} MB`);
  console.log(`📁 输出路径: ${outputPath}`);
  console.log(`\n🎉 打包成功！可以分发此文件了。`);
});

output.on('end', function() {
  console.log('数据已写入完毕');
});

archive.on('warning', function(err) {
  if (err.code === 'ENOENT') {
    console.warn('⚠️  警告:', err);
  } else {
    throw err;
  }
});

archive.on('error', function(err) {
  console.error('❌ 打包失败:', err);
  throw err;
});

// 进度显示
let fileCount = 0;
archive.on('entry', function(entry) {
  fileCount++;
  if (fileCount % 100 === 0) {
    process.stdout.write(`\r已添加 ${fileCount} 个文件...`);
  }
});

// 连接输出流
archive.pipe(output);

// 添加文件到压缩包
const projectRoot = path.join(__dirname, '..');

function addDirectory(dirPath, zipPath = '') {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const fileZipPath = zipPath ? path.join(zipPath, file) : file;
    
    // 检查是否应该排除
    if (shouldExclude(filePath)) {
      return;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      addDirectory(filePath, fileZipPath);
    } else {
      archive.file(filePath, { name: fileZipPath });
    }
  });
}

console.log('📂 正在添加文件...\n');

// 添加所有文件
addDirectory(projectRoot);

// 创建 README 文件
const readmeContent = `# ${projectName} v${version}

## 安装说明

1. 解压此文件到目标目录
2. 安装依赖：
   \`\`\`bash
   pnpm install
   \`\`\`

3. 配置环境变量：
   - 复制 \`.env.example\` 为 \`.env.local\`
   - 填写必要的环境变量

4. 运行数据库迁移：
   \`\`\`bash
   pnpm db:migrate-scenes
   \`\`\`

5. 启动开发服务器：
   \`\`\`bash
   pnpm dev
   \`\`\`

6. 访问 http://localhost:3000

## 生产部署

1. 构建项目：
   \`\`\`bash
   pnpm build
   \`\`\`

2. 启动生产服务器：
   \`\`\`bash
   pnpm start
   \`\`\`

## 文档

- 查看 \`HOW_TO_USE_AI.md\` 了解 AI 功能使用
- 查看 \`FEATURE_COMPLETE.md\` 了解所有功能
- 查看 \`UI_ENHANCEMENTS_COMPLETE.md\` 了解 UI 优化

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Drizzle ORM
- PostgreSQL
- AI SDK

打包时间: ${new Date().toLocaleString('zh-CN')}
`;

archive.append(readmeContent, { name: 'INSTALL.md' });

// 完成打包
archive.finalize();
