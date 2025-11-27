import { notFound, redirect } from "next/navigation"
import { EditorClient } from "@/components/editor/editor-client"
import { getScenes } from "@/app/actions/scenes"
import { getCurrentUser } from "@/lib/auth/get-user"
import { db, schema } from "@/lib/db/drizzle"
import { eq, and } from "drizzle-orm"
import { fromDrizzleProject } from "@/types"

interface EditorPageProps {
  params: Promise<{ id: string }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user) {
    return redirect("/login")
  }

  // 获取项目并验证所有权
  const [projectData] = await db
    .select()
    .from(schema.projects)
    .where(
      and(
        eq(schema.projects.id, id),
        eq(schema.projects.userId, user.id),
        eq(schema.projects.isDeleted, 0)
      )
    )
    .limit(1)

  if (!projectData) {
    return notFound()
  }

  const project = fromDrizzleProject(projectData)
  const scenes = await getScenes(id)

  return <EditorClient project={project} initialScenes={scenes} user={user} />
}
