"use client"

import React, { useRef, useState, useEffect } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { Send, Square, Paperclip, Mic, Sparkles, ArrowUp } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AiInputProps {
  onSubmit: (message: string) => void
  onStop: () => void
  isLoading: boolean
  placeholder?: string
  allowAttachments?: boolean
}

export function AiInput({
  onSubmit,
  onStop,
  isLoading,
  placeholder = "描述你的想法，或者让 AI 修改场景...",
  allowAttachments = true,
}: AiInputProps) {
  const [input, setInput] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 重置高度的函数
  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  // 当组件挂载或重新显示时，重置高度
  useEffect(() => {
    resetHeight()
  }, [])

  // 自动聚焦
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isLoading])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!input.trim() || isLoading) return
    onSubmit(input.trim())
    setInput("")
    // 提交后重置高度
    setTimeout(resetHeight, 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="w-full px-4 pb-4 pt-2">
      <div className={cn(
        "relative flex flex-col rounded-xl border bg-background transition-all duration-200 ease-in-out",
        isFocused ? "border-primary/50 ring-4 ring-primary/5 shadow-lg" : "border-border shadow-sm hover:border-primary/20"
      )}>
        {/* 文本输入区域 */}
        <TextareaAutosize
          ref={textareaRef}
          tabIndex={0}
          onKeyDown={handleKeyDown}
          rows={1}
          maxRows={8}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="min-h-[50px] w-full resize-none bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground/60 focus:outline-none scrollbar-hide"
        />

        {/* 底部工具栏 */}
        <div className="flex items-center justify-between px-2 pb-2">
          {/* 左侧功能区 */}
          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={0}>
              {allowAttachments && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">上传参考图</TooltipContent>
                </Tooltip>
              )}
              
               <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">语音输入</TooltipContent>
                </Tooltip>
            </TooltipProvider>
          </div>

          {/* 右侧发送区 */}
          <div className="flex items-center gap-3">
             {/* 快捷键提示 */}
            {isFocused && input.length > 0 && (
                <span className="hidden text-[10px] text-muted-foreground/50 sm:inline-block animate-in fade-in">
                    Enter 发送
                </span>
            )}

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="stop"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg bg-muted text-foreground hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                    onClick={onStop}
                  >
                    <Square className="h-3 w-3 fill-current" />
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="send"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                >
                  <Button
                    size="icon"
                    onClick={() => handleSubmit()}
                    disabled={!input.trim()}
                    className={cn(
                      "h-8 w-8 rounded-lg transition-all duration-200",
                      input.trim() 
                        ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" 
                        : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                    )}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <div className="mt-2 text-center text-[10px] text-muted-foreground/40">
        AI Generated content may be inaccurate.
      </div>
    </div>
  )
}