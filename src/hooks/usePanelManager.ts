import { useCallback, useState } from 'react';
import type { ContextMenuPosition, PanelKey } from '../types';
 
export function usePanelManager() {
  const [activePanel, setActivePanel] = useState<PanelKey>(null);
  const [contextMenuPos, setContextMenuPos] = useState<ContextMenuPosition>({ x: 0, y: 0 });
 
  const openPanel = useCallback((key: PanelKey) => {
    setActivePanel(key);
  }, []);
 
  const closeAll = useCallback(() => {
    setActivePanel(null);
  }, []);
 
  const togglePanel = useCallback((key: PanelKey) => {
    setActivePanel((prev: any) => (prev === key ? null : key));
  }, []);
 
  const openContextMenu = useCallback((x: number, y: number) => {
    setContextMenuPos({ x, y });
    setActivePanel('contextMenu');
  }, []);
 
  return {
    activePanel,
    contextMenuPos,
    openPanel,
    closeAll,
    togglePanel,
    openContextMenu,
    isOpen: (key: PanelKey) => activePanel === key,
  };
}
 
export type PanelManager = ReturnType<typeof usePanelManager>;