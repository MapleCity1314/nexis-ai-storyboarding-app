"use client"

import type React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { signup } from "@/app/actions/auth"

interface SignupFormProps extends React.ComponentPropsWithoutRef<"div"> {
  redirectTo?: string;
}

export function SignupForm({ className, redirectTo = "/projects", ...props }: SignupFormProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSignup(formData: FormData) {
    setLoading(true)
    setMessage(null)
    
    // 添加 redirectTo 到 formData
    formData.append("redirectTo", redirectTo);
    
    try {
      const result = await signup(formData)
      if (result?.error) {
        setMessage(result.error)
        setLoading(false)
      }
      // 如果没有错误，说明注册成功，redirect 会自动跳转
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
        <h1 className="text-2xl font-bold">创建账号</h1>
        <p className="text-balance text-sm text-muted-foreground">
          输入您的信息以创建 Nexis 账号
        </p>
      </div>
      <form className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="name">姓名（可选）</Label>
          <Input 
            id="name" 
            name="name" 
            type="text" 
            placeholder="张三" 
          />
        </div>
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
          <Label htmlFor="password">密码</Label>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="至少 6 个字符"
            minLength={6}
            required 
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">确认密码</Label>
          <Input 
            id="confirmPassword" 
            name="confirmPassword" 
            type="password" 
            placeholder="再次输入密码"
            minLength={6}
            required 
          />
        </div>
        {message && (
          <p className={cn(
            "text-sm text-center",
            message.includes("成功") ? "text-green-500" : "text-red-500"
          )}>
            {message}
          </p>
        )}
        <Button 
          type="submit" 
          formAction={handleSignup} 
          disabled={loading}
          className="w-full"
        >
          {loading ? "注册中..." : "注册"}
        </Button>
      </form>
      <div className="text-center text-sm">
        已有账号？{" "}
        <Link href="/login" className="underline underline-offset-4 hover:text-primary">
          立即登录
        </Link>
      </div>
    </div>
  )
}
