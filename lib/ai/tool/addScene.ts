import { tool } from "ai";
import { z } from "zod";
import { db, schema } from "@/lib/db/drizzle";
import { fromDrizzleScene } from "@/types";

const inputSchema = z.object({
  projectId: z.string().uuid().describe("The UUID of the project to add the scene to"),
  content: z.string().describe("Initial text description/script for the new scene"),
  orderIndex: z.number().int().min(0).describe("The position/order index for the new scene (0-based, use the next available index)"),
});

export const addSceneTool = tool({
  description: "Add a new scene to the storyboard. Use this when the user wants to create, add, or insert a new scene into the project.",
  inputSchema,
  execute: async (params) => {
    const { projectId, content, orderIndex } = params;
    
    try {
      const [newScene] = await db
        .insert(schema.scenes)
        .values({
          projectId,
          orderIndex,
          content,
        })
        .returning();

      if (!newScene) {
        throw new Error("Failed to create scene");
      }

      return { 
        success: true, 
        scene: fromDrizzleScene(newScene),
        message: `✅ 新场景已添加\n\n位置：第 ${orderIndex + 1} 个\n内容：${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`
      };
    } catch (error) {
      console.error('Error adding scene:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to add new scene'
      };
    }
  }
});
