"use client"

import { useEffect, useState } from "react"
import type { Project, Scene } from "@/types"
import { useStoryboardStore } from "@/lib/store/storyboard-store"
import { EditorHeader, type ViewMode } from "@/components/editor/editor-header"
import { SceneList } from "@/components/editor/scene-list"
import { SceneTable } from "@/components/editor/scene-table"
import { Sidebar } from "@/components/layout/sidebar"
import type { User } from "@/lib/db/schema"
import { AiChat } from "@/components/editor/ai-chat"

interface EditorClientProps {
  project: Project
  initialScenes: Scene[]
  user: User
}

export function EditorClient({ project, initialScenes, user }: EditorClientProps) {
  const { setProject, setScenes } = useStoryboardStore()
  const [viewMode, setViewMode] = useState<ViewMode>("grid")

  useEffect(() => {
    setProject(project)
    setScenes(initialScenes)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* We reuse the sidebar but maybe in a collapsed mode or specific editor mode later */}
      <Sidebar user={user} />

      <div className="flex-1 flex flex-col min-w-0">
        <EditorHeader viewMode={viewMode} onViewModeChange={setViewMode} />
        <main className="flex-1 overflow-y-auto p-8 bg-muted/20">
          {viewMode === "grid" ? <SceneList /> : <SceneTable />}
        </main>
      </div>

      {/* Integrated the real AI Chat component */}
      <AiChat projectId={project.id} />
    </div>
  )
}
