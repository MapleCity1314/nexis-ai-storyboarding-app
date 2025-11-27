"use client"

import { useChat } from "@ai-sdk/react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useStoryboardStore } from "@/lib/store/storyboard-store"
import { useEffect, useRef, useState } from "react"
import { PanelRightClose, PanelRightOpen, MessageSquarePlus, Sparkles } from "lucide-react"
import { DefaultChatTransport } from "ai"
import { AiMessage } from "./ai-message"
import { AiInput } from "./ai-input"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface AiChatProps {
  projectId: string
}

export function AiChat({ projectId }: AiChatProps) {
  const { refreshScenes, setGeneratingImage } = useStoryboardStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const processedToolCallsRef = useRef<Set<string>>(new Set())

  const {
    messages,
    sendMessage,
    status,
    stop,
  } = useChat({
    id: projectId,
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: () => ({ projectId }),
    }),
    async onToolCall({ toolCall }) {
      console.log("[Client] Tool call received:", toolCall.toolName, toolCall.toolCallId)
      
      // 客户端副作用：设置加载状态
      if (toolCall.toolName === "tool-generateImage" && 'args' in toolCall) {
        const args = toolCall.args as any
        console.log("[Client] Setting generating image for scene:", args?.sceneId)
        setGeneratingImage(args?.sceneId)
      }
      
      // 工具在服务端执行，客户端不需要返回结果
      // 服务端会通过流式响应自动发送工具结果
    },
    onError: (error) => {
      console.error("[Client] Chat error:", error)
      setGeneratingImage(null)
    },
    //maxSteps: 5, // 允许多步工具调用
  })

  // Auto-scroll effect
  useEffect(() => {
    if (bottomRef.current) {
        bottomRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, status])

  // Refresh scenes on tool completion
  useEffect(() => {
    // 检查所有消息中是否有新完成的工具调用
    let hasNewCompletedTool = false
    const newToolCallIds: string[] = []
    
    for (const message of messages) {
      if (message?.role === "assistant" && message?.parts) {
        const completedTools = message.parts.filter(
          (part: any) => {
            const isCompleted = part.type?.startsWith("tool-") && part.state === "output-available"
            const toolCallId = part.toolCallId || `${message.id}-${part.type}`
            
            // 检查是否是新完成的工具调用
            if (isCompleted && !processedToolCallsRef.current.has(toolCallId)) {
              newToolCallIds.push(toolCallId)
              return true
            }
            return false
          }
        )
        
        if (completedTools.length > 0) {
          hasNewCompletedTool = true
          console.log("[AiChat] New tool completed:", completedTools.map((t: any) => t.type))
        }
      }
    }
    
    // 当有新完成的工具且流式传输结束时，刷新场景
    if (hasNewCompletedTool && status !== "streaming") {
      console.log("[AiChat] Streaming finished, refreshing scenes...")
      
      // 标记这些工具调用为已处理
      newToolCallIds.forEach(id => processedToolCallsRef.current.add(id))
      
      // 刷新场景数据
      refreshScenes()
      setGeneratingImage(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, status])


  const isLoading = status === "streaming"

  // Suggestions for empty state
  const suggestions = [
      "为所有场景生成图片",
      "把第3个场景改成特写镜头",
      "添加一个结尾场景，主角看着夕阳",
  ]

  return (
    <div 
        className={cn(
            "relative flex h-full flex-col border-l bg-card/50 backdrop-blur-sm transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
            isCollapsed ? "w-[60px]" : "w-[400px]"
        )}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b px-3">
        {!isCollapsed && (
            <div className="flex items-center gap-2 animate-in fade-in duration-300">
                 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4" />
                 </div>
                 <div>
                    <h3 className="text-sm font-semibold leading-none">AI 助手</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Story Copilot</p>
                 </div>
            </div>
        )}
        
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn("text-muted-foreground hover:text-foreground", isCollapsed && "mx-auto")}
            title={isCollapsed ? "展开" : "折叠"}
        >
            {isCollapsed ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Content Area */}
      {!isCollapsed && (
        <>
            {/* Messages Container with fixed height */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full px-4 py-4" ref={scrollRef}>
                    {messages.length === 0 ? (
                        // Empty State
                        <div className="flex h-full flex-col items-center justify-center space-y-6 opacity-0 animate-in fade-in slide-in-from-bottom-4 duration-700 mt-10">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-background to-muted border shadow-xl">
                                <MessageSquarePlus className="h-8 w-8 text-primary/80" />
                            </div>
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="font-semibold text-lg">有什么我可以帮你的？</h3>
                            <p className="text-sm text-muted-foreground max-w-[240px]">
                                我可以帮你生成画面、修改剧本或整理分镜结构。
                            </p>
                        </div>
                        
                        {/* Suggestions Chips */}
                        <div className="flex flex-col gap-2 w-full max-w-[280px]">
                            {suggestions.map((text, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage({ role: "user", parts: [{ type: "text", text }] })}
                                    className="text-xs text-left px-3 py-2.5 rounded-lg bg-muted/40 hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20 truncate"
                                >
                                    ✨ "{text}"
                                </button>
                            ))}
                        </div>
                    </div>
                    ) : (
                        // Chat List
                        <div className="space-y-6 pb-4">
                            {messages.map((m: any) => (
                                <AiMessage key={m.id} message={m} isLoading={isLoading && m.id === messages[messages.length - 1].id} />
                            ))}
                            <div ref={bottomRef} /> 
                        </div>
                    )}
                </ScrollArea>
            </div>

            {/* Input Area */}
            <div className="border-t bg-background/50 backdrop-blur-sm flex-shrink-0">
                <AiInput 
                    key={isCollapsed ? 'collapsed' : 'expanded'} 
                    onSubmit={(val) => sendMessage({ role: "user", parts: [{ type: "text", text: val }] })} 
                    onStop={stop} 
                    isLoading={isLoading} 
                />
            </div>
        </>
      )}
      
      {/* Collapsed Vertical Text (Optional) */}
      {isCollapsed && (
        <div className="flex-1 flex flex-col items-center py-4 gap-4 text-muted-foreground">
            <div className="writing-vertical-rl text-xs tracking-widest font-medium opacity-50 select-none">
                AI ASSISTANT
            </div>
        </div>
      )}
    </div>
  )
}