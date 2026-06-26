import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { WindowInstance } from '../../types';
import type { WindowManager } from '../../hooks/useWindowManager';

// Inline minimal SVG icons
const IconMin = () => (
  <svg width="10" height="2" viewBox="0 0 10 2" fill="currentColor">
    <rect width="10" height="2" rx="1"/>
  </svg>
);
const IconMax = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="1" y="1" width="8" height="8" rx="1.5"/>
  </svg>
);
const IconClose = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="1.5" y1="1.5" x2="8.5" y2="8.5"/>
    <line x1="8.5" y1="1.5" x2="1.5" y2="8.5"/>
  </svg>
);

interface WindowProps {
  instance: WindowInstance;
  manager: WindowManager;
  constraintEl: HTMLElement | null;
}

export const Window = memo(function Window({ instance, manager, constraintEl }: WindowProps) {
  const { instanceId, name, icon, state, position, size, zIndex, component, windowOptions } = instance;

  const elRef = useRef<HTMLDivElement>(null);
  const [isManipulating, setIsManipulating] = useState(false);

  // Core references for drag & resize operations
  const dragRef = useRef<{ startMouseX: number; startMouseY: number; startElX: number; startElY: number } | null>(null);
  const resizeRef = useRef<{ edge: string; startW: number; startH: number; startElX: number; startElY: number; startMouseX: number; startMouseY: number } | null>(null);

  const livePos = useRef<{ x: number; y: number }>({ ...position });
  const liveSize = useRef<{ width: number; height: number }>({ ...size });

  // Sync state back to refs if altered from outside
  useEffect(() => { livePos.current = { ...position }; }, [position]);
  useEffect(() => { liveSize.current = { ...size }; }, [size]);

  // Initial layout setting
  useEffect(() => {
    const el = elRef.current;
    if (!el || state === 'maximized') return;
    el.style.left = `${position.x}px`;
    el.style.top = `${position.y}px`;
    el.style.width = `${size.width}px`;
    el.style.height = `${size.height}px`;
  }, []);

  // ─── Global Event Handlers for Global Security ───────────────────────────
  
  useEffect(() => {
    const handleGlobalPointerMove = (e: PointerEvent) => {
      // 1. Handle Active Dragging
      if (dragRef.current && elRef.current) {
        const dx = e.clientX - dragRef.current.startMouseX;
        const dy = e.clientY - dragRef.current.startMouseY;

        let newX = dragRef.current.startElX + dx;
        let newY = dragRef.current.startElY + dy;

        if (constraintEl) {
          const { width: cw, height: ch } = constraintEl.getBoundingClientRect();
          newX = Math.max(-liveSize.current.width / 2, Math.min(newX, cw - 80));
          newY = Math.max(0, Math.min(newY, ch - 40));
        }

        livePos.current = { x: newX, y: newY };
        elRef.current.style.left = `${newX}px`;
        elRef.current.style.top = `${newY}px`;
      }

      // 2. Handle Active Resizing
      if (resizeRef.current && elRef.current) {
        const { edge, startW, startH, startElX, startElY, startMouseX, startMouseY } = resizeRef.current;
        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;
        const { minWidth = 300, minHeight = 200 } = windowOptions ?? {};

        let newW = liveSize.current.width;
        let newH = liveSize.current.height;

        if (edge.includes('e')) {
          newW = Math.max(minWidth, startW + dx);
        } else if (edge.includes('w')) {
          const computedW = startW - dx;
          if (computedW > minWidth) {
            newW = computedW;
            livePos.current.x = startElX + dx;
            elRef.current.style.left = `${livePos.current.x}px`;
          }
        }

        if (edge.includes('s')) {
          newH = Math.max(minHeight, startH + dy);
        } else if (edge.includes('n')) {
          const computedH = startH - dy;
          if (computedH > minHeight) {
            newH = computedH;
            livePos.current.y = startElY + dy;
            elRef.current.style.top = `${livePos.current.y}px`;
          }
        }

        liveSize.current = { width: newW, height: newH };
        elRef.current.style.width = `${newW}px`;
        elRef.current.style.height = `${newH}px`;
      }
    };

    const handleGlobalPointerUp = () => {
      if (dragRef.current || resizeRef.current) {
        dragRef.current = null;
        resizeRef.current = null;
        setIsManipulating(false);
        
        // Sync the state safely once human intervention stops
        manager.updateWindowGeometry(instanceId, livePos.current, liveSize.current);
      }
    };

    // Attach to document directly so event never drops if browser gets fast mouse updates
    document.addEventListener('pointermove', handleGlobalPointerMove);
    document.addEventListener('pointerup', handleGlobalPointerUp);

    return () => {
      document.removeEventListener('pointermove', handleGlobalPointerMove);
      document.removeEventListener('pointerup', handleGlobalPointerUp);
    };
  }, [constraintEl, instanceId, manager, windowOptions]);

  // ─── Pointer Down Handlers ───────────────────────────────────────────────

  const onTitleBarPointerDown = useCallback((e: React.PointerEvent) => {
    if (state === 'maximized') return;
    if ((e.target as HTMLElement).closest('button')) return;
    
    setIsManipulating(true);
    dragRef.current = {
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startElX: livePos.current.x,
      startElY: livePos.current.y,
    };
  }, [state]);

  const onResizePointerDown = useCallback((e: React.PointerEvent, edge: string) => {
    e.stopPropagation();
    setIsManipulating(true);

    resizeRef.current = {
      edge,
      startW: liveSize.current.width,
      startH: liveSize.current.height,
      startElX: livePos.current.x,
      startElY: livePos.current.y,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
    };
  }, []);

  const onTitleBarDblClick = useCallback(() => {
    manager.toggleMaximize(instanceId);
  }, [instanceId, manager]);

  if (state === 'minimized') return null;

  const isMaximized = state === 'maximized';

  const windowStyle: React.CSSProperties = isMaximized
    ? { position: 'absolute', left: 0, top: 0, width: '100%', height: 'calc(100% - 64px)', zIndex }
    : { position: 'absolute', left: position.x, top: position.y, width: size.width, height: size.height, zIndex };

  return (
    <div
      ref={elRef}
      className={[
        'window-app flex flex-col bg-white/90 backdrop-blur-2xl rounded-xl shadow-2xl overflow-hidden select-none',
        'transition-[opacity,transform]',
        state === 'opening' ? 'opacity-0 scale-95' : 'opacity-100 scale-100',
        state === 'closing' ? 'opacity-0 scale-95' : '',
      ].join(' ')}
      style={{ ...windowStyle, transitionDuration: '150ms' }}
      onPointerDown={() => manager.focusWindow(instanceId)}
    >
      {/* ─── Title Bar ─────────────────────────────────────────────────── */}
      {!windowOptions?.hideTitleBar && (
        <div
          className="title-bar flex items-center justify-between h-9 bg-white/40 border-b border-gray-200/60 px-2 flex-shrink-0 cursor-default select-none"
          onPointerDown={onTitleBarPointerDown}
          onDoubleClick={onTitleBarDblClick}
        >
          <div className="flex items-center gap-2 pointer-events-none">
            <img src={icon} alt={name} width={16} height={16} className="rounded" />
            <span className="text-xs font-medium text-gray-700">{name}</span>
          </div>

          {!windowOptions?.customControls && (
            <div className="flex items-center gap-1.5">
              <button
                className="w-5 h-5 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center text-white transition-colors"
                onClick={() => manager.minimizeWindow(instanceId)}
                aria-label="Minimize"
              >
                <IconMin />
              </button>
              <button
                className="w-5 h-5 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center text-white transition-colors"
                onClick={() => manager.toggleMaximize(instanceId)}
                aria-label="Maximize"
              >
                <IconMax />
              </button>
              <button
                className="w-5 h-5 rounded-full bg-red-400 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
                onClick={() => manager.closeWindow(instanceId)}
                aria-label="Close"
              >
                <IconClose />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── Content Area ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-hidden relative">
        {isManipulating && <div className="absolute inset-0 z-50 bg-transparent" />}
        
        {state === 'opening' ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 bg-white">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-gray-500 text-xs">Loading {name}…</p>
          </div>
        ) : (
          component
        )}
      </div>

      {/* ─── Full 8-Axis Windows Resize Handles ──────────────────────────── */}
      {!isMaximized && (
        <>
          {/* Borders */}
          <div className="absolute top-1 bottom-1 right-0 w-1.5 cursor-ew-resize z-40" onPointerDown={(e) => onResizePointerDown(e, 'e')} />
          <div className="absolute top-1 bottom-1 left-0 w-1.5 cursor-ew-resize z-40" onPointerDown={(e) => onResizePointerDown(e, 'w')} />
          <div className="absolute bottom-0 left-1 right-1 h-1.5 cursor-ns-resize z-40" onPointerDown={(e) => onResizePointerDown(e, 's')} />
          <div className="absolute top-0 left-1 right-1 h-1.5 cursor-ns-resize z-40" onPointerDown={(e) => onResizePointerDown(e, 'n')} />

          {/* Corners */}
          <div className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize z-50" onPointerDown={(e) => onResizePointerDown(e, 'ne')} />
          <div className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize z-50" onPointerDown={(e) => onResizePointerDown(e, 'nw')} />
          <div className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize z-50" onPointerDown={(e) => onResizePointerDown(e, 'se')} />
          <div className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize z-50" onPointerDown={(e) => onResizePointerDown(e, 'sw')} />
        </>
      )}
    </div>
  );
}, (prev, next) => {
  const pi = prev.instance;
  const ni = next.instance;
  return (
    pi.instanceId === ni.instanceId &&
    pi.state === ni.state &&
    pi.zIndex === ni.zIndex &&
    pi.position.x === ni.position.x &&
    pi.position.y === ni.position.y &&
    pi.size.width === ni.size.width &&
    pi.size.height === ni.size.height
  );
});