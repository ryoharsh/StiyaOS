import { create } from 'zustand';
import type { WizardData } from "../types";
import { persist } from "zustand/middleware";

const initialWizardData: WizardData = {
  country: null,
  network: null,
  pcName: '',
  auth: null,
  pin: null,
  restoreChoice: null,
};

interface SetupStore {
  isSetupDone: boolean;
  setSetupDone: (value: boolean) => void;
  wizardData: WizardData;
  setWizardData: (partial: Partial<WizardData>) => void;
  resetWizardData: () => void;
}

export const useSetupStore = create<SetupStore>()(
  persist(
    (set) => ({
      // Initial state set kiya
      isSetupDone: false,

      // setLoggedIn function ko parameter ke sath implement kiya
      setSetupDone: (value) => set({ isSetupDone: value }),

      wizardData: initialWizardData,

      setWizardData: (partial) =>
        set((state) => ({
          wizardData: {
            ...state.wizardData,
            ...partial,
          },
        })),

      resetWizardData: () =>
        set({
          wizardData: initialWizardData,
        }),
    }),
    {
      name: 'stiya-setup-dat',
    }
  )
);