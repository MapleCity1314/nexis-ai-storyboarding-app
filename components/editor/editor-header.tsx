"use client"

import { useStoryboardStore } from "@/lib/store/storyboard-store"
import { Button } from "@/components/ui/button"
import { ExportButton } from "@/components/editor/export-button"
import { useState } from "react"

export type ViewMode = "grid" | "table"

interface EditorHeaderProps {
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
}

export function EditorHeader({ viewMode = "grid", onViewModeChange }: EditorHeaderProps) {
  const { project, addScene } = useStoryboardStore()

  return (
    <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold">{project?.title}</h1>
        {project?.description && (
          <span className="text-sm text-muted-foreground hidden md:inline-block max-w-xs truncate">
            {project.description}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onViewModeChange && (
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => onViewModeChange("grid")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
              <span className="ml-1">卡片</span>
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2"
              onClick={() => onViewModeChange("table")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 3h18v18H3z" />
                <path d="M3 9h18" />
                <path d="M3 15h18" />
                <path d="M9 3v18" />
              </svg>
              <span className="ml-1">表格</span>
            </Button>
          </div>
        )}
        <Button onClick={() => addScene()} size="sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          添加场景
        </Button>
        <ExportButton />
      </div>
    </header>
  )
}
