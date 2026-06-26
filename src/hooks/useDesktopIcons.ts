import { useCallback, useEffect, useRef, useState } from 'react';
import type { MyApp } from '../components/desktop/DesktopIcon';

export const ICON_W = 80;
export const ICON_H = 100;
export const GRID_X = 100;
export const GRID_Y = 120;
export const PAD_LEFT = 16;
export const PAD_TOP = 16;

interface UseDesktopIconsOptions {
  icons: MyApp[];
  desktopEl: HTMLElement | null;
  taskbarHeight: number;
}

export function useDesktopIcons({ icons: initialIcons, desktopEl, taskbarHeight }: UseDesktopIconsOptions) {
  const [icons, setIcons] = useState<MyApp[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionBox, setSelectionBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  const dragRef = useRef<{
    startMouseX: number;
    startMouseY: number;
    initialPositions: Record<string, { x: number; y: number }>;
    selection: Set<string>;
    moved: boolean;
  } | null>(null);

  // ─── Auto-arrange on mount ───────────────────────────────────────────────
  const autoArrange = useCallback(() => {
    if (!desktopEl) return;
    const { height } = desktopEl.getBoundingClientRect();
    const available = height - taskbarHeight;

    let col = 0;
    let row = 0;
    const maxRows = Math.floor((available - PAD_TOP) / GRID_Y);

    const arranged = initialIcons.map((icon) => {
      if (row >= maxRows) { row = 0; col++; }
      const pos = {
        ...icon,
        x: PAD_LEFT + col * GRID_X,
        y: PAD_TOP + row * GRID_Y,
      };
      row++;
      return pos;
    });

    setIcons(arranged);
  }, [desktopEl, initialIcons, taskbarHeight]);

  useEffect(() => {
    if (desktopEl && icons.length === 0) autoArrange();
  }, [desktopEl, autoArrange, icons.length]);

  // ─── Snap to grid coordinates ────────────────────────────────────────────
  const snapToGrid = useCallback((x: number, y: number) => {
    const gridCol = Math.max(0, Math.round((x - PAD_LEFT) / GRID_X));
    const gridRow = Math.max(0, Math.round((y - PAD_TOP) / GRID_Y));
    return { gridCol, gridRow };
  }, []);

  // ─── Icon mouse-down (With Anti-Overlap Logic) ───────────────────────────
  const onIconMouseDown = useCallback((e: React.MouseEvent, iconId: string) => {
    e.stopPropagation();
    if (e.detail === 2) return;

    setSelectedIds(prev => {
      let next: Set<string>;
      if (e.ctrlKey || e.metaKey) {
        next = new Set(prev);
        next.has(iconId) ? next.delete(iconId) : next.add(iconId);
      } else if (prev.has(iconId)) {
        next = new Set(prev);
      } else {
        next = new Set([iconId]);
      }

      const initialPositions: Record<string, { x: number; y: number }> = {};
      icons.forEach(ic => {
        if (next.has(ic.id)) initialPositions[ic.id] = { x: ic.x, y: ic.y };
      });

      dragRef.current = {
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        initialPositions,
        selection: next,
        moved: false,
      };

      return next;
    });

    const onMouseMove = (me: MouseEvent) => {
      if (!dragRef.current) return;
      const dx = me.clientX - dragRef.current.startMouseX;
      const dy = me.clientY - dragRef.current.startMouseY;
      if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return;
      dragRef.current.moved = true;

      dragRef.current.selection.forEach(id => {
        const el = document.getElementById(`desktop-icon-${id}`);
        if (!el || !dragRef.current) return;
        el.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    };

    const onMouseUp = (me: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      if (!dragRef.current) return;

      if (dragRef.current.moved) {
        const dx = me.clientX - dragRef.current.startMouseX;
        const dy = me.clientY - dragRef.current.startMouseY;
        const { selection, initialPositions } = dragRef.current;

        setIcons(prev => {
          const newIcons = [...prev];

          // Step 1: Ek occupied slots ka map banate hain (un icons ka jo drag nahi ho rahe)
          const occupiedSlots = new Set<string>();
          newIcons.forEach(ic => {
            if (!selection.has(ic.id)) {
              const col = Math.round((ic.x - PAD_LEFT) / GRID_X);
              const row = Math.round((ic.y - PAD_TOP) / GRID_Y);
              occupiedSlots.add(`${col},${row}`);
            }
          });

          // Max boundaries desktop screen ke hisab se compute karne ke liye
          const desktopHeight = desktopEl ? desktopEl.getBoundingClientRect().height : window.innerHeight;
          const maxRows = Math.floor((desktopHeight - taskbarHeight - PAD_TOP) / GRID_Y);

          // Step 2: Drag kiye huye icons ko ek-ek karke vacant slots me daalenge
          selection.forEach(id => {
            const init = initialPositions[id];
            if (!init) return;

            const targetX = init.x + dx;
            const targetY = init.y + dy;
            let { gridCol, gridRow } = snapToGrid(targetX, targetY);

            // ANTI-OVERLAP ALGORITHM: Agar slot full hai, toh niche ya agle columns me pehla khaali slot dhoondho
            while (occupiedSlots.has(`${gridCol},${gridRow}`)) {
              gridRow++;
              if (gridRow >= maxRows) {
                gridRow = 0;
                gridCol++;
              }
            }

            // Khaali slot mil gaya! Ab is slot ko occupied mark karo taaki dusra dragged icon yahan na aaye
            occupiedSlots.add(`${gridCol},${gridRow}`);

            // Naye coordinates set karo
            const finalX = PAD_LEFT + gridCol * GRID_X;
            const finalY = PAD_TOP + gridRow * GRID_Y;

            const idx = newIcons.findIndex(ic => ic.id === id);
            if (idx !== -1) {
              newIcons[idx] = { ...newIcons[idx], x: finalX, y: finalY };
            }

            // Inline CSS clean up
            const el = document.getElementById(`desktop-icon-${id}`);
            if (el) el.style.transform = 'none';
          });

          return newIcons;
        });
      }

      dragRef.current = null;
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [icons, snapToGrid, desktopEl, taskbarHeight]);

  // ─── Desktop rubber-band selection ──────────────────────────────────────
  const onDesktopMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // 1. Right-click ko disable kiya aur check kiya ki click kisi Window, Taskbar, ya App Panel par to nahi hua
    if (e.button !== 0) return;
    if (target.closest('[data-desktop-icon], .window-app, .taskbar, button, [data-panel]')) {
      return;
    }

    // Current selection clear karein
    setSelectedIds(new Set());

    const startX = e.clientX;
    const startY = e.clientY;

    // Initial 0-size selection box set karein
    setSelectionBox({ x: startX, y: startY, w: 0, h: 0 });

    const onMouseMove = (me: MouseEvent) => {
      const currentX = me.clientX;
      const currentY = me.clientY;
      const width = currentX - startX;
      const height = currentY - startY;

      // Purane code ki key logical-handling: Mirror support jab mouse left/up drag ho
      const boxX = width > 0 ? startX : currentX;
      const boxY = height > 0 ? startY : currentY;
      const boxW = Math.abs(width);
      const boxH = Math.abs(height);

      // Selection box coordinates update karein (naye coordinates pattern {x, y, w, h} ke sath)
      setSelectionBox({ x: boxX, y: boxY, w: boxW, h: boxH });

      // Live icons selection logic grid values ke sath compare karne ke liye
      setIcons(prev => {
        const sel = new Set<string>();
        prev.forEach(ic => {
          const right = ic.x + ICON_W;
          const bottom = ic.y + ICON_H;

          // Check intersection with the calculated bounding box
          if (ic.x < boxX + boxW && right > boxX && ic.y < boxY + boxH && bottom > boxY) {
            sel.add(ic.id);
          }
        });
        setSelectedIds(sel);
        return prev;
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setSelectionBox(null);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  return {
    icons,
    selectedIds,
    selectionBox,
    onIconMouseDown,
    onDesktopMouseDown,
    autoArrange,
  };
}