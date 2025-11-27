"use client"

import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { zhCN } from "date-fns/locale"
import { MoreVertical, Trash2, FolderOpen, Clock } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { deleteProject } from "@/app/actions/projects"
import type { Project } from "@/lib/db/schema"
import { cn } from "@/lib/utils"

interface ProjectCardProps {
  project: Project
  className?: string
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    // 这里的 confirm 可以换成更优雅的 Dialog，暂时保持原样
    if (confirm("确定要将此项目移至回收站吗？")) {
      await deleteProject(project.id)
    }
  }

  return (
    <div className={cn("group relative flex flex-col gap-2 transition-all", className)}>
      <Link href={`/editor/${project.id}`} className="block outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl">
        {/* 封面区域 */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl border bg-muted/50 shadow-sm transition-all duration-300 group-hover:shadow-md group-hover:border-primary/20">
          {/* 这里可以放项目封面图，暂时用渐变代替 */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted/50 via-muted to-muted/80 flex items-center justify-center text-muted-foreground/30 group-hover:scale-105 transition-transform duration-500">
             <FolderOpen className="w-12 h-12 opacity-50" />
          </div>
          
          {/* 悬浮遮罩 */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors" />
        </div>

        {/* 标题与描述 */}
        <div className="space-y-1 pt-3 px-1">
          <h3 className="font-semibold leading-none tracking-tight group-hover:text-primary transition-colors truncate">
            {project.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1 h-4">
            {project.description || "暂无描述"}
          </p>
        </div>
      </Link>

      {/* 底部元数据栏 */}
      <div className="flex items-center justify-between px-1 mt-1">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
          <Clock className="w-3 h-3" />
          <span>
            {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true, locale: zhCN })}
          </span>
        </div>

        {/* 操作菜单 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 -mr-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
            >
              <MoreVertical className="h-3.5 w-3.5" />
              <span className="sr-only">菜单</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
               <Link href={`/editor/${project.id}`}>打开项目</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>重命名</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={handleDelete} 
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10"
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              移至回收站
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}