import { tool } from "ai";
import { z } from "zod";
import { getScenes } from "@/app/actions/scenes";

const inputSchema = z.object({
  projectId: z.string().uuid().describe("The UUID of the project to get scenes from"),
});

export const getScenesTool = tool({
  description: "Get all scenes from the current project. Use this when you need to check what scenes exist, their content, order, or details before performing operations.",
  inputSchema,
  execute: async (params) => {
    const { projectId } = params;
    
    try {
      const scenes = await getScenes(projectId);
      
      if (scenes.length === 0) {
        return {
          success: true,
          scenes: [],
          message: "📋 当前项目没有场景\n\n建议：可以使用 addScene 工具创建新场景"
        };
      }

      const scenesList = scenes.map((scene, index) => ({
        position: index + 1,
        id: scene.id,
        content: scene.content || "(空)",
        shotNumber: scene.shot_number || "未设置",
        frame: scene.frame || "未设置",
        shotType: scene.shot_type || "未设置",
        durationSeconds: scene.duration_seconds || "未设置",
        notes: scene.notes || "未设置",
        hasImage: !!scene.image_url,
        // 不返回完整的 imageUrl，避免 base64 数据占用大量 tokens
      }));

      const summary = `📋 当前项目共有 ${scenes.length} 个场景\n\n` +
        scenesList.map(s => 
          `场景 ${s.position} (ID: ${s.id}):
  - 内容: ${s.content}
  - 镜头编号: ${s.shotNumber}
  - 画面: ${s.frame}
  - 镜头类型: ${s.shotType}
  - 时长: ${s.durationSeconds}${typeof s.durationSeconds === 'number' ? '秒' : ''}
  - 备注: ${s.notes}
  - 图片: ${s.hasImage ? '✅ 已生成' : '❌ 未生成'}`
        ).join('\n\n');

      return {
        success: true,
        scenes: scenesList,
        count: scenes.length,
        message: summary
      };
    } catch (error) {
      console.error('Error getting scenes:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: '❌ 获取场景列表失败'
      };
    }
  }
});
