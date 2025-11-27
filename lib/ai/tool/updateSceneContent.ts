import { tool } from "ai";
import { z } from "zod";
import { db, schema } from "@/lib/db/drizzle";
import { eq } from "drizzle-orm";

const inputSchema = z.object({
  sceneId: z.string().uuid().describe("The UUID of the scene to update (e.g., 550e8400-e29b-41d4-a716-446655440000)"),
  content: z.string().describe("The new text description/script for the scene. This is the main content that describes what happens in this scene."),
  aiThinking: z.string().optional().describe("Optional explanation of why this change was made"),
});

export const updateSceneContentTool = tool({
  description: "Update the text description/script of a storyboard scene. Use this when the user wants to modify, edit, or rewrite the scene's text content.",
  inputSchema,
  execute: async (params) => {
    const { sceneId, content, aiThinking } = params;
    
    try {
      const [updatedScene] = await db
        .update(schema.scenes)
        .set({
          content,
          aiNotes: aiThinking,
          updatedAt: new Date(),
        })
        .where(eq(schema.scenes.id, sceneId))
        .returning();

      if (!updatedScene) {
        throw new Error("Scene not found");
      }

      return { 
        success: true, 
        sceneId,
        content,
        message: `✅ 场景内容已更新\n\n新内容：${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`
      };
    } catch (error) {
      console.error('Error updating scene content:', error);
      return {
        success: false,
        sceneId,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `Failed to update scene ${sceneId}`
      };
    }
  }
});
