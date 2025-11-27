import { tool } from "ai";
import { z } from "zod";
import { db, schema } from "@/lib/db/drizzle";
import { eq } from "drizzle-orm";

const inputSchema = z.object({
  sceneId: z.string().uuid().describe("The UUID of the scene to update"),
  shotNumber: z.string().optional().describe("镜头编号，如 '1', '2', '3A' 等"),
  frame: z.string().optional().describe("画面描述，如 '远景：城市天际线'"),
  shotType: z.string().optional().describe("镜头类型，如 '远景'、'中景'、'近景'、'特写'、'航拍'、'推镜头'、'拉镜头' 等"),
  durationSeconds: z.number().int().positive().optional().describe("镜头时长（秒）"),
  content: z.string().optional().describe("内容描述：镜头中发生的主要情节、动作或对白"),
  notes: z.string().optional().describe("备注：导演或摄影对镜头的补充说明，如运镜方式、特殊要求等"),
});

export const updateSceneDetailsTool = tool({
  description: "Update detailed storyboard information for a scene, including shot number, frame description, shot type, duration, content, and notes. Use this when the user wants to modify specific technical details of a scene.",
  inputSchema,
  execute: async (params) => {
    const { sceneId, shotNumber, frame, shotType, durationSeconds, content, notes } = params;
    
    try {
      // 构建更新对象，只更新提供的字段
      const updates: any = {
        updatedAt: new Date(),
      };
      
      if (shotNumber !== undefined) updates.shotNumber = shotNumber;
      if (frame !== undefined) updates.frame = frame;
      if (shotType !== undefined) updates.shotType = shotType;
      if (durationSeconds !== undefined) updates.durationSeconds = durationSeconds;
      if (content !== undefined) updates.content = content;
      if (notes !== undefined) updates.notes = notes;

      const [updatedScene] = await db
        .update(schema.scenes)
        .set(updates)
        .where(eq(schema.scenes.id, sceneId))
        .returning();

      if (!updatedScene) {
        throw new Error("Scene not found");
      }

      // 构建更新摘要
      const updatedFields = [];
      if (shotNumber !== undefined) updatedFields.push(`镜头编号: ${shotNumber}`);
      if (frame !== undefined) updatedFields.push(`画面: ${frame}`);
      if (shotType !== undefined) updatedFields.push(`镜头类型: ${shotType}`);
      if (durationSeconds !== undefined) updatedFields.push(`时长: ${durationSeconds}秒`);
      if (content !== undefined) updatedFields.push(`内容: ${content.substring(0, 50)}...`);
      if (notes !== undefined) updatedFields.push(`备注: ${notes}`);

      return { 
        success: true, 
        sceneId,
        message: `✅ 场景详细信息已更新\n\n${updatedFields.join('\n')}`
      };
    } catch (error) {
      console.error('Error updating scene details:', error);
      return {
        success: false,
        sceneId,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: `❌ 更新场景详细信息失败`
      };
    }
  }
});
