"use client"

import { create } from "zustand"
import { toast } from "sonner"

import {
  getAdminDashboardPage,
  mutateAdminDashboard,
  type AdminDashboardAction,
  type DashboardListInput,
} from "@/lib/actions/dashboard"

export type AdminRecord = Record<string, unknown>
export type AdminSection =
  "sounds" | "uploads" | "reports" | "categories" | "users"

export type SoundRemovalTarget = {
  soundId: string
  title: string
}

export type AdminSoundDraft = {
  title: string
  description: string
  tags: string
}

export type AdminSectionState = {
  rows: AdminRecord[]
  error: string
  search: string
  debouncedSearch: string
  status: string
  limit: number
  cursors: Array<string | null>
  nextCursor: string | null
  hasMore: boolean
  revision: number
  loadedRequestKey: string | null
}

type AdminStore = {
  sections: Record<AdminSection, AdminSectionState>
  categoryName: string
  categoryDescription: string
  pendingRemoval: SoundRemovalTarget | null
  editingSoundId: string | null
  soundDrafts: Record<string, AdminSoundDraft>
  mutationCounts: Record<string, number>
  removingSound: boolean
  setSearch: (section: AdminSection, value: string) => void
  setDebouncedSearch: (section: AdminSection, value: string) => void
  setStatus: (section: AdminSection, value: string) => void
  setLimit: (section: AdminSection, value: number) => void
  setCategoryName: (value: string) => void
  setCategoryDescription: (value: string) => void
  setPendingRemoval: (value: SoundRemovalTarget | null) => void
  setEditingSoundId: (value: string | null) => void
  initializeSoundDraft: (id: string, value: AdminSoundDraft) => void
  updateSoundDraft: (
    id: string,
    field: keyof AdminSoundDraft,
    value: string
  ) => void
  setRemovingSound: (value: boolean) => void
  load: (section: AdminSection) => Promise<void>
  mutate: (
    section: AdminSection,
    action: AdminDashboardAction,
    id: string,
    payload?: Record<string, unknown>
  ) => Promise<boolean>
  goToNextPage: (section: AdminSection) => void
  goToPreviousPage: (section: AdminSection) => void
}

function initialSection(): AdminSectionState {
  return {
    rows: [],
    error: "",
    search: "",
    debouncedSearch: "",
    status: "all",
    limit: 25,
    cursors: [null],
    nextCursor: null,
    hasMore: false,
    revision: 0,
    loadedRequestKey: null,
  }
}

const sectionNames: AdminSection[] = [
  "sounds",
  "uploads",
  "reports",
  "categories",
  "users",
]

function requestKey(state: AdminSectionState) {
  return JSON.stringify([
    state.debouncedSearch,
    state.status,
    state.limit,
    state.cursors[state.cursors.length - 1] ?? null,
    state.revision,
  ])
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  sections: Object.fromEntries(
    sectionNames.map((section) => [section, initialSection()])
  ) as Record<AdminSection, AdminSectionState>,
  categoryName: "",
  categoryDescription: "",
  pendingRemoval: null,
  editingSoundId: null,
  soundDrafts: {},
  mutationCounts: {},
  removingSound: false,
  setSearch: (section, value) =>
    set((state) => ({
      sections: {
        ...state.sections,
        [section]: { ...state.sections[section], search: value },
      },
    })),
  setDebouncedSearch: (section, value) =>
    set((state) => ({
      sections: {
        ...state.sections,
        [section]: {
          ...state.sections[section],
          debouncedSearch: value,
          cursors: [null],
        },
      },
    })),
  setStatus: (section, value) =>
    set((state) => ({
      sections: {
        ...state.sections,
        [section]: {
          ...state.sections[section],
          status: value,
          cursors: [null],
        },
      },
    })),
  setLimit: (section, value) =>
    set((state) => ({
      sections: {
        ...state.sections,
        [section]: {
          ...state.sections[section],
          limit: value,
          cursors: [null],
        },
      },
    })),
  setCategoryName: (value) => set({ categoryName: value }),
  setCategoryDescription: (value) => set({ categoryDescription: value }),
  setPendingRemoval: (value) => set({ pendingRemoval: value }),
  setEditingSoundId: (value) => set({ editingSoundId: value }),
  initializeSoundDraft: (id, value) =>
    set((state) => ({
      soundDrafts: { ...state.soundDrafts, [id]: value },
    })),
  updateSoundDraft: (id, field, value) =>
    set((state) => ({
      soundDrafts: {
        ...state.soundDrafts,
        [id]: { ...state.soundDrafts[id], [field]: value },
      },
    })),
  setRemovingSound: (value) => set({ removingSound: value }),
  load: async (section) => {
    const current = get().sections[section]
    const key = requestKey(current)
    if (current.loadedRequestKey === key) return
    const input: DashboardListInput = {
      section,
      q: current.debouncedSearch,
      status: current.status,
      limit: current.limit,
      after: current.cursors[current.cursors.length - 1] ?? null,
    }
    try {
      const result = await getAdminDashboardPage(input)
      const latest = get().sections[section]
      if (requestKey(latest) !== key) return
      if (!result.items.length && latest.cursors.length > 1) {
        set((state) => ({
          sections: {
            ...state.sections,
            [section]: {
              ...state.sections[section],
              cursors: state.sections[section].cursors.slice(0, -1),
            },
          },
        }))
        return
      }
      set((state) => ({
        sections: {
          ...state.sections,
          [section]: {
            ...state.sections[section],
            rows: result.items,
            nextCursor: result.nextCursor,
            hasMore: result.hasMore,
            error: "",
            loadedRequestKey: key,
          },
        },
      }))
    } catch (cause) {
      const latest = get().sections[section]
      if (requestKey(latest) !== key) return
      set((state) => ({
        sections: {
          ...state.sections,
          [section]: {
            ...state.sections[section],
            rows: [],
            nextCursor: null,
            hasMore: false,
            error:
              cause instanceof Error
                ? cause.message
                : "Could not load admin data.",
            loadedRequestKey: key,
          },
        },
      }))
    }
  },
  mutate: async (section, action, id, payload) => {
    set((state) => ({
      mutationCounts: {
        ...state.mutationCounts,
        [id]: (state.mutationCounts[id] ?? 0) + 1,
      },
    }))
    try {
      const result = await mutateAdminDashboard(action, id, payload)
      if (!result.ok) throw new Error(result.error)
      toast.success("Changes saved.")
      set((state) => ({
        sections: {
          ...state.sections,
          [section]: {
            ...state.sections[section],
            revision: state.sections[section].revision + 1,
          },
        },
      }))
      return true
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Update failed.")
      return false
    } finally {
      set((state) => ({
        mutationCounts: {
          ...state.mutationCounts,
          [id]: Math.max((state.mutationCounts[id] ?? 1) - 1, 0),
        },
      }))
    }
  },
  goToNextPage: (section) =>
    set((state) => {
      const current = state.sections[section]
      if (!current.hasMore || !current.nextCursor) return state
      return {
        sections: {
          ...state.sections,
          [section]: {
            ...current,
            cursors: [...current.cursors, current.nextCursor],
          },
        },
      }
    }),
  goToPreviousPage: (section) =>
    set((state) => {
      const current = state.sections[section]
      if (current.cursors.length <= 1) return state
      return {
        sections: {
          ...state.sections,
          [section]: {
            ...current,
            cursors: current.cursors.slice(0, -1),
          },
        },
      }
    }),
}))
