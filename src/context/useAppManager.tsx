import React, { createContext, useContext } from 'react';
import type { AppDefinition } from '../types';
import type { WindowManager } from '../hooks/useWindowManager';
 
interface AppManagerContextValue {
  openApp: (appId: string) => void;
  closeApp: (instanceId: string) => void;
  allApps: Record<string, AppDefinition>;
  windowManager: WindowManager;
}
 
const AppManagerContext = createContext<AppManagerContextValue | null>(null);
 
export function AppManagerProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: AppManagerContextValue;
}) {
  return (
    <AppManagerContext.Provider value={value}>
      {children}
    </AppManagerContext.Provider>
  );
}
 
export function useAppManager() {
  const ctx = useContext(AppManagerContext);
  if (!ctx) throw new Error('useAppManager must be used inside AppManagerProvider');
  return ctx;
}
 