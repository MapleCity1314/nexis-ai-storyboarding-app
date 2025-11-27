// 从 Drizzle schema 导入类型
import type { Project as DrizzleProject, Scene as DrizzleScene } from "@/lib/db/schema";

// 导出类型，转换为应用层使用的格式
export type Project = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_size: string;
  created_at: string;
  updated_at: string;
};

export type Scene = {
  id: string;
  project_id: string;
  order_index: number;
  content: string | null;
  image_url: string | null;
  ai_notes: string | null;
  // 分镜详细字段
  shot_number: string | null;
  frame: string | null;
  shot_type: string | null;
  duration_seconds: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// 辅助函数：将 Drizzle 类型转换为应用类型
export function toDrizzleProject(project: Project): DrizzleProject {
  return {
    id: project.id,
    userId: project.user_id,
    title: project.title,
    description: project.description,
    createdAt: new Date(project.created_at),
    updatedAt: new Date(project.updated_at),
  };
}

export function fromDrizzleProject(project: DrizzleProject): Project {
  return {
    id: project.id,
    user_id: project.userId,
    title: project.title,
    description: project.description,
    image_size: project.imageSize || "1328*1328",
    created_at: project.createdAt.toISOString(),
    updated_at: project.updatedAt.toISOString(),
  };
}

export function toDrizzleScene(scene: Scene): DrizzleScene {
  return {
    id: scene.id,
    projectId: scene.project_id,
    orderIndex: scene.order_index,
    content: scene.content,
    imageUrl: scene.image_url,
    aiNotes: scene.ai_notes,
    createdAt: new Date(scene.created_at),
    updatedAt: new Date(scene.updated_at),
  };
}

export function fromDrizzleScene(scene: DrizzleScene): Scene {
  return {
    id: scene.id,
    project_id: scene.projectId,
    order_index: scene.orderIndex,
    content: scene.content,
    image_url: scene.imageUrl,
    ai_notes: scene.aiNotes,
    shot_number: scene.shotNumber,
    frame: scene.frame,
    shot_type: scene.shotType,
    duration_seconds: scene.durationSeconds,
    notes: scene.notes,
    created_at: scene.createdAt.toISOString(),
    updated_at: scene.updatedAt.toISOString(),
  };
}
