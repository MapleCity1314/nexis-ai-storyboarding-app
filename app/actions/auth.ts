"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { db, schema } from "@/lib/db/drizzle"
import { eq } from "drizzle-orm"
import { hashPassword, verifyPassword } from "@/lib/auth/password"
import { createSession, deleteSession } from "@/lib/auth/session"

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = (formData.get("redirectTo") as string) || "/projects"

  if (!email || !password) {
    return { error: "请输入邮箱和密码" }
  }

  try {
    // 查找用户
    const [user] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1)

    if (!user) {
      return { error: "邮箱或密码错误" }
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return { error: "邮箱或密码错误" }
    }

    // 创建 session
    await createSession(user.id, user.email)

    revalidatePath("/", "layout")
    redirect(redirectTo)
  } catch (error) {
    console.error("Login error:", error)
    return { error: "登录失败，请稍后重试" }
  }
}

export async function signup(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const name = formData.get("name") as string
  const redirectTo = (formData.get("redirectTo") as string) || "/projects"

  if (!email || !password) {
    return { error: "请输入邮箱和密码" }
  }

  if (password.length < 6) {
    return { error: "密码至少需要 6 个字符" }
  }

  if (confirmPassword && password !== confirmPassword) {
    return { error: "两次输入的密码不一致" }
  }

  // 验证邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { error: "请输入有效的邮箱地址" }
  }

  try {
    // 检查用户是否已存在
    const [existingUser] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1)

    if (existingUser) {
      return { error: "该邮箱已被注册" }
    }

    // 创建新用户
    const passwordHash = await hashPassword(password)
    const [newUser] = await db
      .insert(schema.users)
      .values({
        email,
        passwordHash,
        name: name || null,
      })
      .returning()

    // 创建 session
    await createSession(newUser.id, newUser.email)

    revalidatePath("/", "layout")
    redirect(redirectTo)
  } catch (error) {
    console.error("Signup error:", error)
    return { error: "注册失败，请稍后重试" }
  }
}

export async function signOut() {
  await deleteSession()
  redirect("/login")
}
