/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  MaterialTopic,
  MetricInput,
  User,
  Sector,
} from "../features/materiality/types";

// ---------------------------------------------------------------------------
// Assignment audit trail
// ---------------------------------------------------------------------------
export interface AssignmentEvent {
  id: string;
  topicId: string;
  topicName: string;
  assignedTo: string;
  previousAssignee?: string;
  assignedBy: string;
  timestamp: string;
}

// Mock Data for Assignments
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
  // Core Data
  currentSector: Sector;
  currentUser: User;

  // Assessment Data
  topics: MaterialTopic[];
  inputs: MetricInput[];

  // Actions
  setSector: (sector: Sector) => void;
  setUser: (userId: string) => void;
  toggleTopic: (id: string) => void;
  addTopic: (topic: MaterialTopic) => void;
  removeTopic: (id: string) => void;
  updateInput: (input: MetricInput) => void;

  // Workflow Actions
  submitForApproval: () => void;
  submitTopicForApproval: (topicId: string) => void;
  assignTopic: (topicId: string, userId: string, assignedBy?: string) => void;
  bulkAssignTopics: (
    topicIds: string[],
    userId: string,
    assignedBy: string,
  ) => void;
  approveTopic: (topicId: string, role?: string) => void;
  rejectTopic: (topicId: string) => void;
  setTopics: (topics: MaterialTopic[]) => void;
  assignmentHistory: AssignmentEvent[];

  reset: () => void;
}

// Mock Data for MTN
// const MTN_TOPICS: MaterialTopic[] = [
//  {
//    id: "data_privacy",
//    status: "required",
//    selected: true,
//    name: "Data Privacy & Security",
//    description:
//      "Breaches occurring involving personally identifiable information.",
//    dataNeeds: ["Data Breaches", "Affected Customers"],
//    assignedUserId: "u2",
//    impact: 4.5,
//    stakeholderInterest: 4.8,
//  },
//  {
//    id: "energy_mgmt",
//    status: "data-driven",
//    selected: true,
//    name: "Energy Management",
//    description: "Energy consumption and mix in network operations.",
//    dataNeeds: ["Total Energy", "% Renewable", "Grid Electricity"],
//    assignedUserId: "u3",
//    impact: 3.8,
//    stakeholderInterest: 4.2,
//  },
//  {
//    id: "competitive_behavior",
//    status: "required",
//    selected: true,
//    name: "Competitive Behavior",
//    description: "Adherence to anti-competitive behavior regulations.",
//    dataNeeds: ["Monetary Losses", "Legal Proceedings"],
//    assignedUserId: "u4",
//    impact: 4.2,
//    stakeholderInterest: 3.5,
//  },
//  {
//    id: "service_continuity",
//    status: "data-driven",
//    selected: true,
//    name: "Service Continuity",
//    description: "Maintaining service during disruptions.",
//    dataNeeds: ["System Average Interruption Duration", "Frequency"],
//    assignedUserId: "u2",
//    impact: 4.7,
//    stakeholderInterest: 4.9,
//  },
//  {
//    id: "labor_practices",
//    status: "data-driven",
//    selected: true,
//    name: "Labor Practices",
//    description: "Fair labor practices in supply chain.",
//    dataNeeds: ["Incidents", "Audits"],
//    assignedUserId: "u3",
//    impact: 3.2,
//    stakeholderInterest: 3.8,
//  },
// ];

export const useMaterialityStore = create<MaterialityState>()(
  persist(
    (set) => ({
      currentSector: "Generic", // Default
      currentUser: MOCK_USERS[0], // Default as Head for now, easy for demo
      topics: [], // Clean slate: Start with no topics
      inputs: [],
      assignmentHistory: [],

      setSector: (sector) => {
        // Clean slate behavior: Don't auto-load mock data based on sector for now
        // let newTopics = MOCK_TOPICS;
        // if (sector === "Telecommunications") newTopics = MTN_TOPICS;
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

      // Workflow Implementation
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

      assignTopic: (topicId, userId, assignedBy) =>
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
                ? { ...t, assignedUserId: userId || undefined }
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

      approveTopic: (topicId, role) =>
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
              (role === "executive" || role === "admin") &&
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
            return { ...t, approvalStatus: nextStatus as any };
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
