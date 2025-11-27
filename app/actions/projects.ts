'use server'

import { db, schema } from "@/lib/db/drizzle"
import { eq, and } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { requireUser } from "@/lib/auth/get-user"

export async function createProject(formData: FormData) {
    const user = await requireUser()

    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!title) {
        throw new Error("Title is required")
    }

    const [project] = await db
        .insert(schema.projects)
        .values({
            userId: user.id,
            title,
            description: description || null,
        })
        .returning()

    revalidatePath('/projects')
    return project.id
}

export async function deleteProject(projectId: string) {
    const user = await requireUser()

    await db
        .update(schema.projects)
        .set({
            isDeleted: 1,
            deletedAt: new Date(),
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(schema.projects.id, projectId),
                eq(schema.projects.userId, user.id)
            )
        )

    revalidatePath('/projects')
}

export async function restoreProject(projectId: string) {
    const user = await requireUser()

    await db
        .update(schema.projects)
        .set({
            isDeleted: 0,
            deletedAt: null,
            updatedAt: new Date(),
        })
        .where(
            and(
                eq(schema.projects.id, projectId),
                eq(schema.projects.userId, user.id)
            )
        )

    revalidatePath('/projects')
    revalidatePath('/projects/trash')
}

export async function permanentDeleteProject(projectId: string) {
    const user = await requireUser()

    await db
        .delete(schema.projects)
        .where(
            and(
                eq(schema.projects.id, projectId),
                eq(schema.projects.userId, user.id)
            )
        )

    revalidatePath('/projects/trash')
}
