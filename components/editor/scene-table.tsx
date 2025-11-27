"use client"

import type { Scene } from "@/types"
import { useStoryboardStore } from "@/lib/store/storyboard-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState, useRef } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  motion,
  AnimatePresence,
  Reorder
} from "framer-motion"
import {
  ImageIcon,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  MoreHorizontal,
  Film
} from "lucide-react"
import { cn } from "@/lib/utils"

// --- 子组件：可编辑单元格 ---
interface EditableCellProps {
  value: string | number | null
  isEditing: boolean
  onEdit: () => void
  onBlur: (value: string) => void
  type?: "input" | "textarea" | "number"
  className?: string
  placeholder?: string
}

function EditableCell({
  value,
  isEditing,
  onEdit,
  onBlur,
  type = "input",
  className,
  placeholder = "-"
}: EditableCellProps) {
  const [tempValue, setTempValue] = useState(value ?? "")
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  // 当进入编辑模式时，聚焦输入框
  useState(() => {
    if (isEditing) {
      setTempValue(value ?? "")
    }
  })

  const handleBlur = () => {
    onBlur(tempValue.toString())
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && type !== "textarea") {
      e.preventDefault()
      inputRef.current?.blur()
    }
  }

  if (isEditing) {
    if (type === "textarea") {
      return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={tempValue}
            onChange={(e) => setTempValue(e.target.value)}
            onBlur={handleBlur}
            autoFocus
            className={cn("min-h-[80px] resize-none text-sm bg-background shadow-sm", className)}
          />
        </motion.div>
      )
    }
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
        <Input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={type === "number" ? "number" : "text"}
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className={cn("h-9 text-sm bg-background shadow-sm", className)}
        />
      </motion.div>
    )
  }

  return (
    <div
      onClick={onEdit}
      className={cn(
        "cursor-pointer rounded-md px-2 py-1.5 min-h-[36px] transition-colors duration-200 border border-transparent hover:bg-muted/60 hover:border-border/40 text-sm flex items-center",
        !value && "text-muted-foreground italic",
        className
      )}
    >
      <span className="line-clamp-3 whitespace-pre-wrap w-full">
        {value || placeholder}
      </span>
    </div>
  )
}

// --- 子组件：图片上传单元格 ---
function ImageCell({ url, onUpload }: { url?: string | null; onUpload: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="relative group w-20 h-14 sm:w-24 sm:h-16 rounded-md overflow-hidden bg-muted/50 border border-border/50 transition-all hover:border-primary/50 hover:shadow-sm">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Scene" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 group-hover:text-primary/60 transition-colors">
          <ImageIcon className="w-6 h-6" />
        </div>
      )}

      {/* 遮罩层 */}
      <div
        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer backdrop-blur-[1px]"
        onClick={() => inputRef.current?.click()}
      >
        <span className="text-[10px] font-medium text-white px-2 py-0.5 rounded-full border border-white/20 bg-black/20">
          {url ? "更换" : "上传"}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onUpload(file)
        }}
      />
    </div>
  )
}

