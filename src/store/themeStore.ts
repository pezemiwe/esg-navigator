import { create } from "zustand";
import { persist } from "zustand/middleware";
interface ThemeState {
  mode: "lit" | "dark";
  toggleTheme: () => void;
  setTheme: (mode: "lit" | "dark") => void;
}
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: "lit",
      toggleTheme: () =>
        set((state) => {
          const newMode = state.mode === "lit" ? "dark" : "lit";
          if (newMode === "dark") {
            document.documentElement.classList.add("dark");
          } else {
            document.documentElement.classList.remove("dark");
          }
          return { mode: newMode };
        }),
      setTheme: (mode) => {
        if (mode === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        set({ mode });
      },
    }),
    {
      name: "theme-storage",
      onRehydrateStorage: () => (state) => {
        if (state?.mode === "dark") {
          document.documentElement.classList.add("dark");
        }
      },
    },
  ),
);