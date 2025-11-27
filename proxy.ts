import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const key = new TextEncoder().encode(SECRET_KEY);

// 验证 session
async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 公开路由（不需要认证）
  const publicRoutes = ["/login", "/signup"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // 获取 session
  const sessionToken = request.cookies.get("session")?.value;
  const session = sessionToken ? await verifySession(sessionToken) : null;

  // 如果用户未登录且访问受保护的路由，重定向到登录页
  if (!session && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    // 保存原始 URL，登录后可以重定向回来
    if (pathname !== "/") {
      loginUrl.searchParams.set("redirectTo", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 如果用户已登录且访问登录或注册页，重定向到项目页
  if (session && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  // 如果用户已登录且访问根路径，重定向到项目页
  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/projects", request.url));
  }

  // 如果用户未登录且访问根路径，重定向到登录页
  if (!session && pathname === "/") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * 匹配所有路径除了：
     * - _next/static (静态文件)
     * - _next/image (图片优化文件)
     * - favicon.ico (favicon 文件)
     * - public 文件夹中的文件 (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
