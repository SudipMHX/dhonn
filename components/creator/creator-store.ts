"use client"

import { create } from "zustand"
import { toast } from "sonner"

import {
  completeCreatorUpload,
  getCreatorCategories,
  getCreatorDashboardPage,
  mutateCreatorUpload,
  startCreatorUpload,
  updateCreatorProfile,
} from "@/lib/actions/dashboard"

export type CreatorUpload = {
  _id: string
  title: string
  description: string
  category: { slug: string } | null
  categoryName: string
  tags: string[]
  status: string
  moderationNote: string
  createdAt: string
  publishedAt: string | null
}

export type CreatorCategory = { name: string; slug: string }
export type CreatorUploadDraft = {
  title: string
  description: string
  category: string
  tags: string
}

type CreatorStore = {
  items: CreatorUpload[]
  search: string
  debouncedSearch: string
  status: string
  limit: number
  cursors: Array<string | null>
  nextCursor: string | null
  hasMore: boolean
  error: string
  loadedRequestKey: string | null
  categories: CreatorCategory[]
  categoryError: string
  categoriesLoaded: boolean
  uploadBusy: boolean
  rightsConfirmed: boolean
  profileSaving: boolean
  profileName: string | null
  editingUploadId: string | null
  confirmRemoveUploadId: string | null
  removingUploadId: string | null
  savingUploadId: string | null
  uploadDrafts: Record<string, CreatorUploadDraft>
  setSearch: (value: string) => void
  setDebouncedSearch: (value: string) => void
  setStatus: (value: string) => void
  setLimit: (value: number) => void
  setRightsConfirmed: (value: boolean) => void
  setProfileName: (value: string) => void
  setEditingUploadId: (value: string | null) => void
  setConfirmRemoveUploadId: (value: string | null) => void
  setRemovingUploadId: (value: string | null) => void
  initializeUploadDraft: (id: string, value: CreatorUploadDraft) => void
  updateUploadDraft: (
    id: string,
    field: keyof CreatorUploadDraft,
    value: string
  ) => void
  notifyError: (message: string) => void
  loadPage: () => Promise<void>
  loadCategories: () => Promise<void>
  mutateUpload: (
    uploadId: string,
    method: "PATCH" | "DELETE",
    body?: Record<string, unknown>
  ) => Promise<boolean>
  upload: (input: Record<string, unknown>, file: File) => Promise<boolean>
  saveProfile: (input: Record<string, unknown>) => Promise<string | null>
  goToNextPage: () => void
  goToPreviousPage: () => void
}

function getRequestKey(state: CreatorStore) {
  return JSON.stringify([
    state.debouncedSearch,
    state.status,
    state.limit,
    state.cursors[state.cursors.length - 1] ?? null,
  ])
}

