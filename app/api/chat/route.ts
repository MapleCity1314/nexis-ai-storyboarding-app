import { openai } from "@ai-sdk/openai"
import { convertToModelMessages, stepCountIs, streamText } from "ai"
import { generateImageTool, updateSceneContentTool, updateSceneDetailsTool, addSceneTool, getScenesTool } from "@/lib/ai/tool"
import { qwen } from "@/lib/ai/qwen"
import { getScenes } from "@/app/actions/scenes"
import { kimi } from "@/lib/ai/kimi"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, projectId } = await req.json()

  // 获取当前项目信息和场景列表
  let projectInfoBlock = "未获取到项目信息";
  let sceneDataBlock = "暂无场景数据";
  let currentImageSize = "1024*1024"; // 默认兜底
  
  if (projectId) {
    try {
      // 获取项目信息
      const { db, schema } = await import("@/lib/db/drizzle")
      const { eq } = await import("drizzle-orm")
      // 获取项目
      const [project] = await db
        .select()
        .from(schema.projects)
        .where(eq(schema.projects.id, projectId))
        .limit(1)
      
      if (project) {
        currentImageSize = project.imageSize || "1328*1328";
        projectInfoBlock = `
- **Project ID**: ${projectId} (UUID)
- **项目名称**: ${project.title}
- **全局图片尺寸**: ${currentImageSize}
`;
      }

      // 获取场景 - 优化为 JSON 格式或 Markdown 表格，模型解析更精准
      const scenes = await getScenes(projectId)
      if (scenes.length > 0) {
        sceneDataBlock = scenes.map((s, i) => 
          `- 序号: ${i + 1} | ID: ${s.id} | 内容: "${s.content?.slice(0, 20)}..." | 镜头: ${s.shot_number || '无'}`
        ).join("\n")
      }
    } catch (error) {
      console.error("Failed to fetch info:", error)
    }
  }

  // 2. 优化后的系统提示词
  const systemMessage = {
    role: "system" as const,
    content: `
# Role
你是 Nexis AI，一个精通影视视听语言的专业分镜脚本助手。你的核心目标是协助用户管理分镜项目、编写场景并生成画面。

# Context (当前环境状态)
## 项目概况
${projectInfoBlock}

## 场景列表索引 (重要参照)
${sceneDataBlock}
*(注意：当用户提到"第N个场景"时，请务必参照上方列表查找对应的真实 UUID)*

# Tools Definition (工具调用规范)
你拥有以下工具，必须严格按照定义使用：

1.  **getScenes**: 
    - *何时使用*: 当你不确定最新场景列表，或者用户引用的场景（如"最后一个场景"）不在你的当前上下文中时，**必须**先调用此工具。
    
2.  **addScene**: 
    - *参数*: projectId (必须完全匹配上方 Project ID), content (场景描述), orderIndex (新场景的索引位置)。
    - *逻辑*: 默认为追加模式，orderIndex = 当前场景总数。

3.  **updateSceneDetails**: 
    - *作用*: 修改元数据（镜头号、机位、时长、备注等）。
    - *参数*: sceneId (必须是真实的 UUID)。

4.  **updateSceneContent**: 
    - *作用*: 仅修改剧本/脚本内容文本。
    - *参数*: sceneId (必须是真实的 UUID)。

5.  **generateImage**: 
    - *作用*: 基于场景描述生成图片。
    - *参数*: 
        - sceneId: 真实 UUID。
        - prompt: 基于场景内容优化后的英文绘画提示词（需包含风格、光影、构图描述）。
        - imageSize: 必须严格从以下列表中选择最接近项目尺寸的值: ["1024*1024", "720*1280", "1280*720", "768*1152"]。如果不匹配，请选择最接近的一个。

# Protocol (思维协议 - 必须遵守)
在回复用户之前，请执行以下思维步骤：

1.  **意图识别**: 用户是想"查"、"增"、"改" 还是 "画"？
2.  **ID 校验**: 
    - 涉及到具体场景的操作时，检查是否拥有该场景的 UUID。
    - 如果用户说"修改第3个场景"，**绝不要**猜测 ID。如果你现在的 [场景列表索引] 里没有第3个场景的数据，或者数据看起来过期了，先调用 \`getScenes\`。
    - ❌ 禁止使用 "scene-1", "temp-id" 等假 ID。
    - ✅ 只能使用 36位 UUID (如 550e8400-e29b...)。
3.  **参数填充**: 确保所有工具调用的参数类型正确。
4.  **执行**: 调用工具。

# Tone (语气)
- 保持专业、简洁。
- 在执行操作前不需要罗嗦，直接调用工具即可。
- 如果操作成功，简短告知结果。
`
  }

  // const result = streamText({
  //   model: qwen("qwen-plus"),
  //   messages: [systemMessage, ...convertToModelMessages(messages)],
  //   tools: {
  //     getScenes: getScenesTool,
  //     addScene: addSceneTool,
  //     updateSceneDetails: updateSceneDetailsTool,
  //     updateSceneContent: updateSceneContentTool,
  //     generateImage: generateImageTool,
  //   },
  //   stopWhen: stepCountIs(20),
  //   temperature: 0.7,
  // })

  try {
    const convertedMessages = convertToModelMessages(messages)
    console.log('[Server] Converted messages count:', convertedMessages.length)
    console.log('[Server] Last message:', JSON.stringify(convertedMessages[convertedMessages.length - 1], null, 2))
    
    const result = streamText({
      model: kimi("kimi-k2-0905-preview"),
      messages: [systemMessage, ...convertedMessages],
      tools: {
        getScenes: getScenesTool,
        addScene: addSceneTool,
        updateSceneDetails: updateSceneDetailsTool,
        updateSceneContent: updateSceneContentTool,
        generateImage: generateImageTool,
      },
      stopWhen: stepCountIs(20),
      temperature: 0.7,
      maxRetries: 2, 
      onFinish: async ({ text, toolCalls, toolResults, finishReason, usage }) => {
        console.log('[Server] ===== Generation Finished =====')
        console.log('[Server] Finish reason:', finishReason)
        console.log('[Server] Tool calls count:', toolCalls?.length || 0)
        if (toolCalls && toolCalls.length > 0) {
          console.log('[Server] Tool calls:', JSON.stringify(toolCalls, null, 2))
        }
        console.log('[Server] Tool results count:', toolResults?.length || 0)
        if (toolResults && toolResults.length > 0) {
          console.log('[Server] Tool results:', JSON.stringify(toolResults, null, 2))
        }
        console.log('[Server] Usage:', usage)
        console.log('[Server] ================================')
      },
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('[Server] Error in chat route:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        type: 'error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}
