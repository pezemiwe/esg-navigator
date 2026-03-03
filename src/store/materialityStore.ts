import { create } from "zustand";
import { MOCK_TOPICS } from "../features/materiality/types";
import type {
  MaterialTopic,
  MetricInput,
  User,
  Sector,
} from "../features/materiality/types";

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
  assignTopic: (topicId: string, userId: string) => void;
  approveTopic: (topicId: string) => void;
  setTopics: (topics: MaterialTopic[]) => void; // New action for direct setting

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

export const useMaterialityStore = create<MaterialityState>((set) => ({
  currentSector: "Generic", // Default
  currentUser: MOCK_USERS[0], // Default as Head for now, easy for demo
  topics: [], // Clean slate: Start with no topics
  inputs: [],

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
      topics: state.topics.map((t) => ({ ...t, approvalStatus: "Submitted" })),
    })),

  assignTopic: (topicId, userId) =>
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === topicId ? { ...t, assignedUserId: userId } : t,
      ),
    })),

  approveTopic: (topicId) =>
    set((state) => ({
      topics: state.topics.map((t) =>
        t.id === topicId ? { ...t, approvalStatus: "Approved" } : t,
      ),
    })),

  setTopics: (newTopics) => set({ topics: newTopics }),

  reset: () =>
    set({ topics: MOCK_TOPICS, inputs: [], currentSector: "Generic" }),
}));
