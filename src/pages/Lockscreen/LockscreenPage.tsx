import { AnimatePresence, motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSetupStore } from "../../store/useSetupStore";
import BACKGROUND from '../../assets/backgrounds/bg3.jpg';
import WifiIcon from "../../components/WifiIcon";

const PIN_LENGTH = 4;

function PinDots({ length, filled }: { length: number; filled: number }) {
    return (
        <div className="flex gap-4">
            {Array.from({ length }).map((_, i) => (
                <motion.div
                    key={i} initial={{ scale: 0.8 }} animate={{ scale: i < filled ? 1 : 0.9 }}
                    className={`w-4 h-4 rounded-full border-2 transition ${i < filled ? 'bg-amber-500 border-amber-500' : 'border-white/40'}`}
                />
            ))}
        </div>
    );
}

export default function LockscreenPage() {

    const navigate = useNavigate();
    const wizardData = useSetupStore((s) => s.wizardData);

    const [screenState, setScreenState] = useState<'locked' | 'keypad' | 'loading'>('locked');
    const [pin, setPin] = useState<string[]>(new Array(PIN_LENGTH).fill(''));
    const [shake, setShake] = useState(false);
    const [time, setTime] = useState(new Date());
    const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

    const [wifiName, setWifiName] = useState('Wi-Fi');
    const [wifiConnected, setWifiConnected] = useState(false);
    const [wifiStrength, setWifiStrength] = useState(4);

    const userName = wizardData.pcName;
    const savedPinCode = wizardData?.pin;
    const avatar = wizardData?.auth?.avatar;

    useEffect(() => {
        let battery: any;
        if ('getBattery' in navigator) {
            (navigator as any).getBattery().then((b: any) => {
                battery = b;
                setBatteryLevel(Math.round(b.level * 100));
                battery.addEventListener('levelchange', () => setBatteryLevel(Math.round(b.level * 100)));
            });
        }
        return () => battery?.removeEventListener('levelchange', () => { });
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        const checkNetwork = async () => {
            if (window.networkAPI?.getStatus) {
                const status = await window.networkAPI.getStatus();
                if (status) {
                    setWifiConnected(!!status.wifiConnected);
                    setWifiName(status.wifiConnected && status.activeSsid ? status.activeSsid : 'Wi-Fi');
                    const sig = status.signalStrength;
                    setWifiStrength(sig > -50 ? 4 : sig > -60 ? 3 : sig > -70 ? 2 : sig > -80 ? 1 : 4);
                }
            }
        };

        checkNetwork();
        const netTimer = setInterval(checkNetwork, 4000);

        const handleKeyDown = (e: KeyboardEvent) => {
            if (screenState === 'loading') return;
            if (screenState === 'locked') return setScreenState('keypad');
            if (!isNaN(Number(e.key)) && e.key !== ' ') handleDigitPress(e.key);
            else if (e.key === 'Backspace') handleBackspace();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.speechSynthesis?.getVoices();

        return () => {
            clearInterval(timer);
            clearInterval(netTimer);
            window.removeEventListener('keydown', handleKeyDown);
            window.speechSynthesis.cancel();
        };
    }, [screenState, pin]);

    useEffect(() => {
        if (screenState !== 'keypad') return;
        const resetLock = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => { setScreenState('locked'); setPin(new Array(PIN_LENGTH).fill('')); }, 100000);
        };
        let inactivityTimer: ReturnType<typeof setTimeout>;
        const evts: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'touchstart'];
        evts.forEach(e => window.addEventListener(e, resetLock));
        resetLock();
        return () => evts.forEach(e => window.removeEventListener(e, resetLock));
    }, [screenState]);

    const handleDigitPress = (digit: string) => {
        if (screenState === 'loading') return;
        const idx = pin.findIndex(d => d === '');
        if (idx === -1) return;
        const newPin = [...pin];
        newPin[idx] = digit;
        setPin(newPin);
        if (newPin.join('').length === PIN_LENGTH) {
            if (newPin.join('') === savedPinCode) {
                setScreenState('loading'); // 👈 State switched to loader instantly
                setTimeout(() => { navigate('/desktop'); }, 1500);
            } else {
                setShake(true);
                setTimeout(() => setShake(false), 400);
                setPin(new Array(PIN_LENGTH).fill(''));
            }
        }
    };

    const handleBackspace = () => {
        const lastIdx = PIN_LENGTH - 1 - [...pin].reverse().findIndex(d => d !== '');
        if (lastIdx < PIN_LENGTH) { const newPin = [...pin]; newPin[lastIdx] = ''; setPin(newPin); }
    };

    return (
        <div
            className="w-screen h-screen select-none overflow-hidden relative font-sans flex flex-col justify-between items-center bg-cover bg-center transition-all duration-700 p-12 text-white"
            style={{ backgroundImage: `url(${BACKGROUND})` }}
            onClick={() => screenState === 'locked' && setScreenState('keypad')}
        >
            <div className="absolute top-5 right-7 flex items-center gap-3 opacity-90 text-[13px] font-medium tracking-wide z-10 drop-shadow-sm">
                <span className="flex items-center gap-1.5 cursor-default">
                    <span className="text-[12px] opacity-85 font-medium">{wifiConnected ? wifiName : 'Disconnected'}</span>
                    <WifiIcon connected={wifiConnected} strength={wifiStrength} />
                </span>
                <span className="h-4 w-px bg-white/20" />
                <span className="flex items-center gap-1">
                    {batteryLevel !== null ? `${batteryLevel}%` : ''}
                    <BatteryIcon level={batteryLevel} />
                </span>
            </div>

            <div className={`absolute inset-0 transition-all duration-700 z-0 ${screenState !== 'locked' ? 'backdrop-blur-3xl bg-black/40' : ''}`} />
            <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-b from-black/10 via-transparent to-black/30" />

            <AnimatePresence mode="wait">
                {screenState === 'locked' && (
                    <motion.div
                        key="clock" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}
                        className="flex flex-col items-center text-center mt-10 z-10 drop-shadow-[0_4px_20px_rgba(0,0,0,0.45)]"
                    >
                        <h1 className="text-9xl mt-30 font-medium tracking-tight">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</h1>
                        <p className="text-lg tracking-wide opacity-90 mt-3">{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {screenState === 'locked' && <div className="z-10" />}

            <div className="w-full max-w-sm flex flex-col items-center mb-8 z-10">
                <AnimatePresence mode="wait">
                    {screenState === 'locked' && (
                        <motion.div key="locked" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="flex flex-col items-center text-center mt-20">
                            <p className="text-md text-white animate-bounce tracking-wide mt-1">Tap or press to unlock</p>
                        </motion.div>
                    )}

                    {screenState === 'keypad' && (
                        <motion.div key="active" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.25 }} className="flex flex-col items-center w-full z-10 absolute inset-0 translate-y-40" onClick={e => e.stopPropagation()}>
                            <div className="w-28 h-28 rounded-full border border-white/30 flex items-center justify-center shadow-2xl mb-3 overflow-hidden ring-4 ring-white/10">
                            <img src={avatar || BACKGROUND} className="w-full h-full object-cover" alt={userName} /></div>
                            <h2 className="text-xl font-medium tracking-wide mb-6 mt-2 text-white/90">{userName}</h2>
                            <motion.div animate={shake ? { x: [0, -8, 8, -8, 0] } : { x: 0 }} transition={{ duration: 0.4 }} className="mb-10 mt-10">
                                <PinDots length={PIN_LENGTH} filled={pin.filter(d => d !== '').length} />
                            </motion.div>
                            <div className="grid grid-cols-3 gap-6">
                                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((key, i) => key === '' ? <div key={i} /> : (
                                    <button
                                        key={i} type="button" onClick={() => key === '⌫' ? handleBackspace() : handleDigitPress(key)}
                                        className={`w-16 h-16 rounded-full text-xl font-medium text-white transition active:scale-95 flex items-center justify-center cursor-pointer ${key === '⌫' ? 'bg-transparent' : 'bg-white/10 hover:bg-white/20'}`}
                                    >
                                        {key}
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => { setScreenState('locked'); setPin(new Array(PIN_LENGTH).fill('')); }} className="text-white/40 hover:text-white/70 transition text-sm mt-10 cursor-pointer hover:underline tracking-wide">Cancel & Lock</button>
                        </motion.div>
                    )}

                    {/* 🔄 Beautiful Progress Loader injected natively inside core switch streams */}
                    {screenState === 'loading' && (
                        <motion.div key="loader" className="flex justify-center items-center absolute inset-0 translate-y-44" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <motion.svg
                                width="70"
                                height="70"
                                viewBox="0 0 70 70"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                                {/* Base Background Track Circle - Transparent with safe visibility depth */}
                                <circle
                                    cx="35"
                                    cy="35"
                                    r="25"
                                    fill="none"
                                    stroke="rgba(255, 255, 255, 0.1)"
                                    strokeWidth="5"
                                />

                                {/* Primary Loading Segment Ring Arc - Pure Amber-500 Color Tone */}
                                <circle
                                    cx="35"
                                    cy="35"
                                    r="25"
                                    fill="none"
                                    stroke="#f59e0b"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    strokeDasharray="45 160"
                                />
                            </motion.svg>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function BatteryIcon({ level }: { level: number | null }) {
    return (
        <svg width="22" height="11" viewBox="0 0 22 11" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.5" y="0.5" width="18" height="10" rx="2.5" stroke="white" strokeOpacity="0.7" />
            <rect x="19.5" y="3.5" width="1.5" height="4" rx="0.75" fill="white" fillOpacity="0.7" />
            <rect x="2" y="2" width={Math.max(0, ((level ?? 100) / 100) * 15)} height="7" rx="1.5" fill="white" />
        </svg>
    );
}