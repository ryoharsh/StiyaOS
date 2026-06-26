import React, { memo, useCallback, useRef, useState } from 'react';
import type { BatteryStatus, TaskbarPreview } from '../../types';
import type { WindowManager } from '../../hooks/useWindowManager';
import type { PanelManager } from '../../hooks/usePanelManager';
import type { AppDefinition } from '../../types';
import LOGO_GRAD from '../../assets/logo_grad.png';
import { BrainIcon } from '@phosphor-icons/react';

// ─── Taskbar Preview Popup ─────────────────────────────────────────────────

interface PreviewPopupProps {
  preview: TaskbarPreview | null;
  manager: WindowManager;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onHide: () => void;
}

function PreviewPopup({ preview, manager, onClose, onFocus, onHide }: PreviewPopupProps) {
  if (!preview) return null;
  const instances = manager.getInstancesForApp(preview.appId);
  if (instances.length === 0) return null;

  return (
    <div
      className="fixed z-50001 bottom-18 flex flex-col gap-1.5 p-1.5 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20"
      style={{ left: preview.anchorX, transform: 'translateX(-50%)', minWidth: 200 }}
      onMouseLeave={onHide}
    >
      {instances.map(inst => (
        <div
          key={inst.instanceId}
          className="flex items-center gap-2 p-2 rounded-xl bg-black/10 border border-white/20 cursor-pointer hover:bg-black/20 transition-colors"
          onClick={() => { onFocus(inst.instanceId); onHide(); }}
        >
          <img src={inst.icon} alt={inst.name} className="w-7 h-7" />
          <span className="text-xs text-white flex-1 truncate">{inst.name}</span>
          <button
            className="w-5 h-5 rounded-full flex items-center justify-center text-white/70 hover:bg-red-500/80 hover:text-white transition-colors"
            onClick={(e) => { e.stopPropagation(); onClose(inst.instanceId); }}
            aria-label="Close"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Single Taskbar Icon ───────────────────────────────────────────────────

interface TaskbarIconProps {
  app: AppDefinition;
  isRunning: boolean;
  instanceCount: number;
  onClick: () => void;
  onHover: (e: React.MouseEvent) => void;
  onLeave: () => void;
}

const TaskbarIcon = memo(function TaskbarIcon({
  app, isRunning, instanceCount, onClick, onHover, onLeave,
}: TaskbarIconProps) {
  return (
    <div
      className="relative flex items-center justify-center w-10 h-10 mx-0.5 rounded-xl transition-all duration-150 hover:scale-110 hover:-translate-y-0.5 active:scale-95"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      title={app.name}
    >
      <img src={app.icon} alt={app.name} className="size-9" draggable={false} />
      {isRunning && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
          {Array.from({ length: Math.min(instanceCount, 3) }).map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-white/80" />
          ))}
        </div>
      )}
    </div>
  );
});

// ─── Battery Icon ──────────────────────────────────────────────────────────

function BatteryDisplay({ battery }: { battery: BatteryStatus | null }) {
  if (!battery) return null;
  const pct = Math.round(battery.level);
  const barColor = pct > 20 ? 'bg-gray-950' : 'bg-red-400';

  return (
    <div className="flex items-center gap-1 text-gray-950 text-xs">
      {battery.charging ? (
        <svg width="10" height="12" viewBox="0 0 24 24" fill="#4ade80">
          <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
        </svg>
      ) : (
        <div className="relative w-5 h-3 border border-gray-950 rounded-xs">
          <div className={`absolute inset-0.5 rounded-[1px] ${barColor}`} style={{ width: `${pct}%`, maxWidth: '100%' }} />
        </div>
      )}
      <span>{pct}%</span>
    </div>
  );
}

// ─── Taskbar ───────────────────────────────────────────────────────────────

interface TaskbarProps {
  taskbarApps: AppDefinition[];
  allApps: Record<string, AppDefinition>;
  windowManager: WindowManager;
  panels: PanelManager;
  battery: BatteryStatus | null;
  clock: { timeShort: string; dateShort: string };
  onOpenApp: (appId: string) => void;
  onToggleBot: () => void;
  taskbarRef: React.RefObject<HTMLDivElement>;
}

export function Taskbar({
  taskbarApps,
  allApps,
  windowManager,
  panels,
  battery,
  clock,
  onOpenApp,
  onToggleBot,
  taskbarRef,
}: TaskbarProps) {
  const [preview, setPreview] = useState<TaskbarPreview | null>(null);
  const previewTimeout = useRef<number | null>(null);

  const showPreview = useCallback((appId: string, e: React.MouseEvent) => {
    if (previewTimeout.current) window.clearTimeout(previewTimeout.current);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const instances = windowManager.getInstancesForApp(appId);
    if (instances.length > 0) {
      setPreview({ appId, anchorX: rect.left + rect.width / 2 });
    }
  }, [windowManager]);

  const hidePreview = useCallback(() => {
    if (previewTimeout.current) window.clearTimeout(previewTimeout.current);
    previewTimeout.current = window.setTimeout(() => setPreview(null), 250);
  }, []);

  // Merge: pinned taskbar apps + any running app not already pinned
  const runningNotPinned = windowManager.windows
    .filter(w => w.state !== 'closing' && !taskbarApps.find(a => a.id === w.appId))
    .map(w => ({ appId: w.appId, seen: true }))
    .filter((v, i, a) => a.findIndex(x => x.appId === v.appId) === i)
    .map(({ appId }) => allApps[appId])
    .filter(Boolean);

  const displayedApps = [...taskbarApps, ...runningNotPinned];

  const handleIconClick = useCallback((appId: string) => {
    const instances = windowManager.getInstancesForApp(appId);
    if (instances.length === 0) {
      onOpenApp(appId);
    } else if (instances.length === 1) {
      const inst = instances[0];
      if (inst.state === 'minimized') {
        windowManager.unminimizeWindow(inst.instanceId);
      } else {
        windowManager.focusWindow(inst.instanceId);
      }
    } else {
      // Show preview if multiple instances
      setPreview(p => p?.appId === appId ? null : { appId, anchorX: 0 });
    }
  }, [windowManager, onOpenApp]);

  return (
    <>
      <PreviewPopup
        preview={preview}
        manager={windowManager}
        onClose={windowManager.closeWindow}
        onFocus={windowManager.focusWindow}
        onHide={hidePreview}
      />

      <div
        ref={taskbarRef}
        className="taskbar bg-white/80 backdrop-blur-md absolute bottom-0 left-0 w-full px-4 py-2 flex items-center z-40000"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Left: AI Search Bar ─── */}
        <button
          onClick={onToggleBot}
          className="h-10 border border-gray-400 bg-white text-gray-950 px-4 flex items-center gap-2 rounded-full w-64 shadow-xl transition-colors cursor-text"
        >
          <BrainIcon size={18} />
          <span className="text-sm opacity-80 flex-1 text-left">Ask StiyaAI…</span>
        </button>

        {/* ─── Center: App Dock ─── */}
        <div className="absolute left-1/2 -translate-x-1/2 text-gray-950 px-2 py-1.5 flex items-center gap-0.5">
          {/* Start button */}
          <button
            onClick={() => panels.togglePanel('startMenu')}
            className={[
              'w-10 h-10 rounded-xl flex items-center justify-center mr-1 transition-all duration-150 bg-white',
              panels.isOpen('startMenu') ? 'bg-white' : 'hover:scale-105',
            ].join(' ')}
            aria-label="Start menu"
          >
            <img src={LOGO_GRAD} alt="Start Icon" className='p-2' />
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-400 mr-1" />

          {/* App icons */}
          {displayedApps.map(app => {
            const instances = windowManager.getInstancesForApp(app.id);
            return (
              <TaskbarIcon
                key={app.id}
                app={app}
                isRunning={instances.length > 0}
                instanceCount={instances.length}
                onClick={() => handleIconClick(app.id)}
                onHover={(e) => showPreview(app.id, e)}
                onLeave={hidePreview}
              />
            );
          })}
        </div>

        {/* ─── Right: System Tray ─── */}
        <div className="ml-auto flex items-center h-10 text-gray-950 overflow-hidden">
          {/* Connectivity + volume + battery */}
          <button
            onClick={() => panels.togglePanel('rightMenu')}
            className={[
              'flex items-center gap-3 h-full px-3 transition-colors mr-1.5 rounded-xl',
              panels.isOpen('rightMenu') ? 'bg-white' : 'hover:bg-white',
            ].join(' ')}
          >
            {/* Wifi icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0" />
              <path d="M1.42 9a16 16 0 0 1 21.16 0" />
              <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
              <circle cx="12" cy="20" r="1" fill="currentColor" />
            </svg>
            {/* Volume icon */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" opacity="0.7" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
            <BatteryDisplay battery={battery} />
          </button>

          {/* Date/Time */}
          <button
            onClick={() => panels.togglePanel('dateTime')}
            className={[
              'flex items-center gap-2 h-full px-3 text-xs transition-colors rounded-xl',
              panels.isOpen('dateTime') ? 'bg-white' : 'hover:bg-white',
            ].join(' ')}
          >
            <span className="opacity">{clock.dateShort}</span>
            <span className="font-medium">{clock.timeShort}</span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => panels.togglePanel('notifications')}
            className={[
              'flex items-center justify-center h-full w-10 transition-colors font-semibold text-sm rounded-xl ml-1.5',
              panels.isOpen('notifications') ? 'bg-white' : 'hover:bg-white',
            ].join(' ')}
            aria-label="Notifications"
          >
            2
          </button>
        </div>
      </div>
    </>
  );
}