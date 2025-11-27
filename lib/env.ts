import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    POSTGRES_URL: z.string().url(),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    QWEN_API_KEY: z.string().min(1),
    QWEN_BASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32).optional(),
    KIMI_API_KEY: z.string().min(1),
    KIMI_BASE_URL: z.string().url(),
    GOOGLE_API_KEY: z.string().min(1),
  },
  client: {},
  runtimeEnv: {
    POSTGRES_URL: process.env.POSTGRES_URL,
    NODE_ENV: process.env.NODE_ENV,
    QWEN_API_KEY: process.env.QWEN_API_KEY,
    QWEN_BASE_URL: process.env.QWEN_BASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    KIMI_API_KEY: process.env.KIMI_API_KEY,
    KIMI_BASE_URL: process.env.KIMI_BASE_URL,
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

