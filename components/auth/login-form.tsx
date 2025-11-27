"use client"

import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { login } from "@/app/actions/auth"

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  redirectTo?: string;
}

export function LoginForm({ className, redirectTo = "/projects", ...props }: LoginFormProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleLogin(formData: FormData) {
    setLoading(true)
    setMessage(null)
    
    // 添加 redirectTo 到 formData
    formData.append("redirectTo", redirectTo);
    
    try {
      const result = await login(formData)
      if (result?.error) {
        setMessage(result.error)
        setLoading(false)
      }
      // 如果没有错误，说明登录成功，redirect 会自动跳转
      // 不需要 setLoading(false)，因为页面会跳转
    } catch (e: any) {
      // 忽略 NEXT_REDIRECT 错误，这是正常的重定向
      if (e?.digest?.startsWith("NEXT_REDIRECT")) {
        return
      }
      setMessage("发生未知错误")
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-bold">欢迎回来</h1>
        <p className="text-balance text-sm text-muted-foreground">
          输入您的邮箱和密码以登录 Nexis
        </p>
      </div>
      <form className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">邮箱</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">密码</Label>
          </div>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="输入密码"
            required 
          />
        </div>
        {message && (
          <p className="text-sm text-red-500 text-center">{message}</p>
        )}
        <Button 
          type="submit" 
          formAction={handleLogin} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "登录中..." : "登录"}
        </Button>
      </form>
      <div className="text-center text-sm">
        还没有账号？{" "}
        <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
          立即注册
        </Link>
      </div>
    </div>
  )
}
