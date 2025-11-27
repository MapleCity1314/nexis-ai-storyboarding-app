import { redirect } from "next/navigation"
import { SettingsForm } from "@/components/settings/settings-form"
import { Sidebar } from "@/components/layout/sidebar"
import { getCurrentUser } from "@/lib/auth/get-user"

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    return redirect("/login")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-2xl space-y-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">设置</h2>
            <p className="text-muted-foreground">管理您的个人资料和应用偏好。</p>
          </div>
          <SettingsForm user={user} />
        </div>
      </main>
    </div>
  )
}
