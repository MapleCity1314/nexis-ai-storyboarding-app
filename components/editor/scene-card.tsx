"use client"

import { useEffect, useState } from "react"
import { useStoryboardStore } from "@/lib/store/storyboard-store"
import type { Scene } from "@/types"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { cn } from "@/lib/utils"

// UI Components
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// Icons
import {
  GripVertical,
  Trash2,
  Maximize2,
  ImageIcon,
  Clock,
  Video,
  Sparkles,
  MoreHorizontal
} from "lucide-react"

interface SceneCardProps {
  scene: Scene
  index: number
}

export function SceneCard({ scene, index }: SceneCardProps) {
  const { updateSceneField, removeScene, saveScene } = useStoryboardStore()
  const [content, setContent] = useState(scene.content || "")
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // DnD Hook
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: scene.id })

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1, // 拖拽时层级最高
  }

  // Sync content state
  useEffect(() => {
    setContent(scene.content || "")
  }, [scene.content])

  // Debounce save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== scene.content) {
        updateSceneField(scene.id, "content", content)
        saveScene(scene.id)
      }
    }, 1000)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, scene.id, scene.content])

  return (
    <TooltipProvider delayDuration={300}>
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative flex flex-col overflow-hidden border-border/50 bg-card transition-all duration-300",
          isDragging ? "shadow-2xl ring-2 ring-primary/20 scale-105 opacity-90" : "hover:border-primary/50 hover:shadow-md"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* === Header: 拖拽手柄与序号 === */}
        <div className="absolute top-0 left-0 z-20 flex w-full items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-3 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div
            className="flex cursor-grab items-center gap-2 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <div className="rounded-md bg-white/20 p-1 backdrop-blur-md hover:bg-white/30">
              <GripVertical className="h-4 w-4" />
            </div>
            <span className="font-mono text-xs font-bold drop-shadow-md">
              SCENE {index}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 rounded-md bg-white/10 text-white hover:bg-red-500/80 hover:text-white backdrop-blur-md transition-colors"
            onClick={() => removeScene(scene.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* === Section 1: 图像区域 (16:9) === */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
          {scene.image_url ? (
            <div className="relative h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={scene.image_url}
                alt={`Scene ${index}`}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* 放大预览按钮 */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/20">
                <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="secondary" size="sm" className="bg-background/80 backdrop-blur shadow-sm gap-2">
                       <Maximize2 className="h-3 w-3" /> 预览
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-screen-lg border-none bg-transparent p-0 shadow-none">
                    <VisuallyHidden><DialogTitle>预览图片</DialogTitle></VisuallyHidden>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={scene.image_url}
                      alt="Full preview"
                      className="h-auto w-full rounded-lg shadow-2xl"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground/50 bg-muted/20">
              <div className="rounded-full bg-background p-4 shadow-sm">
                <ImageIcon className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium">等待生成画面...</span>
            </div>
          )}
          
          {/* 底部浮动信息 (时长/景别) - 覆盖在图片上更省空间 */}
          <div className="absolute bottom-2 right-2 flex gap-1">
             {scene.duration_seconds && (
               <Badge variant="secondary" className="h-5 gap-1 bg-black/60 text-white hover:bg-black/70 px-1.5 text-[10px] font-mono backdrop-blur-sm border-none">
                 <Clock className="h-3 w-3" /> {scene.duration_seconds}s
               </Badge>
             )}
             {scene.shot_type && (
               <Badge variant="secondary" className="h-5 gap-1 bg-black/60 text-white hover:bg-black/70 px-1.5 text-[10px] backdrop-blur-sm border-none">
                 <Video className="h-3 w-3" /> {scene.shot_type}
               </Badge>
             )}
          </div>
        </div>

        {/* === Section 2: 内容区域 === */}
        <div className="flex flex-1 flex-col gap-3 p-3">
          
          {/* 画面描述 (Prompt) */}
          {scene.frame && (
            <div className="group/frame relative rounded-md bg-muted/40 p-2 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground">
               <span className="line-clamp-2">{scene.frame}</span>
               <Tooltip>
                 <TooltipTrigger asChild>
                   <div className="absolute bottom-0 right-0 p-1 opacity-0 group-hover/frame:opacity-100 cursor-help">
                     <MoreHorizontal className="h-3 w-3" />
                   </div>
                 </TooltipTrigger>
                 <TooltipContent side="bottom" className="max-w-[250px] text-xs">
                   {scene.frame}
                 </TooltipContent>
               </Tooltip>
            </div>
          )}

          {/* 脚本/台词输入框 */}
          <Textarea
            placeholder="描述动作、台词或声音..."
            className="min-h-[60px] resize-none border-none bg-transparent p-1 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/40"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* 底部备注/AI区域 */}
          <div className="mt-auto space-y-2">
            {scene.notes && (
              <div className="flex items-start gap-2 rounded border border-yellow-500/10 bg-yellow-500/5 p-2 text-[10px] text-yellow-600 dark:text-yellow-400">
                <span className="shrink-0 font-bold">Note:</span>
                <span className="line-clamp-2">{scene.notes}</span>
              </div>
            )}
            
            {scene.ai_notes && (
              <div className="flex items-start gap-2 rounded border border-primary/10 bg-primary/5 p-2 text-[10px] text-primary/80">
                <Sparkles className="mt-0.5 h-3 w-3 shrink-0" />
                <span className="line-clamp-2">{scene.ai_notes}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </TooltipProvider>
  )
}