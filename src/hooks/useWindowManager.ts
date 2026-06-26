import { useCallback, useRef, useState } from 'react';
import type { AppDefinition, WindowInstance, WindowState } from '../types';
 
const CASCADE_OFFSET = 28;   // px offset per new window
 
export function useWindowManager() {
  const [windows, setWindows] = useState<WindowInstance[]>([]);
  const openCountRef = useRef(0); // tracks total windows ever opened for cascade
 
  // ─── Open ───────────────────────────────────────────────────────────────
 
  const openWindow = useCallback((appDef: AppDefinition) => {
    const count = openCountRef.current++;
    const w = window.innerWidth;
    const h = window.innerHeight;
    const { width, height } = appDef.defaultSize;
 
    const position = {
      x: Math.max(0, (w - width) / 2 + (count % 8) * CASCADE_OFFSET),
      y: Math.max(0, (h - height) / 2 + (count % 8) * CASCADE_OFFSET - 40),
    };
 
    const instance: WindowInstance = {
      instanceId: `${appDef.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      appId: appDef.id,
      name: appDef.name,
      icon: appDef.icon,
      state: 'opening',
      position,
      size: { ...appDef.defaultSize },
      defaultSize: appDef.defaultSize,
      zIndex: 0,           // will be recomputed from array order on render
      component: appDef.component,
      windowOptions: appDef.windowOptions,
    };
 
    setWindows(prev => [...prev, instance]);
 
    // Advance to 'open' after mount animation (300 ms)
    window.setTimeout(() => {
      setWindows(prev =>
        prev.map(w => w.instanceId === instance.instanceId ? { ...w, state: 'open' } : w)
      );
    }, 300);
 
    return instance.instanceId;
  }, []);
 
  // ─── Close ──────────────────────────────────────────────────────────────
 
  const closeWindow = useCallback((instanceId: string) => {
    setWindows(prev => prev.map(w =>
      w.instanceId === instanceId ? { ...w, state: 'closing' } : w
    ));
    // Remove from array after close animation (200 ms)
    window.setTimeout(() => {
      setWindows(prev => prev.filter(w => w.instanceId !== instanceId));
    }, 200);
  }, []);
 
  // ─── Focus (bring to front) ──────────────────────────────────────────────
 
  const focusWindow = useCallback((instanceId: string) => {
    setWindows(prev => {
      const idx = prev.findIndex(w => w.instanceId === instanceId);
      if (idx === -1 || idx === prev.length - 1) return prev; // already on top
      const next = [...prev];
      const [item] = next.splice(idx, 1);
      next.push(item);
      return next;
    });
  }, []);
 
  // ─── Minimize ────────────────────────────────────────────────────────────
 
  const minimizeWindow = useCallback((instanceId: string) => {
    setWindows(prev =>
      prev.map(w => w.instanceId === instanceId ? { ...w, state: 'minimized' } : w)
    );
  }, []);
 
  // ─── Maximize / Restore ──────────────────────────────────────────────────
 
  const toggleMaximize = useCallback((instanceId: string) => {
    setWindows(prev =>
      prev.map(w => {
        if (w.instanceId !== instanceId) return w;
        const newState: WindowState = w.state === 'maximized' ? 'open' : 'maximized';
        return { ...w, state: newState };
      })
    );
  }, []);
 
  // ─── Unminimize ──────────────────────────────────────────────────────────
 
  const unminimizeWindow = useCallback((instanceId: string) => {
    setWindows(prev =>
      prev.map(w => w.instanceId === instanceId && w.state === 'minimized'
        ? { ...w, state: 'open' }
        : w
      )
    );
    focusWindow(instanceId);
  }, [focusWindow]);
 
  // ─── Update geometry (called by Window on drag / resize end) ─────────────
 
  const updateWindowGeometry = useCallback((
    instanceId: string,
    position: { x: number; y: number },
    size: { width: number; height: number }
  ) => {
    setWindows(prev =>
      prev.map(w => w.instanceId === instanceId ? { ...w, position, size } : w)
    );
  }, []);
 
  // ─── Queries ─────────────────────────────────────────────────────────────
 
  const getInstancesForApp = useCallback((appId: string) => {
    return windows.filter(w => w.appId === appId && w.state !== 'closing');
  }, [windows]);
 
  // Assign computed z-index from array position for rendering
  const windowsWithZ = windows.map((w, i) => ({
    ...w,
    zIndex: 100 + i,
  }));
 
  return {
    windows: windowsWithZ,
    openWindow,
    closeWindow,
    focusWindow,
    minimizeWindow,
    toggleMaximize,
    unminimizeWindow,
    updateWindowGeometry,
    getInstancesForApp,
  };
}
 
export type WindowManager = ReturnType<typeof useWindowManager>;