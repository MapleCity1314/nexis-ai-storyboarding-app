"use server"

import { db, schema } from "@/lib/db/drizzle"
import { eq, asc } from "drizzle-orm"
import type { Scene } from "@/types"
import { fromDrizzleScene } from "@/types"

export async function getScenes(projectId: string): Promise<Scene[]> {
  try {
    const result = await db
      .select()
      .from(schema.scenes)
      .where(eq(schema.scenes.projectId, projectId))
      .orderBy(asc(schema.scenes.orderIndex));

    return result.map(fromDrizzleScene);
  } catch (error) {
    console.error("Error fetching scenes:", error);
    throw new Error("Failed to fetch scenes");
  }
}

export async function createScene(projectId: string, orderIndex: number): Promise<Scene> {
  try {
    const [newScene] = await db
      .insert(schema.scenes)
      .values({
        projectId,
        orderIndex,
        content: "",
      })
      .returning();

    return fromDrizzleScene(newScene);
  } catch (error) {
    console.error("Error creating scene:", error);
    throw new Error("Failed to create scene");
  }
}

export async function updateScene(id: string, updates: Partial<Scene>): Promise<Scene> {
  try {
    // 转换字段名从 snake_case 到 camelCase
    const drizzleUpdates: any = {};
    if (updates.content !== undefined) drizzleUpdates.content = updates.content;
    if (updates.image_url !== undefined) drizzleUpdates.imageUrl = updates.image_url;
    if (updates.ai_notes !== undefined) drizzleUpdates.aiNotes = updates.ai_notes;
    if (updates.order_index !== undefined) drizzleUpdates.orderIndex = updates.order_index;
    if (updates.shot_number !== undefined) drizzleUpdates.shotNumber = updates.shot_number;
    if (updates.frame !== undefined) drizzleUpdates.frame = updates.frame;
    if (updates.shot_type !== undefined) drizzleUpdates.shotType = updates.shot_type;
    if (updates.duration_seconds !== undefined) drizzleUpdates.durationSeconds = updates.duration_seconds;
    if (updates.notes !== undefined) drizzleUpdates.notes = updates.notes;
    
    drizzleUpdates.updatedAt = new Date();

    const [updatedScene] = await db
      .update(schema.scenes)
      .set(drizzleUpdates)
      .where(eq(schema.scenes.id, id))
      .returning();

    if (!updatedScene) {
      throw new Error("Scene not found");
    }

    return fromDrizzleScene(updatedScene);
  } catch (error) {
    console.error("Error updating scene:", error);
    throw new Error("Failed to update scene");
  }
}

export async function deleteScene(id: string): Promise<void> {
  try {
    await db
      .delete(schema.scenes)
      .where(eq(schema.scenes.id, id));
  } catch (error) {
    console.error("Error deleting scene:", error);
    throw new Error("Failed to delete scene");
  }
}
