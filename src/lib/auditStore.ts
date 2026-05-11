import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface FormState {
  teamSize: number;
  useCase: string;
  tools: { tool: string; plan: string; monthlySpend: number; seats: number }[];
}

interface AuditStore {
  formState: FormState;
  setFormState: (state: Partial<FormState>) => void;
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  setTools: (tools: FormState["tools"]) => void;
  removeTool: (index: number) => void;
  addTool: () => void;
  resetForm: () => void;
}

const initialState: FormState = {
  teamSize: 1,
  useCase: "",
  tools: [{ tool: "", plan: "", monthlySpend: 0, seats: 1 }],
};

export const useAuditStore = create<AuditStore>()(
  persist(
    (set) => ({
      formState: initialState,

      setFormState: (partial) =>
        set((state) => ({
          formState: { ...state.formState, ...partial },
        })),

      setField: (key, value) =>
        set((state) => ({
          formState: { ...state.formState, [key]: value },
        })),

      setTools: (tools) =>
        set((state) => ({
          formState: { ...state.formState, tools },
        })),

      removeTool: (index) =>
        set((state) => ({
          formState: {
            ...state.formState,
            tools: state.formState.tools.filter((_, i) => i !== index),
          },
        })),

      addTool: () =>
        set((state) => ({
          formState: {
            ...state.formState,
            tools: [
              ...state.formState.tools,
              { tool: "", plan: "", monthlySpend: 0, seats: 1 },
            ],
          },
        })),

      resetForm: () => set({ formState: initialState }),
    }),
    {
      name: "audit-form-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
