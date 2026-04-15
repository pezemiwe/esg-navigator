/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  MaterialTopic,
  MetricInput,
  User,
  Sector,
} from "../features/materiality/types";
export interface AssignmentEvent {
  id: string;
  topicId: string;
  topicName: string;
  assignedTo: string;
  previousAssignee?: string;
  assignedBy: string;
  timestamp: string;
}

export const MOCK_USERS: User[] = [
  {
    id: "u1",
    name: "Dr. A. Sustainability",
    role: "Head_Sustainability",
    department: "Sustainability Office",
  },
  { id: "u2", name: "John IT", role: "Manager", department: "IT Security" },
  { id: "u3", name: "Sarah Fac", role: "Manager", department: "Facilities" },
  { id: "u4", name: "Mike Legal", role: "Manager", department: "Legal" },
];

interface MaterialityState {
  currentSector: Sector;
  currentUser: User;

  topics: MaterialTopic[];
  inputs: MetricInput[];

  setSector: (sector: Sector) => void;
  setUser: (userId: string) => void;
  toggleTopic: (id: string) => void;
  addTopic: (topic: MaterialTopic) => void;
  removeTopic: (id: string) => void;
  updateInput: (input: MetricInput) => void;

  submitForApproval: () => void;
  submitTopicForApproval: (topicId: string) => void;
  assignTopic: (
    topicId: string,
    userId: string,
    assignedBy?: string,
    branch?: string,
  ) => void;
  bulkAssignTopics: (
    topicIds: string[],
    userId: string,
    assignedBy: string,
    branch?: string,
  ) => void;
  approveTopic: (topicId: string, role?: string, approverName?: string) => void;
  rejectTopic: (topicId: string) => void;
  setTopics: (topics: MaterialTopic[]) => void;
  assignmentHistory: AssignmentEvent[];

  reset: () => void;
}


export const useMaterialityStore = create<MaterialityState>()(
  persist(
    (set) => ({
      currentSector: "Generic", // Default
      currentUser: MOCK_USERS[0], // Default as Head for now, easy for demo
      topics: [], // Clean slate: Start with no topics
      inputs: [],
      assignmentHistory: [],

      setSector: (sector) => {
        set({ currentSector: sector, topics: [] });
      },

      setUser: (userId) => {
        const user = MOCK_USERS.find((u) => u.id === userId);
        if (user) set({ currentUser: user });
      },

      toggleTopic: (id) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id === id ? { ...t, selected: !t.selected } : t,
          ),
        })),
      addTopic: (topic) =>
        set((state) => ({
          topics: [...state.topics, topic],
        })),
      removeTopic: (id) =>
        set((state) => ({
          topics: state.topics.filter((t) => t.id !== id),
          inputs: state.inputs.filter((i) => i.topicId !== id),
        })),
      updateInput: (input) =>
        set((state) => {
          const exists = state.inputs.find((i) => i.id === input.id);
          if (exists) {
            return {
              inputs: state.inputs.map((i) => (i.id === input.id ? input : i)),
            };
          }
          return { inputs: [...state.inputs, input] };
        }),

      submitForApproval: () =>
        set((state) => ({
          topics: state.topics.map((t) => ({
            ...t,
            approvalStatus: "Submitted",
          })),
        })),

      submitTopicForApproval: (topicId) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id === topicId ? { ...t, approvalStatus: "Submitted" } : t,
          ),
        })),

      assignTopic: (topicId, userId, assignedBy, branch) =>
        set((state) => {
          const topic = state.topics.find((t) => t.id === topicId);
          const event: AssignmentEvent = {
            id: `ae-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            topicId,
            topicName: topic?.name ?? topicId,
            assignedTo: userId,
            previousAssignee: topic?.assignedUserId,
            assignedBy: assignedBy ?? "System",
            timestamp: new Date().toISOString(),
          };
          return {
            topics: state.topics.map((t) =>
              t.id === topicId
                ? {
                    ...t,
                    assignedUserId: userId || undefined,
                    assignedBranch: branch || t.assignedBranch,
                  }
                : t,
            ),
            assignmentHistory: [...state.assignmentHistory, event],
          };
        }),

      bulkAssignTopics: (topicIds, userId, assignedBy) =>
        set((state) => {
          const newEvents: AssignmentEvent[] = topicIds.map((topicId) => {
            const topic = state.topics.find((t) => t.id === topicId);
            return {
              id: `ae-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              topicId,
              topicName: topic?.name ?? topicId,
              assignedTo: userId,
              previousAssignee: topic?.assignedUserId,
              assignedBy,
              timestamp: new Date().toISOString(),
            };
          });
          return {
            topics: state.topics.map((t) =>
              topicIds.includes(t.id)
                ? { ...t, assignedUserId: userId || undefined }
                : t,
            ),
            assignmentHistory: [...state.assignmentHistory, ...newEvents],
          };
        }),

      approveTopic: (topicId, role, approverName) =>
        set((state) => ({
          topics: state.topics.map((t) => {
            if (t.id !== topicId) return t;
            let nextStatus = t.approvalStatus;

            if (
              role === "sustainability_manager" &&
              t.approvalStatus === "Submitted"
            ) {
              nextStatus = "Manager Approved";
            } else if (
              role === "sustainability_approver" &&
              t.approvalStatus === "Manager Approved"
            ) {
              nextStatus = "Internal Audit Approved";
            } else if (
              (role === "board" || role === "executive" || role === "admin") &&
              t.approvalStatus === "Internal Audit Approved"
            ) {
              nextStatus = "Board Approved";
            } else if (!role) {
              if (t.approvalStatus === "Submitted")
                nextStatus = "Manager Approved";
              else if (t.approvalStatus === "Manager Approved")
                nextStatus = "Internal Audit Approved";
              else if (t.approvalStatus === "Internal Audit Approved")
                nextStatus = "Board Approved";
            }
            return {
              ...t,
              approvalStatus: nextStatus as any,
              approvedBy: approverName || t.approvedBy,
              approvedAt: new Date().toISOString(),
            };
          }),
        })),

      rejectTopic: (topicId) =>
        set((state) => ({
          topics: state.topics.map((t) =>
            t.id === topicId ? { ...t, approvalStatus: "Draft" } : t,
          ),
        })),

      setTopics: (newTopics) => set({ topics: newTopics }),

      reset: () =>
        set({
          topics: [],
          inputs: [],
          currentSector: "Generic",
          assignmentHistory: [],
        }),
    }),
    { name: "materiality-store" },
  ),
);
