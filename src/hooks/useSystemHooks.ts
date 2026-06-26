import { useEffect, useState } from 'react';
import type { BatteryStatus } from '../types';
 
export function useBattery(): BatteryStatus | null {
  const [status, setStatus] = useState<BatteryStatus | null>(null);
 
  useEffect(() => {
    if (!('getBattery' in navigator)) return;
 
    let battery: any = null;
 
    const update = () => {
      if (!battery) return;
      setStatus({ level: battery.level * 100, charging: battery.charging });
    };
 
    (navigator as any).getBattery().then((b: any) => {
      battery = b;
      update();
      b.addEventListener('levelchange', update);
      b.addEventListener('chargingchange', update);
    }).catch(() => {});
 
    return () => {
      if (battery) {
        battery.removeEventListener('levelchange', update);
        battery.removeEventListener('chargingchange', update);
      }
    };
  }, []);
 
  return status;
}
 
export interface ClockState {
  timeShort: string;   // e.g. "3:42 PM"
  timeFull: string;    // e.g. "03:42:10 PM"
  dateShort: string;   // e.g. "Tue, 23 Jun"
  dateFull: string;    // e.g. "Tuesday, 23 June 2026"
}
 
export function useClock(): ClockState {
  const format = (): ClockState => {
    const now = new Date();
    return {
      timeShort: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      timeFull: now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }),
      dateShort: now.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit', month: 'short' }),
      dateFull: now.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    };
  };
 
  const [state, setState] = useState<ClockState>(format);
 
  useEffect(() => {
    const id = window.setInterval(() => setState(format()), 1000);
    return () => window.clearInterval(id);
  }, []);
 
  return state;
}