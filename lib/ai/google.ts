import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { env } from '@/lib/env';

export const google = createGoogleGenerativeAI({
  apiKey: env.GOOGLE_API_KEY,
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
  // 如果需要代理，可以在这里配置
  // fetch: (url, init) => {
  //   return fetch(url, {
  //     ...init,
  //     // 添加代理配置
  //   });
  // }
});
