"use client"

import { useState } from "react"
import { 
    Loader2, ChevronDown, ChevronRight, CheckCircle2, 
    AlertCircle, Terminal, FileIcon, LinkIcon, BrainCircuit 
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface AiMessageProps {
  message: any
  isLoading: boolean
}

export function AiMessage({ message, isLoading }: AiMessageProps) {
  const isUser = message.role === "user"

  return (
    <div
      className={cn(
        "flex w-full gap-4 p-2 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* 头像 */}
      <div className={cn(
          "flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full border shadow-sm",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted/50 text-foreground"
      )}>
        {isUser ? (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        ) : (
             <SparklesIcon className="h-4 w-4 text-purple-500" />
        )}
      </div>

      {/* 消息体 */}
      <div className={cn(
          "flex min-w-0 max-w-[85%] flex-col gap-2",
          isUser ? "items-end" : "items-start"
      )}>
        {/* 用户名 */}
        <span className="text-[10px] text-muted-foreground/60 px-1">
            {isUser ? "You" : "Nexis AI"}
        </span>

        {/* 内容气泡 */}
        <div className={cn(
            "relative min-w-0 w-full overflow-hidden rounded-2xl px-4 py-3 text-sm shadow-sm",
            isUser 
                ? "bg-primary text-primary-foreground rounded-tr-sm" 
                : "bg-muted/30 border border-border/50 text-foreground rounded-tl-sm"
        )}>
           {/* Message Parts */}
           {message.parts?.map((part: any, index: number) => (
             <MessagePart key={index} part={part} />
           ))}
           
           {/* AI 正在输入的动画 */}
           {isLoading && !isUser && message.parts?.length === 0 && (
                <div className="flex items-center gap-1 h-6">
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-foreground/40 rounded-full animate-bounce"></span>
                </div>
           )}
        </div>
      </div>
    </div>
  )
}

function MessagePart({ part }: { part: any }) {
    // 1. 纯文本
    if (part.type === "text") {
        return (
            <div className="prose prose-sm dark:prose-invert max-w-none break-words leading-relaxed">
                <ReactMarkdown>{part.text}</ReactMarkdown>
            </div>
        )
    }

    // 2. 思考过程 (Reasoning)
    if (part.type === "reasoning") {
        return <ReasoningBlock text={part.text} />
    }

    // 3. 工具调用 (Tool Call)
    if (part.type?.startsWith("tool-")) {
        return <ToolCallBlock part={part} />
    }
    
    // 4. 文件上传
    if (part.type === "file") {
        return (
            <div className="flex items-center gap-3 rounded-md bg-background/50 p-2 border border-border/50 my-1">
                <div className="p-2 bg-primary/10 rounded-md">
                     <FileIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col overflow-hidden">
                    <span className="truncate text-xs font-medium">{part.filename}</span>
                    <span className="text-[10px] text-muted-foreground">{part.mediaType}</span>
                </div>
            </div>
        )
    }

    return null
}

// 子组件：思考过程折叠块
function ReasoningBlock({ text }: { text: string }) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full my-1">
            <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 gap-2 px-0 text-xs text-muted-foreground hover:text-foreground">
                    <BrainCircuit className="h-3 w-3" />
                    <span>{isOpen ? "收起思考过程" : "查看 AI 思考过程"}</span>
                    <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="mt-1 rounded-md bg-muted/50 p-3 text-xs text-muted-foreground border-l-2 border-primary/20 font-mono">
                    {text}
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}

// 子组件：工具调用展示块 (Timeline Style)
function ToolCallBlock({ part }: { part: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const toolName = part.type.replace("tool-", "")
    const isError = part.state === "output-error"
    const isComplete = part.state === "output-available"
    const isLoading = part.state === "input-streaming" || part.state === "input-available"

    const displayName = getToolDisplayName(toolName)

    return (
        <div className="my-2 text-xs">
            {/* 状态行 */}
            <div 
                className={cn(
                    "flex items-center gap-2 py-1.5 transition-colors rounded-md px-2 -mx-2",
                    isOpen ? "bg-muted/50" : "hover:bg-muted/30"
                )}
            >
                {isLoading && <Loader2 className="h-3 w-3 animate-spin text-primary" />}
                {isComplete && <CheckCircle2 className="h-3 w-3 text-green-500" />}
                {isError && <AlertCircle className="h-3 w-3 text-red-500" />}
                
                <span className="font-medium text-muted-foreground flex-1 truncate">
                    {displayName}
                </span>

                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="text-muted-foreground/50 hover:text-foreground transition-colors p-1"
                >
                    {isOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                </button>
            </div>

            {/* 详情展开 */}
            {isOpen && (
                <div className="mt-1 ml-1 pl-3 border-l border-border/50 space-y-2 py-1 animate-in slide-in-from-top-1 fade-in duration-200">
                    {/* Input */}
                    <div className="max-w-full overflow-hidden">
                        <div className="text-[10px] uppercase text-muted-foreground/50 font-bold mb-0.5">Input</div>
                        <div className="font-mono bg-background/50 rounded border border-border/50 p-2 overflow-auto max-h-[200px] text-[10px] text-muted-foreground break-all">
                            {JSON.stringify(part.input, null, 2)}
                        </div>
                    </div>
                    {/* Output */}
                    {isComplete && (
                        <div className="max-w-full overflow-hidden">
                             <div className="text-[10px] uppercase text-muted-foreground/50 font-bold mb-0.5">Result</div>
                             <div className="font-mono bg-background/50 rounded border border-border/50 p-2 overflow-auto max-h-[200px] text-[10px] text-muted-foreground break-all">
                                {typeof part.output === 'string' ? part.output : JSON.stringify(part.output, null, 2)}
                             </div>
                        </div>
                    )}
                    {isError && (
                         <div className="text-red-500 bg-red-500/10 p-2 rounded text-xs border border-red-500/20 break-words">
                            {part.errorText}
                         </div>
                    )}
                </div>
            )}
        </div>
    )
}

function SparklesIcon(props: any) {
    return (
        <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      </svg>
    )
}

function getToolDisplayName(name: string) {
    const map: Record<string, string> = {
        getScenes: "读取当前场景列表",
        generateImage: "正在绘制场景图片",
        updateSceneDetails: "更新场景属性",
        updateSceneContent: "修改脚本内容",
        addScene: "添加新场景",
    }
    return map[name] || `调用工具: ${name}`
}