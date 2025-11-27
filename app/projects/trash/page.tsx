import { redirect } from 'next/navigation'
import { Sidebar } from "@/components/layout/sidebar"
import { TrashProjectCard } from "@/components/projects/trash-project-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth/get-user"
import { db, schema } from "@/lib/db/drizzle"
import { eq, and, desc } from "drizzle-orm"

export default async function TrashPage() {
  const user = await getCurrentUser()

  if (!user) {
    return redirect("/login")
  }

  const projects = await db
    .select()
    .from(schema.projects)
    .where(
      and(
        eq(schema.projects.userId, user.id),
        eq(schema.projects.isDeleted, 1)
      )
    )
    .orderBy(desc(schema.projects.deletedAt))

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="border-b bg-card/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">回收站</h1>
              <p className="text-muted-foreground mt-1">
                恢复或永久删除已删除的项目
              </p>
            </div>
            <Link href="/projects">
              <Button variant="outline" size="sm">
                返回项目
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-8">
          {projects && projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <TrashProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="rounded-full bg-muted p-6 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-muted-foreground"
                >
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">回收站为空</h3>
              <p className="text-muted-foreground">
                已删除的项目会显示在这里
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
