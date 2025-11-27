"use client"

import { Button } from "@/components/ui/button"
import { useStoryboardStore } from "@/lib/store/storyboard-store"
import { useState } from "react"
import { Loader2, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

export function ExportButton() {
  const { project, scenes } = useStoryboardStore()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (!project || scenes.length === 0) {
      toast.error("项目为空或无场景数据")
      return
    }

    setIsExporting(true)

    try {
      // 调用 API Route，只传递元数据
      const response = await fetch("/api/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project: { title: project.title },
          scenes: scenes.map(s => ({
            shot_number: s.shot_number,
            shot_type: s.shot_type,
            duration_seconds: s.duration_seconds,
            frame: s.frame,
            content: s.content,
            notes: s.notes,
            image_url: s.image_url
          }))
        }),
      })

      if (!response.ok) {
        throw new Error("导出失败")
      }

      // 直接从响应获取 Blob
      const blob = await response.blob()
      
      // 从响应头获取文件名
      const contentDisposition = response.headers.get("Content-Disposition")
      const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/i)
      const filename = filenameMatch ? decodeURIComponent(filenameMatch[1]) : "storyboard.xlsx"

      // 触发浏览器下载
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      
      // 清理
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success("导出成功！")

    } catch (error) {
      console.error("Export failed:", error)
      toast.error("导出遇到问题，请稍后重试")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport} 
      disabled={isExporting || !project}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileSpreadsheet className="h-4 w-4 text-green-600" />
      )}
      {isExporting ? "正在生成..." : "导出 Excel 脚本"}
    </Button>
  )
}