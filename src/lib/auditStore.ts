import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface FormState {
  teamSize: number;
  useCase: string;
  tools: { tool: string; plan: string; monthlySpend: number; seats: number }[];
}

interface AuditStore {
  formState: FormState;
  isProcessing: boolean;
  setFormState: (state: Partial<FormState>) => void;
  setField: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  setTools: (tools: FormState["tools"]) => void;
  removeTool: (index: number) => void;
  addTool: () => void;
  resetForm: () => void;
  setIsProcessing: (processing: boolean) => void;
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
      isProcessing: false,

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

      resetForm: () => set({ formState: initialState, isProcessing: false }),

      setIsProcessing: (processing) => set({ isProcessing: processing }),
    }),
    {
      name: "audit-form-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
