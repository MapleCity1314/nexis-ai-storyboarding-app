"use client"

import { useStoryboardStore } from "@/lib/store/storyboard-store"
import { SceneCard } from "@/components/editor/scene-card"
import { AnimatePresence, motion } from "framer-motion"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy, // 关键修改：更适合网格布局
} from "@dnd-kit/sortable"
import { useState } from "react"
import { Film } from "lucide-react"
import type { Scene } from "@/types"

export function SceneList() {
  const { scenes, reorderScenes } = useStoryboardStore()
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // 防止点击时误触拖拽
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = scenes.findIndex((s) => s.id === active.id)
      const newIndex = scenes.findIndex((s) => s.id === over.id)

      const newScenes = arrayMove(scenes, oldIndex, newIndex)
      reorderScenes(newScenes.map((s) => s.id))
    }
    setActiveId(null)
  }

  // 获取正在拖拽的场景数据用于 Overlay
  const activeScene = activeId ? scenes.find(s => s.id === activeId) : null

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={scenes.map((s) => s.id)} strategy={rectSortingStrategy}>
          <motion.div 
            layout
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            <AnimatePresence mode="popLayout">
              {scenes.map((scene, index) => (
                <SceneItemWrapper key={scene.id} scene={scene} index={index + 1} />
              ))}
            </AnimatePresence>
          </motion.div>
        </SortableContext>

        {/* 拖拽时的残影覆盖层 - 提升性能与视觉体验 */}
        <DragOverlay adjustScale={true}>
          {activeScene ? (
             <div className="opacity-90 rotate-2 cursor-grabbing">
                <SceneCard scene={activeScene} index={scenes.findIndex(s => s.id === activeScene.id) + 1} />
             </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* 空状态 */}
      {scenes.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-muted-foreground/20 bg-muted/5 px-4 text-center"
        >
          <div className="mb-6 rounded-full bg-background p-4 shadow-sm ring-1 ring-inset ring-border">
            <Film className="h-8 w-8 text-muted-foreground/60" />
          </div>
          <h3 className="text-xl font-semibold tracking-tight">开始您的故事板</h3>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            当前没有任何场景。点击右上角的“添加场景”或让 AI 为您生成初始分镜。
          </p>
        </motion.div>
      )}
    </div>
  )
}

// 独立的包装组件，避免 Framer Motion 和 DnD 的 ref 冲突
function SceneItemWrapper({ scene, index }: { scene: Scene; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
    >
      <SceneCard scene={scene} index={index} />
    </motion.div>
  )
}