import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import type { PanelManager } from '../../hooks/usePanelManager';
import type { AppDefinition, BatteryStatus, WifiNetwork } from '../../types';
import type { WindowManager } from '../../hooks/useWindowManager';
import StiyaBot from '../StiyaBot';
import { WifiPanel } from '../WifiPanel';
import { useAppManager } from '../../context/useAppManager';
import RssGrid from '../RssGrid';
import { AirplaneIcon, AirplaneTakeoffIcon, BluetoothIcon, BluetoothSlashIcon, CaretRightIcon, GearIcon, PowerIcon, SpeakerHighIcon, SunIcon, WifiHighIcon, WifiSlashIcon } from '@phosphor-icons/react';
import { useSetupStore } from '../../store/useSetupStore';
import DEVELOPER from '../../assets/dev_icon.png';
import { HorizontalSlider } from '../HorizontalSlider';

// ─── Shared panel wrapper (Preserved & Enhanced with Win11 transitions) ─────
function Panel({ children, className = '', visible }: { children: React.ReactNode; className?: string; visible: boolean }) {
  return (
    <div
      className={`absolute z-40000 border border-white/50 backdrop-blur-2xl rounded-3xl shadow-2xl transition-all duration-300 ${visible ? 'win11-open' : 'win11-close opacity-0 pointer-events-none'
        } ${className}`}
    >
      {children}
    </div>
  );
}

// ─── Start Menu ───────────────────────────────────────────────────────────
interface StartMenuProps {
  allApps: Record<string, AppDefinition>;
  onAppClick: (appId: string) => void;
  onClose: () => void;
  visible: boolean;
}

