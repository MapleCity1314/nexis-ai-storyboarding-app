"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { User } from "@/lib/db/schema"

interface SettingsFormProps {
  user: User
}

export function SettingsForm({ user }: SettingsFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" value={user.email} disabled className="bg-muted" />
        <p className="text-[0.8rem] text-muted-foreground">邮箱地址无法更改。</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">姓名</Label>
        <Input id="name" value={user.name || ""} disabled className="bg-muted" />
        <p className="text-[0.8rem] text-muted-foreground">姓名在注册时设置。</p>
      </div>

      <div className="space-y-2">
        <Label>账号创建时间</Label>
        <Input value={new Date(user.createdAt).toLocaleDateString('zh-CN')} disabled className="bg-muted" />
      </div>
    </div>
  )
}
