import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { env } from "../env";

export const kimi = createOpenAICompatible({
    name: 'kimi',
    apiKey: env.KIMI_API_KEY,
    baseURL: env.KIMI_BASE_URL,
})