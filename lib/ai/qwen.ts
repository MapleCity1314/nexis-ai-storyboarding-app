import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { env } from "../env";

export const qwen = createOpenAICompatible({
    name: 'qwen',
    apiKey: env.QWEN_API_KEY,
    baseURL: env.QWEN_BASE_URL,
})