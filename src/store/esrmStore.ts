import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PendingTask } from "../features/esrm/types";

interface EsrmState {
  projects: any[];
  tasks: PendingTask[];
  currentProjectId: string | null;
  setCurrentProject: (id: string | null) => void;
  addProject: (project: any) => void;
  updateProject: (id: string | number, updates: any) => void;
  addTask: (task: PendingTask) => void;
  removeTask: (id: string) => void;
}

export const useEsrmStore = create<EsrmState>()(
  persist(
    (set) => ({
      projects: [],
      tasks: [],
      currentProjectId: null,
      setCurrentProject: (id) => set({ currentProjectId: id }),
      addProject: (p) => set((state) => ({ projects: [p, ...state.projects] })),
      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates } : p,
          ),
        })),
      addTask: (t) => set((state) => ({ tasks: [t, ...state.tasks] })),
      removeTask: (id) =>
        set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),
    }),
    {
      name: "esrm-storage",
    },
  ),
);
