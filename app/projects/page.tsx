import { redirect } from 'next/navigation'
import { Sidebar } from "@/components/layout/sidebar"
import { ProjectCard } from "@/components/projects/project-card"
import { CreateProjectDialog } from "@/components/projects/create-project-dialog"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getCurrentUser } from "@/lib/auth/get-user"
import { db, schema } from "@/lib/db/drizzle"
import { eq, and, desc } from "drizzle-orm"

export default async function ProjectsPage() {
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
        eq(schema.projects.isDeleted, 0)
      )
    )
    .orderBy(desc(schema.projects.updatedAt))

  return (
    <div className="flex h-screen bg-background">
      <Sidebar user={user} />
      <main className="flex-1 overflow-auto">
        <div className="border-b bg-card/50 px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">项目</h1>
              <p className="text-muted-foreground mt-1">
                管理您的故事板项目
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/projects/trash">
                <Button variant="outline" size="sm">
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
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  回收站
                </Button>
              </Link>
              <CreateProjectDialog />
            </div>
          </div>
        </div>

        <div className="p-8">
          {projects && projects.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
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
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">暂无项目</h3>
              <p className="text-muted-foreground mb-6 max-w-sm">
                创建您的第一个故事板项目，开始使用 AI 辅助创作
              </p>
              <CreateProjectDialog />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
