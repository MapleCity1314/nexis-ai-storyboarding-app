import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

/**
 * 首页 - 根据用户登录状态重定向
 * - 已登录：重定向到 /projects
 * - 未登录：重定向到 /login
 */
export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect("/projects");
  } else {
    redirect("/login");
  }
}
