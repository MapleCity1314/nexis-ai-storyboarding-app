import { tool } from "ai";
import z from "zod";
import { env } from "@/lib/env";

// 图片生成参数
const inputSchema = z.object({
  sceneId: z.string().uuid().describe("The UUID of the scene to generate an image for (e.g., 550e8400-e29b-41d4-a716-446655440000)"),
  prompt: z
    .string()
    .max(2000)
    .describe("The detailed visual description for the image generation"),
  imageSize: z
    .enum(["1024*1024", "720*1280", "1280*720", "768*1152"])
    .default("1024*1024")
    .describe("Image size in pixels. Supported sizes: 1024*1024 (square), 720*1280 (portrait), 1280*720 (landscape), 768*1152 (portrait)"),
});

// 使用通义万相生成图片
async function generateImageWithQwen(params: {
  prompt: string;
  imageSize: string;
}): Promise<{ url: string; prompt: string }> {
  try {
    console.log('[generateImageWithQwen] Starting image generation...');
    console.log('[generateImageWithQwen] Prompt:', params.prompt.substring(0, 100));
    console.log('[generateImageWithQwen] Image size:', params.imageSize);
    
    const size = params.imageSize;
    
    // 调用通义万相 API
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.QWEN_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable', // 异步模式
      },
      body: JSON.stringify({
        model: 'wanx-v1', // 通义万相模型
        input: {
          prompt: params.prompt,
        },
        parameters: {
          size: size,
          n: 1,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generateImageWithQwen] API error:', errorText);
      throw new Error(`通义万相 API 错误: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    console.log('[generateImageWithQwen] API response:', JSON.stringify(result, null, 2));
    
    // 异步任务，需要轮询结果
    const taskId = result.output?.task_id;
    if (!taskId) {
      throw new Error('未获取到任务 ID');
    }
    
    console.log('[generateImageWithQwen] Task ID:', taskId);
    console.log('[generateImageWithQwen] Polling for result...');
    
    // 轮询任务状态
    let attempts = 0;
    const maxAttempts = 30; // 最多等待 30 秒
    
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 1 秒
      
      const statusResponse = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${env.QWEN_API_KEY}`,
        },
      });
      
      if (!statusResponse.ok) {
        throw new Error(`查询任务状态失败: ${statusResponse.status}`);
      }
      
      const statusResult = await statusResponse.json();
      console.log('[generateImageWithQwen] Task status:', statusResult.output?.task_status);
      
      if (statusResult.output?.task_status === 'SUCCEEDED') {
        const imageUrl = statusResult.output?.results?.[0]?.url;
        if (!imageUrl) {
          throw new Error('未获取到图片 URL');
        }
        
        console.log('[generateImageWithQwen] Image generated successfully');
        console.log('[generateImageWithQwen] Image URL:', imageUrl);
        
        return {
          url: imageUrl,
          prompt: params.prompt,
        };
      } else if (statusResult.output?.task_status === 'FAILED') {
        throw new Error(`图片生成失败: ${statusResult.output?.message || '未知错误'}`);
      }
      
      attempts++;
    }
    
    throw new Error('图片生成超时，请重试');
  } catch (error) {
    console.error('[generateImageWithQwen] Error:', error);
    throw error;
  }
}

// 下载图片并转换为 base64
async function downloadImageAsBase64(url: string): Promise<string> {
  try {
    console.log('[downloadImageAsBase64] Downloading image from:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`下载图片失败: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');
    
    // 获取 MIME 类型
    const contentType = response.headers.get('content-type') || 'image/png';
    
    console.log('[downloadImageAsBase64] Image downloaded successfully');
    console.log('[downloadImageAsBase64] Content type:', contentType);
    console.log('[downloadImageAsBase64] Size:', buffer.length, 'bytes');
    
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('[downloadImageAsBase64] Error:', error);
    throw error;
  }
}

export const generateImageTool = tool({
  description: "Generate an AI image for a specific storyboard scene using Alibaba Cloud Tongyi Wanxiang (通义万相). The generated image will be saved to the scene automatically. IMPORTANT: Only use the exact supported image sizes: 1024*1024, 720*1280, 1280*720, or 768*1152. Do NOT use any other sizes or formats.",
  inputSchema,
  execute: async ({ sceneId, prompt, imageSize }) => {
    console.log(`[generateImageTool] Starting image generation for scene ${sceneId}`);
    console.log(`[generateImageTool] Image size: ${imageSize}`);
    
    try {
      // 1. 使用通义万相生成图片
      console.log(`[generateImageTool] Calling Tongyi Wanxiang API...`);
      const imageData = await generateImageWithQwen({
        prompt,
        imageSize,
      });
      console.log(`[generateImageTool] Image URL received:`, imageData.url);

      // 2. 下载图片并转换为 base64
      console.log(`[generateImageTool] Downloading and converting image to base64...`);
      const base64Image = await downloadImageAsBase64(imageData.url);
      console.log(`[generateImageTool] Image converted to base64 successfully`);

      // 3. 保存 base64 图片到数据库
      console.log(`[generateImageTool] Saving base64 image to database...`);
      const { updateScene } = await import("@/app/actions/scenes");
      await updateScene(sceneId, {
        image_url: base64Image,
      } as any);
      console.log(`[generateImageTool] Image saved to database`);

      // 4. 返回结果
      const result = {
        success: true,
        sceneId,
        imageUrl: base64Image.substring(0, 50) + '...', // 截断避免响应过大
        message: `✅ 图片已生成并保存\n\n使用通义万相生成`
      };
      console.log(`[generateImageTool] Returning success result`);
      return result;
    } catch (error) {
      console.error('[generateImageTool] Error:', error);
      
      // 返回详细的错误信息，但确保总是返回一个有效的结果对象
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      const errorResult = {
        success: false,
        sceneId,
        error: errorMessage,
        message: `❌ 图片生成失败\n\n原因：${errorMessage}\n\n💡 提示：\n1. 确认通义千问 API Key 是否有效\n2. 检查是否开通了通义万相服务\n3. 访问 https://dashscope.console.aliyun.com/ 查看服务状态`
      };
      console.log(`[generateImageTool] Returning error result:`, errorResult);
      return errorResult;
    }
  }
});