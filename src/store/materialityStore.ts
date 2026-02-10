import { create } from "zustand";
import { MOCK_TOPICS } from "../features/materiality/types";
import type { MaterialTopic, MetricInput } from "../features/materiality/types";

interface MaterialityState {
  topics: MaterialTopic[];
  inputs: MetricInput[];
  toggleTopic: (id: string) => void;
  addTopic: (topic: MaterialTopic) => void;
  removeTopic: (id: string) => void;
  updateInput: (input: MetricInput) => void;
  reset: () => void;
}

export const useMaterialityStore = create<MaterialityState>((set) => ({
  topics: MOCK_TOPICS,
  inputs: [],
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
  reset: () => set({ topics: MOCK_TOPICS, inputs: [] }),
}));
