import { create } from "zustand"
import type { Project, Scene } from "@/types"
import { createScene, updateScene, deleteScene, getScenes } from "@/app/actions/scenes"

interface StoryboardState {
  project: Project | null
  scenes: Scene[]
  selectedSceneId: string | null
  isLoading: boolean
  generatingImageForScene: string | null // 正在生成图片的场景ID

  setProject: (project: Project) => void
  setScenes: (scenes: Scene[]) => void
  selectScene: (id: string | null) => void
  setGeneratingImage: (sceneId: string | null) => void

  addScene: () => Promise<void>
  updateSceneField: (id: string, field: keyof Scene, value: any) => void
  saveScene: (id: string) => Promise<void>
  removeScene: (id: string) => Promise<void>
  refreshScenes: () => Promise<void>
  reorderScenes: (sceneIds: string[]) => Promise<void>
  moveSceneUp: (id: string) => Promise<void>
  moveSceneDown: (id: string) => Promise<void>
}

export const useStoryboardStore = create<StoryboardState>((set, get) => ({
  project: null,
  scenes: [],
  selectedSceneId: null,
  isLoading: false,
  generatingImageForScene: null,

  setProject: (project) => set({ project }),
  setScenes: (scenes) => set({ scenes }),
  selectScene: (id) => set({ selectedSceneId: id }),
  setGeneratingImage: (sceneId) => set({ generatingImageForScene: sceneId }),

  addScene: async () => {
    const { project, scenes } = get()
    if (!project) return

    const newOrderIndex = scenes.length > 0 ? Math.max(...scenes.map((s) => s.order_index)) + 1 : 0

    // Optimistic update
    const tempId = `temp-${Date.now()}`
    const optimisitcScene: Scene = {
      id: tempId,
      project_id: project.id,
      order_index: newOrderIndex,
      content: "",
      image_url: null,
      ai_notes: null,
      shot_number: null,
      frame: null,
      shot_type: null,
      duration_seconds: null,
      notes: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    set({ scenes: [...scenes, optimisitcScene] })

    try {
      const newScene = await createScene(project.id, newOrderIndex)
      set((state) => ({
        scenes: state.scenes.map((s) => (s.id === tempId ? newScene : s)),
      }))
    } catch (error) {
      console.error("Failed to add scene", error)
      // Revert on failure
      set((state) => ({
        scenes: state.scenes.filter((s) => s.id !== tempId),
      }))
    }
  },

  updateSceneField: (id, field, value) => {
    set((state) => ({
      scenes: state.scenes.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    }))
  },

  saveScene: async (id) => {
    const { scenes } = get()
    const scene = scenes.find((s) => s.id === id)
    if (!scene) return

    try {
      await updateScene(id, {
        content: scene.content,
        image_url: scene.image_url,
        ai_notes: scene.ai_notes,
      })
    } catch (error) {
      console.error("Failed to save scene", error)
    }
  },

  removeScene: async (id) => {
    const { scenes } = get()
    // Optimistic update
    set({ scenes: scenes.filter((s) => s.id !== id) })

    try {
      await deleteScene(id)
    } catch (error) {
      console.error("Failed to delete scene", error)
      // Revert
      set({ scenes })
    }
  },

  refreshScenes: async () => {
    const { project } = get()
    if (!project) return

    try {
      const scenes = await getScenes(project.id)
      set({ scenes })
    } catch (error) {
      console.error("Failed to refresh scenes", error)
    }
  },

  reorderScenes: async (sceneIds) => {
    const { scenes } = get()
    const oldScenes = [...scenes]

    // 重新排序场景
    const reorderedScenes = sceneIds
      .map((id) => scenes.find((s) => s.id === id))
      .filter((s): s is Scene => s !== undefined)
      .map((scene, index) => ({ ...scene, order_index: index }))

    // 乐观更新
    set({ scenes: reorderedScenes })

    try {
      // 批量更新 order_index
      await Promise.all(
        reorderedScenes.map((scene) =>
          updateScene(scene.id, { order_index: scene.order_index })
        )
      )
    } catch (error) {
      console.error("Failed to reorder scenes", error)
      // 回滚
      set({ scenes: oldScenes })
    }
  },

  moveSceneUp: async (id) => {
    const { scenes } = get()
    const index = scenes.findIndex((s) => s.id === id)
    if (index <= 0) return

    const newScenes = [...scenes]
    ;[newScenes[index - 1], newScenes[index]] = [newScenes[index], newScenes[index - 1]]

    await get().reorderScenes(newScenes.map((s) => s.id))
  },

  moveSceneDown: async (id) => {
    const { scenes } = get()
    const index = scenes.findIndex((s) => s.id === id)
    if (index < 0 || index >= scenes.length - 1) return

    const newScenes = [...scenes]
    ;[newScenes[index], newScenes[index + 1]] = [newScenes[index + 1], newScenes[index]]

    await get().reorderScenes(newScenes.map((s) => s.id))
  },
}))
