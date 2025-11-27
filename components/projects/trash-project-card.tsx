"use client"

import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { RotateCcw, Trash2, FileX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { restoreProject, permanentDeleteProject } from "@/app/actions/projects"
import type { Project } from "@/lib/db/schema"
import { cn } from "@/lib/utils"

interface TrashProjectCardProps {
  project: Project
}

export function TrashProjectCard({ project }: TrashProjectCardProps) {
  async function handleRestore() {
    await restoreProject(project.id)
  }

  async function handlePermanentDelete() {
    if (confirm("⚠️ 确定要永久删除此项目吗？\n\n此操作将删除所有场景、图片和脚本，且无法撤销！")) {
      await permanentDeleteProject(project.id)
    }
  }

  return (
    <div className="group relative flex flex-col gap-2 rounded-xl border border-border/50 bg-background/50 p-3 opacity-75 transition-all hover:opacity-100 hover:bg-background hover:shadow-sm">
      {/* 缩略图占位 - 灰色调 */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted flex items-center justify-center">
         <FileX className="h-10 w-10 text-muted-foreground/40" />
         <div className="absolute inset-0 bg-black/5" />
      </div>

      <div className="flex-1 space-y-1">
        <h3 className="font-semibold leading-none tracking-tight text-muted-foreground group-hover:text-foreground transition-colors truncate">
          {project.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">
           删除于 {project.deletedAt ? formatDistanceToNow(new Date(project.deletedAt), { addSuffix: true, locale: zhCN }) : '未知'}
        </p>
      </div>

      {/* 底部操作栏 - Hover时显示背景 */}
      <div className="mt-2 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRestore}
          className="flex-1 h-8 gap-2 border-dashed hover:border-solid hover:bg-primary/5 hover:text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          恢复
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePermanentDelete}
          className="h-8 w-8 text-muted-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20"
          title="永久删除"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}