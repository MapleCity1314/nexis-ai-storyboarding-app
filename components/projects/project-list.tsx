"use client"

import { motion } from "framer-motion"
import { ProjectCard } from "./project-card" // 假设路径
import { PlusCircle } from "lucide-react"
import { CreateProjectButton } from "./create-project-button"

interface Project {
  id: string
  title: string
  description: string | null
  updatedAt: string // 注意：统一数据库字段名，db schema通常是 updatedAt 或 updated_at
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function ProjectList({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 p-8 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
          <PlusCircle className="h-8 w-8 text-primary/60" />
        </div>
        <h3 className="text-lg font-semibold tracking-tight">暂无项目</h3>
        <p className="mb-6 mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
          您还没有创建任何项目。创建一个新项目开始您的故事板创作之旅。
        </p>
        <CreateProjectButton />
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
        <motion.div key={project.id} variants={item}>
          {/* @ts-ignore - 处理字段名差异，请确保传入的 project 符合 ProjectCard 的定义 */}
          <ProjectCard project={project} />
        </motion.div>
      ))}
    </motion.div>
  )
}