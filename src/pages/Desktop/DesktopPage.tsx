import { useCallback, useEffect, useRef } from "react";
import { DesktopBackground } from "../../components/desktop/DesktopBackground";
import { DesktopIcon } from "../../components/desktop/DesktopIcon";
import { WindowLayer } from "../../components/window/WindowLayer";
import { AppManagerProvider } from "../../context/useAppManager";
import { useBattery, useClock } from "../../hooks/useSystemHooks";
import { useDesktopIcons } from "../../hooks/useDesktopIcons";
import { allApps, desktopAppRegistry, taskBarAppsRegistry } from "../../apps/appRegistry";
import { useWindowManager } from "../../hooks/useWindowManager";
import { usePanelManager } from "../../hooks/usePanelManager";
import { OverlayLayer } from "../../components/overlay/OverlayLayer";
import { Taskbar } from "../../components/taskbar/Taskbar";

export default function DesktopPage() {

    const windowManager = useWindowManager();
    const panels = usePanelManager();
    const battery = useBattery();
    const clock = useClock();

    const desktopRef = useRef<HTMLDivElement | null>(null);
    const taskbarRef = useRef<HTMLDivElement | null>(null);
    const constraintRef = useRef<HTMLDivElement>(null);

    const {
        icons,
        selectedIds,
        selectionBox,
        onIconMouseDown,
        onDesktopMouseDown,
    } = useDesktopIcons({
        icons: Object.values(desktopAppRegistry).map((a: any) => ({ id: a.id, name: a.name, icon: a.icon, x: 0, y: 0 })),
        desktopEl: desktopRef.current,
        taskbarHeight: 64,
    });

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'a' || e.key === 'A')) {
                if (document.activeElement?.tagName === 'INPUT') return;
                e.preventDefault();
            }
            if (e.key === 'Escape') panels.closeAll();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [panels]);

    const openApp = useCallback((appId: string) => {
        const def = allApps[appId];
        if (!def) return;
        panels.closeAll();
        windowManager.openWindow(def);
    }, [panels, windowManager]);

    const appManagerValue = {
        openApp,
        closeApp: windowManager.closeWindow,
        allApps: allApps,
        windowManager,
    };

    const handleDesktopClick = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('[data-panel], [data-desktop-icon], .taskbar, .window-app')) return;
        panels.closeAll();
    }, [panels]);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.window-app')) return;
        e.preventDefault();
        panels.closeAll();
        window.setTimeout(() => panels.openContextMenu(e.clientX, e.clientY), 0);
    }, [panels]);

    return (
        <AppManagerProvider value={appManagerValue}>
            <div className="h-screen w-screen overflow-hidden select-none relative bg-[#0c0b0c]">

                {/* Background Image */}
                <DesktopBackground />

                {/* Main Bare Desktop Container with structural events */}
                <div 
                    ref={desktopRef} 
                    onClick={handleDesktopClick} 
                    onMouseDown={onDesktopMouseDown} // Rubber-band selection trigger
                    onContextMenu={handleContextMenu} 
                    className="absolute inset-0 w-full h-full z-10"
                >
                    {/* Rubber-band active selection overlay bounding box */}
                    {selectionBox && (
                        <div
                            className="absolute bg-white/5 border-2 border-white/15 backdrop-blur-xs rounded pointer-events-none z-0"
                            style={{
                                left: selectionBox.x,
                                top: selectionBox.y,
                                width: selectionBox.w,
                                height: selectionBox.h,
                            }}
                        />
                    )}

                    {/* Watermark (ABSOLUTE POSITIONING APPLIED TO PREVENT LAYOUT SHIFT) */}
                    <div className="absolute flex flex-col items-end gap-2 pointer-events-none z-1 justify-self-end p-4">
                        <h1 className="text-2xl text-white font-light text-shadow-gray-900 tracking-wide">{clock.timeFull.split(' ')[0]}</h1>
                        <h1 className="text-sm text-white/70 font-normal text-shadow-gray-900 tracking-wider -mt-2">{clock.dateShort}</h1>
                        <h1 className="text-xs text-white/70 font-semibold text-shadow-gray-900 tracking-wider -mt-2">Harsh Kumar Singh</h1>
                    </div>

                    {/* Desktop icons & Active Workspace Boundaries */}
                    <div ref={constraintRef} className="absolute inset-0 -mb-2">
                        {icons.map(icon => (
                            <DesktopIcon
                                key={icon.id}
                                icon={icon}
                                isSelected={selectedIds.has(icon.id)}
                                onMouseDown={e => onIconMouseDown(e, icon.id)}
                                onDoubleClick={() => openApp(icon.id)}
                            />
                        ))}

                        {/* Layer 3: Active Draggable Windows Layer */}
                        <WindowLayer manager={windowManager} constraintEl={constraintRef.current} />
                    </div>
                </div>

                {/* Layer 4: System Overlays Manager (Start Menu, Context Menu, Settings Panel) */}
                <div data-panel className="fixed inset-0 z-[39000] pointer-events-none">
                    <div className="pointer-events-auto">
                        <OverlayLayer
                            panels={panels}
                            allApps={allApps}
                            battery={battery}
                            windowManager={windowManager}
                            onOpenApp={openApp}
                        />
                    </div>
                </div>

                {/* Layer 5: Primary Taskbar Dock Controls */}
                <Taskbar
                    taskbarApps={Object.values(taskBarAppsRegistry)}
                    allApps={allApps}
                    windowManager={windowManager}
                    panels={panels}
                    battery={battery}
                    clock={{ timeShort: clock.timeShort, dateShort: clock.dateShort }}
                    onOpenApp={openApp}
                    onToggleBot={() => panels.togglePanel('bot')}
                    taskbarRef={taskbarRef as React.RefObject<HTMLDivElement>}
                />
            </div>
        </AppManagerProvider>
    );
}