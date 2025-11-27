"use client"

import { motion } from "framer-motion"
import { TrashProjectCard } from "./trash-project-card"
import { Trash2 } from "lucide-react"

// 定义 Project 接口以匹配数据
interface Project {
  id: string
  title: string
  description: string | null
  deletedAt: string // 统一使用 camelCase 以匹配 DB schema (根据你的 schema 调整)
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

export function TrashList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
          <Trash2 className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight">回收站为空</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          这里没有被删除的项目。
        </p>
      </div>
    )
  }

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {projects.map((project) => (
        <motion.div key={project.id} variants={{ hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }}>
          {/* @ts-ignore */}
          <TrashProjectCard project={project} />
        </motion.div>
      ))}
    </motion.div>
  )
}