// --- 主组件 ---
export function SceneTable() {
  const { scenes, updateSceneField, saveScene, removeScene, moveSceneUp, moveSceneDown } = useStoryboardStore()
  const [editingCell, setEditingCell] = useState<{ sceneId: string; field: string } | null>(null)

  const handleCellBlur = async (sceneId: string, field: keyof Scene, newValue: string) => {
    const scene = scenes.find((s) => s.id === sceneId)
    if (scene && newValue !== scene[field]?.toString()) {
      updateSceneField(sceneId, field, newValue)
      await saveScene(sceneId)
    }
    setEditingCell(null)
  }

  const handleImageUpload = async (sceneId: string, file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      updateSceneField(sceneId, "image_url", imageUrl)
      saveScene(sceneId)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="w-full space-y-4">
      {/* 响应式容器，添加水平滚动阴影提示 */}
      <div className="w-full overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="w-full overflow-x-auto relative scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border/60">
                <TableHead className="w-[50px] text-center">#</TableHead>
                <TableHead className="w-[120px]">镜头预览</TableHead>
                <TableHead className="w-[80px]">编号</TableHead>
                <TableHead className="w-[100px]">景别</TableHead>
                <TableHead className="min-w-[200px]">画面描述</TableHead>
                <TableHead className="min-w-[200px]">场景内容/对白</TableHead>
                <TableHead className="w-[80px]">时长(s)</TableHead>
                <TableHead className="min-w-[150px]">备注</TableHead>
                <TableHead className="w-[100px] text-right pr-6">操作</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="relative">
              <AnimatePresence mode="popLayout">
                {scenes.map((scene, index) => (
                  <motion.tr
                    key={scene.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className={cn(
                      "group border-b border-border/40 transition-colors hover:bg-muted/20",
                      editingCell?.sceneId === scene.id ? "bg-muted/30" : ""
                    )}
                  >
                    {/* 序号 */}
                    <TableCell className="text-center font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    {/* 图片 */}
                    <TableCell className="py-3">
                      <ImageCell
                        url={scene.image_url}
                        onUpload={(file) => handleImageUpload(scene.id, file)}
                      />
                    </TableCell>

                    {/* 镜头编号 */}
                    <TableCell>
                      <EditableCell
                        value={scene.shot_number}
                        isEditing={editingCell?.sceneId === scene.id && editingCell?.field === "shot_number"}
                        onEdit={() => setEditingCell({ sceneId: scene.id, field: "shot_number" })}
                        onBlur={(val) => handleCellBlur(scene.id, "shot_number", val)}
                        className="font-mono text-xs"
                      />             
                    </TableCell>

                    {/* 景别 */}
                    <TableCell>
                      <EditableCell
                        value={scene.shot_type}
                        isEditing={editingCell?.sceneId === scene.id && editingCell?.field === "shot_type"}
                        onEdit={() => setEditingCell({ sceneId: scene.id, field: "shot_type" })}
                        onBlur={(val) => handleCellBlur(scene.id, "shot_type", val)}
                      />
                    </TableCell>

                    {/* 画面描述 */}
                    <TableCell>
                      <EditableCell
                        type="textarea"
                        value={scene.frame}
                        isEditing={editingCell?.sceneId === scene.id && editingCell?.field === "frame"}
                        onEdit={() => setEditingCell({ sceneId: scene.id, field: "frame" })}
                        onBlur={(val) => handleCellBlur(scene.id, "frame", val)}
                      />
                    </TableCell>

                    {/* 内容/对白 */}
                    <TableCell>
                      <EditableCell
                        type="textarea"
                        value={scene.content}
                        isEditing={editingCell?.sceneId === scene.id && editingCell?.field === "content"}
                        onEdit={() => setEditingCell({ sceneId: scene.id, field: "content" })}
                        onBlur={(val) => handleCellBlur(scene.id, "content", val)}
                      />
                    </TableCell>

                    {/* 时长 */}
                    <TableCell>
                      <EditableCell
                        type="number"
                        value={scene.duration_seconds}
                        isEditing={editingCell?.sceneId === scene.id && editingCell?.field === "duration_seconds"}
                        onEdit={() => setEditingCell({ sceneId: scene.id, field: "duration_seconds" })}
                        onBlur={(val) => handleCellBlur(scene.id, "duration_seconds", val)}
                        className="font-mono text-center"
                      />
                    </TableCell>

                    {/* 备注 */}
                    <TableCell>
                      <EditableCell
                        type="textarea"
                        value={scene.notes}
                        isEditing={editingCell?.sceneId === scene.id && editingCell?.field === "notes"}
                        onEdit={() => setEditingCell({ sceneId: scene.id, field: "notes" })}
                        onBlur={(val) => handleCellBlur(scene.id, "notes", val)}
                        className="text-muted-foreground"
                      />
                    </TableCell>

                    {/* 操作按钮 */}
                    <TableCell className="text-right pr-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => moveSceneUp(scene.id)}
                          disabled={index === 0}
                          title="上移"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          onClick={() => moveSceneDown(scene.id)}
                          disabled={index === scenes.length - 1}
                          title="下移"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeScene(scene.id)}
                          title="删除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {/* 空状态展示 */}
        {scenes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center bg-muted/10"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl" />
              <div className="relative rounded-full bg-background p-6 shadow-sm border border-border/50">
                <Film className="w-8 h-8 text-muted-foreground/50" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">暂无分镜场景</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
              你的故事板还是空的。添加第一个场景，开始构思你的创意吧。
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}