export const StartMenu = memo(function StartMenu({ allApps, onAppClick, onClose, visible }: StartMenuProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible) inputRef.current?.focus();
  }, [visible]);

  const apps = Object.values(allApps);
  const sortedApps = [...apps].sort((a, b) => a.name.localeCompare(b.name));
  const filtered = searchTerm
    ? sortedApps.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : sortedApps;

  const grouped = sortedApps.reduce<Record<string, AppDefinition[]>>((acc, app) => {
    const key = app.name[0]?.toUpperCase() ?? '#';
    (acc[key] ??= []).push(app);
    return acc;
  }, {});

  return (
    <Panel visible={visible} className="left-1/2 -translate-x-1/2 bottom-20 h-[80vh] max-h-175 w-2xl bg-white/75 flex flex-col overflow-hidden">
      <div className="px-6 pt-5 pb-3 shrink-0">
        <div className="flex items-center gap-2 bg-white/50 border border-gray-200/60 rounded-full px-4 py-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef} type="text" placeholder="Search apps, settings…" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-5" style={{ scrollbarWidth: 'none' }}>
        {searchTerm ? (
          <>
            <p className="text-sm font-medium text-gray-600 mb-3">Results</p>
            {filtered.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No apps found</p>
            ) : (
              <div className="space-y-0.5">
                {filtered.map(app => (
                  <button key={app.id} onClick={() => { onAppClick(app.id); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/60 transition-colors text-left">
                    <img src={app.icon} alt={app.name} className="w-9 h-9" />
                    <span className="text-sm text-gray-800">{app.name}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : showAll ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">All apps</p>
              <button onClick={() => setShowAll(false)} className="text-sm font-medium text-gray-600 hover:text-gray-950">← Back</button>
            </div>
            {Object.keys(grouped).sort().map(letter => (
              <div key={letter} className="mb-3">
                <p className="text-xs font-semibold text-gray-950 px-3 py-2">{letter}</p>
                {grouped[letter].map(app => (
                  <button key={app.id} onClick={() => { onAppClick(app.id); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2 mb-2 rounded-xl hover:bg-white/60 transition-colors text-left">
                    <img src={app.icon} alt={app.name} className="w-10 h-10" />
                    <span className="text-sm text-gray-800">{app.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-600">Pinned</p>
              <button onClick={() => setShowAll(true)} className="text-sm font-medium text-gray-600 hover:text-gray-950 flex items-center gap-1">All apps →</button>
            </div>
            <div className="grid grid-cols-6 gap-1">
              {apps.slice(0, 18).map(app => (
                <button key={app.id} onClick={() => { onAppClick(app.id); onClose(); }} className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/60 transition-colors">
                  <img src={app.icon} alt={app.name} className="w-10 h-10" />
                  <span className="text-xs text-gray-800 text-center line-clamp-1 w-full">{app.name}</span>
                </button>
              ))}
            </div>
            <p className="text-sm font-medium text-gray-600 mt-5 mb-2">Spotlights</p>
            <RssGrid />
          </>
        )}
      </div>
    </Panel>
  );
});

// ─── Right Menu (Quick Settings) ─────────────────────────────────────────
interface RightMenuProps {
  battery: BatteryStatus | null;
  onWifiClick: () => void;
  visible: boolean;
}

export const RightMenu = memo(function RightMenu({ battery, onWifiClick, visible }: RightMenuProps) {
  const [volume, setVolume] = useState(80);
  const [wifiOn, setWifiOn] = useState(false);
  const [bluetoothOn, setBluetoothOn] = useState(false);
  const [airplaneOn, setAirplaneOn] = useState(false);
  const [brightness, setBrightness] = useState<number>(40);

  const [connectedWifi, setConnectedWifi] = useState<string | null>(null);
  const [ethernetConnected, setEthernetConnected] = useState(false);
  const [wifiList, setWifiList] = useState<WifiNetwork[]>([]);

  const [isScanning, setIsScanning] = useState(false);

  const wizardData = useSetupStore((s) => s.wizardData);
  const appManager = useAppManager();

  useEffect(() => {
    const checkNetworkStatus = async () => {
      if (!window.networkAPI) return;

      try {
        const status = await window.networkAPI.getStatus();

        setWifiOn(!!status.wifiConnected);
        setConnectedWifi(status.wifiConnected ? status.activeSsid : null);

        setEthernetConnected(!!status.ethernetConnected);
      } catch (err) {
        console.error(err);
      }
    };

    checkNetworkStatus();

    const timer = setInterval(checkNetworkStatus, 3000);

    return () => clearInterval(timer);
  }, []);

  const scanWifi = async () => {
    if (!window.networkAPI) return;

    try {
      setIsScanning(true);

      const networks = await window.networkAPI.scanWifi();

      if (Array.isArray(networks)) {
        setWifiList(networks);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleWifiClick = async () => {
    await scanWifi();
    onWifiClick();
  };

  const BatteryIcon = ({ level, charging }: { level: number; charging: boolean; }) => {
    return (
      <div className="flex items-center gap-2 relative text-[#0c0b0c] text-xs">
        {!charging && <div className="relative w-5 h-3 border-1 border-[#0c0b0c] rounded-sm">
          <div className="absolute top-0 left-0 h-full bg-[#0c0b0c]" style={{ width: `${level}%` }}></div>
        </div>}
        {charging && (
          <div className="-mx-1 text-green-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
            </svg>
          </div>
        )}
        <span>{Math.round(level)}%</span>
      </div>
    );
  };

  return (
    <Panel visible={visible} className="right-5 bottom-20 w-90 bg-white/75 p-4 space-y-3">
      <div className="flex items-center h-20 gap-2 text-sm">
        <div className={`flex items-center font-medium justify-between px-5 w-full py-4 h-full rounded-s-3xl rounded-e-xl bg-white shadow-gray-200 shadow-lg hover:scale-96 transition ease-in-out duration-200`}>
          <div className="flex items-center gap-4">
            <img src={wizardData.auth?.avatar || DEVELOPER} width={40} height={40} alt="User Profile Picture" className="w-12 h-12 rounded-full object-cover" />
            <p className="text-md text-gray-900">{wizardData.pcName}</p>
          </div>
          <button className="text-xs px-3 text-gray-900 py-2 bg-gray-200 rounded-xl hover:scale-110 transition ease-in-out duration-200">Log out</button>
        </div>
        <div className={`flex items-center font-medium justify-between px-5 py-4 bg-white h-full shadow-lg shadow-gray-200 rounded-e-3xl rounded-s-xl hover:scale-96 transition ease-in-out duration-200`}>
          <PowerIcon />
        </div>
      </div>

      <div className="p-3 bg-white rounded-3xl mt-2 shadow-gray-200 shadow-lg">
        <div className="flex items-center gap-3 text-sm">
          <div onClick={handleWifiClick} className={`flex items-center font-medium justify-between px-5 w-full py-6 rounded-full hover:scale-96 ${wifiOn ? 'bg-gray-200 text-gray-900 border-none' : 'bg-none border-1 border-gray-200 text-gray-900'} transition duration-200 ease-in-out`}>
            <div className="flex items-center gap-4">
              {wifiOn ? <WifiHighIcon /> : <WifiSlashIcon />}
              <p>WiFi</p>
              {connectedWifi && (
                <p className="text-[10px] text-gray-500 truncate max-w-24">
                  {connectedWifi}
                </p>
              )}
            </div>
            <CaretRightIcon />
          </div>
          <div className={`flex items-center font-medium justify-between px-5 w-full py-6 rounded-full hover:scale-96 ${bluetoothOn ? 'bg-gray-200 text-gray-900 border-none' : 'bg-none border-[1.5px] border-gray-300 text-gray-900'} transition duration-200 ease-in-out`}>
            <div className="flex items-center gap-4">
              {bluetoothOn ? <BluetoothIcon /> : <BluetoothSlashIcon />}
              <p>BT</p>
            </div>
            <CaretRightIcon />
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm mt-3">
          <div className={`flex items-center font-medium justify-between px-5 w-full py-6 rounded-full hover:scale-96 ${airplaneOn ? 'bg-gray-200 text-gray-900 border-none' : 'bg-none border-1 border-gray-200 text-gray-900'} transition duration-200 ease-in-out`}>
            <div className="flex items-center gap-4">
              {airplaneOn ? <AirplaneTakeoffIcon /> : <AirplaneIcon />}
              <p>Flight</p>
            </div>
            <CaretRightIcon />
          </div>
          <div className="flex items-center font-medium justify-center px-5 w-full py-6 rounded-full hover:scale-96 bg-gray-800 border-[1.5px] border-gray-300 text-white transition duration-200 ease-in-out">
            Hire Devloper
          </div>
        </div>
      </div>

      <div className="p-3 bg-white rounded-3xl mt-2 shadow-gray-200 shadow-lg gap-4 flex flex-col">
        <HorizontalSlider value={brightness} onChange={setBrightness} svgIcon={<SunIcon />} />
        <HorizontalSlider value={volume} onChange={setVolume} svgIcon={<SpeakerHighIcon />} />
      </div>

      <div className="flex items-center justify-between mt-2 bg-white p-4 rounded-3xl shadow-gray-200 shadow-lg">
        {battery && <BatteryIcon level={battery.level} charging={battery.charging} />}
        <div onClick={() => appManager.openApp("settings")} className="bg-gray-200 p-2 rounded-full transition duration-200 ease-in-out hover:scale-110">{<GearIcon />}</div>
      </div>
    </Panel>
  );
});

// ─── Notifications ────────────────────────────────────────────────────────
export const NotificationPanel = memo(function NotificationPanel({ visible }: { visible: boolean }) {
  return (
    <Panel visible={visible} className="right-5 bottom-20 w-90 bg-white/90 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-gray-800 text-md">Notifications</p>
        <button className="text-sm text-gray-500 hover:text-gray-700">Clear all</button>
      </div>
      <p className="text-sm text-gray-400 text-center py-6">No new notifications</p>
    </Panel>
  );
});

// ─── Context Menu (Preserved absolute coords layout) ──────────────────────
interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  visible: boolean;
}

export const ContextMenu = memo(function ContextMenu({ x, y, onClose, visible }: ContextMenuProps) {

  const { openApp } = useAppManager();

  const items = [
    { label: 'Refresh', action: () => window.location.reload() },
    { label: 'New Folder', action: () => { } },
    { label: 'New File', action: () => { } },
    null,
    { label: 'Settings', action: () => openApp('settings') },
    { label: 'Personalization', action: () => openApp('settings') },
    null,
    { label: 'GitHub', action: () => openApp('github') },
    { label: 'Hire Me', action: () => openApp('developer') },
    null,
    { label: 'Terminal', action: () => openApp('terminal') },
  ];

  return (
    <div
      className={`fixed z-50000 w-52 bg-white/10 backdrop-blur-xl rounded-xl shadow-2xl p-1.5 border border-white/10 transition-all duration-200 ${visible ? 'win11-open' : 'win11-close opacity-0 pointer-events-none'
        }`}
      style={{ left: x, top: y }}
    >
      {items.map((item, i) =>
        item === null ? (
          <div key={i} className="my-1 border-t border-white/10" />
        ) : (
          <button key={item.label} onClick={() => { item.action(); onClose(); }} className="w-full text-left px-3 py-2 text-sm text-white rounded-xl hover:bg-white/20 transition-colors">
            {item.label}
          </button>
        )
      )}
    </div>
  );
});

// ─── DateTime Panel ───────────────────────────────────────────────────────
export const DateTimePanel = memo(function DateTimePanel({ visible }: { visible: boolean }) {
  const [now, setNow] = useState(new Date());
  const [viewed, setViewed] = useState(new Date());
  const [selected, setSelected] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const year = viewed.getFullYear();
  const month = viewed.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const days: { day: number; type: 'prev' | 'curr' | 'next' }[] = [];
  for (let i = 0; i < firstDay; i++) days.push({ day: prevMonthDays - firstDay + i + 1, type: 'prev' });
  for (let i = 1; i <= daysInMonth; i++) days.push({ day: i, type: 'curr' });
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) days.push({ day: i, type: 'next' });

  return (
    <Panel visible={visible} className="right-5 bottom-20 w-90 bg-white/90 p-4">
      <div className="text-center mb-6">
        <p className="text-4xl text-gray-800 tabular-nums mt-4">{now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</p>
        <p className="text-xs text-gray-500 mt-1">{selected.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-700">{viewed.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <div className="flex gap-1">
          <button onClick={() => setViewed(new Date(year, month - 1, 1))} className="p-1 rounded-full hover:bg-gray-100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <button onClick={() => setViewed(new Date(year, month + 1, 1))} className="p-1 rounded-full hover:bg-gray-100">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-1 text-xs text-center">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d} className="text-gray-400 font-medium py-1">{d}</div>)}
        {days.map((d, i) => {
          const isToday = d.type === 'curr' && d.day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
          const isSelected = d.type === 'curr' && d.day === selected.getDate() && month === selected.getMonth() && year === selected.getFullYear();
          return (
            <button
              key={i} onClick={() => d.type === 'curr' && setSelected(new Date(year, month, d.day))}
              className={['w-8 h-8 mx-auto rounded-full flex items-center justify-center transition-colors', d.type !== 'curr' ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100', isSelected ? 'bg-indigo-500 text-white hover:bg-indigo-600' : '', isToday && !isSelected ? 'ring-1 ring-indigo-400' : ''].join(' ')}
            >
              {d.day}
            </button>
          );
        })}
      </div>
    </Panel>
  );
});

// ─── OverlayLayer (Always persistent mount allowing closing animations) ─────
interface OverlayLayerProps {
  panels: PanelManager;
  allApps: Record<string, AppDefinition>;
  battery: BatteryStatus | null;
  windowManager: WindowManager;
  onOpenApp: (appId: string) => void;
}

export function OverlayLayer({ panels, allApps, battery, onOpenApp }: OverlayLayerProps) {
  return (
    <>
      <StartMenu allApps={allApps} onAppClick={onOpenApp} onClose={panels.closeAll} visible={panels.isOpen('startMenu')} />
      <RightMenu battery={battery} onWifiClick={() => panels.openPanel('wifi')} visible={panels.isOpen('rightMenu')} />
      <NotificationPanel visible={panels.isOpen('notifications')} />
      <DateTimePanel visible={panels.isOpen('dateTime')} />
      <ContextMenu x={panels.contextMenuPos.x} y={panels.contextMenuPos.y} onClose={panels.closeAll} visible={panels.isOpen('contextMenu')} />
      <StiyaBot visible={panels.isOpen('bot')} onClose={() => panels.closeAll()} onOpenApp={onOpenApp} />
      <WifiPanel visible={panels.isOpen('wifi')} onBackPressed={() => panels.openPanel('rightMenu')} />
    </>
  );
}