export const useCreatorStore = create<CreatorStore>((set, get) => ({
  items: [],
  search: "",
  debouncedSearch: "",
  status: "all",
  limit: 25,
  cursors: [null],
  nextCursor: null,
  hasMore: false,
  error: "",
  loadedRequestKey: null,
  categories: [],
  categoryError: "",
  categoriesLoaded: false,
  uploadBusy: false,
  rightsConfirmed: false,
  profileSaving: false,
  profileName: null,
  editingUploadId: null,
  confirmRemoveUploadId: null,
  removingUploadId: null,
  savingUploadId: null,
  uploadDrafts: {},
  setSearch: (search) => set({ search }),
  setDebouncedSearch: (debouncedSearch) =>
    set({ debouncedSearch, cursors: [null] }),
  setStatus: (status) => set({ status, cursors: [null] }),
  setLimit: (limit) => set({ limit, cursors: [null] }),
  setRightsConfirmed: (rightsConfirmed) => set({ rightsConfirmed }),
  setProfileName: (profileName) => set({ profileName }),
  setEditingUploadId: (editingUploadId) => set({ editingUploadId }),
  setConfirmRemoveUploadId: (confirmRemoveUploadId) =>
    set({ confirmRemoveUploadId }),
  setRemovingUploadId: (removingUploadId) => set({ removingUploadId }),
  initializeUploadDraft: (id, value) =>
    set((state) => ({
      uploadDrafts: { ...state.uploadDrafts, [id]: value },
    })),
  updateUploadDraft: (id, field, value) =>
    set((state) => ({
      uploadDrafts: {
        ...state.uploadDrafts,
        [id]: { ...state.uploadDrafts[id], [field]: value },
      },
    })),
  notifyError: (message) => toast.error(message),
  loadPage: async () => {
    const current = get()
    const key = getRequestKey(current)
    if (current.loadedRequestKey === key) return
    try {
      const result = await getCreatorDashboardPage({
        q: current.debouncedSearch,
        status: current.status,
        limit: current.limit,
        after: current.cursors[current.cursors.length - 1] ?? null,
      })
      if (getRequestKey(get()) !== key) return
      if (!result.items.length && current.cursors.length > 1) {
        set((state) => ({ cursors: state.cursors.slice(0, -1) }))
        return
      }
      set({
        items: result.items.map((item) => ({
          ...item,
          tags: Array.isArray(item.tags)
            ? item.tags.filter((tag): tag is string => typeof tag === "string")
            : [],
        })) as CreatorUpload[],
        nextCursor: result.nextCursor,
        hasMore: result.hasMore,
        error: "",
        loadedRequestKey: key,
      })
    } catch (cause) {
      if (getRequestKey(get()) !== key) return
      set({
        items: [],
        nextCursor: null,
        hasMore: false,
        error:
          cause instanceof Error
            ? cause.message
            : "Could not load your uploads.",
        loadedRequestKey: key,
      })
    }
  },
  loadCategories: async () => {
    if (get().categoriesLoaded) return
    try {
      const categories = (await getCreatorCategories()) as CreatorCategory[]
      set({ categories, categoryError: "", categoriesLoaded: true })
    } catch (cause) {
      set({
        categoryError:
          cause instanceof Error
            ? cause.message
            : "Categories could not be loaded.",
        categoriesLoaded: true,
      })
    }
  },
  mutateUpload: async (uploadId, method, body) => {
    set({ savingUploadId: uploadId })
    try {
      const result = await mutateCreatorUpload(
        method === "DELETE" ? "delete" : "update",
        uploadId,
        body
      )
      if (!result.ok) throw new Error(result.error)
      toast.success(method === "DELETE" ? "Upload removed." : "Changes saved.")
      set((state) => ({
        items: state.items.flatMap((item) => {
          if (item._id !== uploadId) return [item]
          if (method === "DELETE") return []
          if (state.status !== "all" && state.status !== "pending") return []

          const categorySlug =
            typeof body?.category === "string"
              ? body.category
              : (item.category?.slug ?? "")
          const categoryName =
            state.categories.find((category) => category.slug === categorySlug)
              ?.name ?? item.categoryName
          const tags = Array.isArray(body?.tags)
            ? body.tags.filter((tag): tag is string => typeof tag === "string")
            : item.tags
          return [
            {
              ...item,
              title: typeof body?.title === "string" ? body.title : item.title,
              description:
                typeof body?.description === "string"
                  ? body.description
                  : item.description,
              category: { slug: categorySlug },
              categoryName,
              tags,
              status: "pending",
              moderationNote: "",
              publishedAt: null,
            },
          ]
        }),
      }))
      return true
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Update failed.")
      return false
    } finally {
      set({ savingUploadId: null })
    }
  },
  upload: async (input, file) => {
    set({ uploadBusy: true })
    try {
      const result = await startCreatorUpload(input)
      if (!result.ok) throw new Error(result.error)
      let uploadResponse: Response
      try {
        uploadResponse = await fetch(result.ticket.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": result.ticket.contentType },
          body: file,
        })
      } catch {
        throw new Error(
          `The storage request failed. If this is a CORS error, allow PUT from ${window.location.origin} with the Content-Type request header in the R2 bucket policy, then try again.`
        )
      }
      if (!uploadResponse.ok)
        throw new Error(
          "The audio file could not be uploaded. Check the storage CORS settings and try again."
        )
      const completion = await completeCreatorUpload(result.ticket.soundId)
      if (!completion.ok) throw new Error(completion.error)
      const title = typeof input.title === "string" ? input.title : ""
      const categorySlug =
        typeof input.category === "string" ? input.category : ""
      set((state) => {
        const shouldInsert =
          state.loadedRequestKey === getRequestKey(state) &&
          state.cursors.length === 1 &&
          !state.debouncedSearch &&
          (state.status === "all" || state.status === "pending")
        if (!shouldInsert) return { rightsConfirmed: false }

        const newUpload: CreatorUpload = {
          _id: result.ticket.soundId,
          title,
          description:
            typeof input.description === "string" ? input.description : "",
          category: { slug: categorySlug },
          categoryName:
            state.categories.find((category) => category.slug === categorySlug)
              ?.name ?? "",
          tags: Array.isArray(input.tags)
            ? input.tags.filter((tag): tag is string => typeof tag === "string")
            : [],
          status: "pending",
          moderationNote: "",
          createdAt: new Date().toISOString(),
          publishedAt: null,
        }
        const items = [newUpload, ...state.items].slice(0, state.limit)
        const overflowed = state.items.length >= state.limit
        const lastItem = items[items.length - 1]
        const nextCursor =
          overflowed && lastItem
            ? `${new Date(lastItem.createdAt).getTime().toString(36)}.${lastItem._id}`
            : state.nextCursor
        return {
          rightsConfirmed: false,
          items,
          hasMore: state.hasMore || overflowed,
          nextCursor,
        }
      })
      toast.success(
        "Your sound is uploaded and waiting for moderator approval."
      )
      return true
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "The upload failed.")
      return false
    } finally {
      set({ uploadBusy: false })
    }
  },
  saveProfile: async (input) => {
    set({ profileSaving: true })
    try {
      const result = await updateCreatorProfile(input)
      if (!result.ok) throw new Error(result.error)
      set({ profileName: result.name })
      toast.success("Your settings have been saved.")
      return result.name
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Unable to save your settings."
      )
      return null
    } finally {
      set({ profileSaving: false })
    }
  },
  goToNextPage: () =>
    set((state) =>
      !state.hasMore || !state.nextCursor
        ? state
        : { cursors: [...state.cursors, state.nextCursor] }
    ),
  goToPreviousPage: () =>
    set((state) =>
      state.cursors.length <= 1
        ? state
        : { cursors: state.cursors.slice(0, -1) }
    ),
}))
