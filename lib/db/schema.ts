import { pgTable, text, timestamp, integer, uuid } from "drizzle-orm/pg-core";

// Users 表
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Projects 表
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  imageSize: text("image_size").default("1328*1328"), // 图片尺寸
  isDeleted: integer("is_deleted").default(0).notNull(), // 0 = false, 1 = true
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Scenes 表
export const scenes = pgTable("scenes", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  
  // 基础字段
  content: text("content"), // 内容描述
  imageUrl: text("image_url"), // 图片URL
  aiNotes: text("ai_notes"), // AI备注
  
  // 分镜详细字段
  shotNumber: text("shot_number"), // 镜头编号
  frame: text("frame"), // 画面描述
  shotType: text("shot_type"), // 镜头类型（远景、中景、近景等）
  durationSeconds: integer("duration_seconds"), // 时长（秒）
  notes: text("notes"), // 备注
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 类型导出
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Scene = typeof scenes.$inferSelect;
export type NewScene = typeof scenes.$inferInsert;
