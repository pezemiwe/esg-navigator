import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockTrainings } from "../features/e-learnings/data/mockData";
import type { Training } from "../features/e-learnings/types";
interface LearningState {
  courses: Training[];
  enrolledCourses: number[]; 
  completedCourses: number[]; 
  startCourse: (courseId: number) => void;
  updateProgress: (courseId: number, progress: number) => void;
  completeCourse: (courseId: number) => void;
  resetProgress: () => void;
  getCourse: (courseId: number) => Training | undefined;
}
export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      courses: mockTrainings,
      enrolledCourses: [],
      completedCourses: [],
      startCourse: (courseId) => {
        set((state) => {
          const course = state.courses.find((c) => c.id === courseId);
          if (!course) return state;
          if (course.status !== "not_started") return state;
          const updatedCourses = state.courses.map((c) =>
            c.id === courseId
              ? { ...c, status: "in_progress" as const, completionRate: 0 }
              : c,
          );
          return {
            courses: updatedCourses,
            enrolledCourses: [...state.enrolledCourses, courseId],
          };
        });
      },
      updateProgress: (courseId, progress) => {
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  completionRate: progress,
                  status: progress >= 100 ? "completed" : "in_progress",
                }
              : c,
          ),
        }));
      },
      completeCourse: (courseId) => {
        set((state) => {
          const isAlreadyCompleted = state.completedCourses.includes(courseId);
          if (isAlreadyCompleted) return state;
          const today = new Date().toISOString().split("T")[0];
          return {
            courses: state.courses.map((c) =>
              c.id === courseId
                ? {
                    ...c,
                    status: "completed",
                    completionRate: 100,
                    completedDate: today,
                  }
                : c,
            ),
            completedCourses: [...state.completedCourses, courseId],
          };
        });
      },
      resetProgress: () => {
        set({
          courses: mockTrainings,
          enrolledCourses: [],
          completedCourses: [],
        });
      },
      getCourse: (courseId) => get().courses.find((c) => c.id === courseId),
    }),
    {
      name: "learning-storage",
    },
  ),
);