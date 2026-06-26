import IMG from '../../../assets/stiya/cat_net.png';
import { AnimatePresence, motion } from "framer-motion";
import { network_title, network_des, network_wifi_tab, network_ethernet_tab, network_scanning_text, network_ethernet_connected, network_ethernet_waiting, skip_btn, next_btn, network_connect_btn } from "../../../utils/constant";
import SetupLayoutPage from "../SetupLayout";
import type { NetworkType, SignalIconProps, WifiNetwork } from '../../../types';
import { useCallback, useEffect, useState } from 'react';
import { useSetupStore } from '../../../store/useSetupStore';
import { useNavigate } from 'react-router-dom';
import Loader from '../../../components/Loader';
import SetupButton from '../../../components/SetupButton';

export function SignalIcon({ signal }: SignalIconProps) {
    const bars = signal > 70 ? 3 : signal > 40 ? 2 : 1;

    return (
        <div className="flex items-end gap-0.5 h-4">
            {[1, 2, 3].map((bar) => (
                <div
                    key={bar}
                    className={`w-1 rounded-sm ${bar <= bars ? 'bg-gray-700' : 'bg-gray-200'}`}
                    style={{ height: `${bar * 4 + 2}px` }}
                />
            ))}
        </div>
    );
}

export default function NetworkPage() {

    const navigate = useNavigate();

    const setWizardData = useSetupStore((state) => state.setWizardData);

    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<NetworkType>('wifi');
    const [networks, setNetworks] = useState<WifiNetwork[]>([]);
    const [scanning, setScanning] = useState(true);
    const [selectedNetwork, setSelectedNetwork] = useState<WifiNetwork | null>(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [connectAuto, setConnectAuto] = useState(true);

    const [connectedWifi, setConnectedWifi] = useState<string | null>(null);
    const [connectingSsid, setConnectingSsid] = useState<string | null>(null);
    const [connectError, setConnectError] = useState<string | null>(null);

    const [ethernetConnected, setEthernetConnected] = useState(false);

    const runScan = useCallback(async () => {
        if (!window.networkAPI) {
            console.warn("Network context bridge API is missing or unlinked.");
            setNetworks([]);
            setConnectError('Network configuration utilities are unavailable.');
            setScanning(false);
            return;
        }

        setScanning(true);
        setConnectError(null);

        try {
            const result = await window.networkAPI.scanWifi();
            if (Array.isArray(result)) {
                setNetworks(result);
            } else {
                setNetworks([]);
            }
        } catch (err) {
            console.error(err);
            setNetworks([]);
            setConnectError('Failed to scan WiFi networks.');
        } finally {
            setScanning(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'wifi') {
            runScan();
        }
    }, [activeTab, runScan]);

    useEffect(() => {
        const checkNetwork = async () => {
            if (!window.networkAPI) return;
            try {
                const status = await window.networkAPI.getStatus();
                console.log("👉 REALTIME RECOVERY STATUS IS:", status);

                if (status) {
                    setEthernetConnected(!!status.ethernetConnected);
                    setConnectedWifi(status.wifiConnected ? status.activeSsid : null);
                }
            } catch (err) {
                console.error('Error fetching real-time connection stats:', err);
            }
        };

        checkNetwork();
        const timer = setInterval(checkNetwork, 3000);
        return () => clearInterval(timer);
    }, []);

    const handleWifiClick = (network: WifiNetwork) => {
        setConnectError(null);
        setSelectedNetwork(network);
        setPasswordInput('');
    };

    const executeConnection = async (ssid: string, pass: string) => {
        try {
            setConnectingSsid(ssid);
            setConnectError(null);

            const result = await window.networkAPI.connectWifi(ssid, pass);

            if (result.success) {
                setConnectedWifi(ssid);
                setSelectedNetwork(null);
                setPasswordInput('');
            } else {
                setConnectError(result.error || 'Failed to connect to WiFi.');
            }
        } catch (err) {
            setConnectError('An error occurred during verification.');
        } finally {
            setConnectingSsid(null);
        }
    };

    const executeDisconnect = async (ssid: string) => {
        try {
            setConnectingSsid(ssid);
            setConnectError(null);
            const res = await window.networkAPI.disconnectWifi();
            if (res.success) {
                setConnectedWifi(null);
                setSelectedNetwork(null);
            }
        } catch (err) {
            setConnectError('Failed to disconnect.');
        } finally {
            setConnectingSsid(null);
        }
    };

    const handleForgetNetwork = (ssid: string) => {
        alert(`Forget network configuration for: ${ssid}`);
        setSelectedNetwork(null);
    };

    const handleContinue = async () => {
        if (!canContinue) return;

        setLoading(true);

        if (activeTab === 'wifi' && connectedWifi) {
            setWizardData({
                network: {
                    type: 'wifi',
                    ssid: connectedWifi,
                },
            });
        } else if (activeTab === 'ethernet' && ethernetConnected) {
            setWizardData({
                network: {
                    type: 'ethernet',
                },
            });
        }

        await new Promise((resolve) =>
            setTimeout(resolve, 1000)
        );

        navigate('/signIn');
    };

    const closeModal = () => {
        if (connectingSsid) return;
        setSelectedNetwork(null);
        setPasswordInput('');
    };

    const canContinue = (activeTab === 'wifi' && !!connectedWifi) || (activeTab === 'ethernet' && ethernetConnected);

    return (
        <SetupLayoutPage stepIndex={1} hideIndicator={loading} onBack={() => navigate(-1)}>
            <AnimatePresence mode="wait">
                {loading ? (<Loader />) : (
                    <>
                        <div className="flex-2/5 flex items-center justify-center ps-20">
                            <img src={IMG} className="rounded-2xl w-sm" alt="Network" />
                        </div>

                        <div className="flex-3/5 px-25 py-15 items-center justify-center flex flex-col">
                            <h1 className="text-3xl font-semibold text-gray-950">{network_title}</h1>
                            <p className="text-md text-center mt-3 text-gray-600 max-w-md">{network_des}</p>

                            {/* Tab Selection */}
                            <div className="flex gap-2 mt-7 bg-gray-100 rounded-xl p-1">
                                <button
                                    onClick={() => setActiveTab('wifi')}
                                    className={`px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${activeTab === 'wifi' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                                >
                                    {network_wifi_tab}
                                </button>
                                <button
                                    onClick={() => setActiveTab('ethernet')}
                                    className={`px-5 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${activeTab === 'ethernet' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
                                >
                                    {network_ethernet_tab}
                                </button>
                            </div>

                            {/* Wi-Fi List View */}
                            {activeTab === 'wifi' && (
                                <div className="mt-6 w-full max-w-md">
                                    {scanning ? (
                                        <div className="flex items-center justify-center gap-2 py-10 text-sm text-gray-500">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                className="w-4 h-4 border-2 border-gray-300 border-t-gray-700 rounded-full"
                                            />
                                            {network_scanning_text}
                                        </div>
                                    ) : networks.length === 0 ? (
                                        <div className="py-10 text-sm text-gray-400 text-center">
                                            No networks found.
                                            <button onClick={runScan} className="ml-2 text-amber-600 underline cursor-pointer">
                                                Rescan
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="h-56 overflow-y-auto hidesb">
                                            {networks.map((net) => {
                                                const isCurrent = connectedWifi ? connectedWifi.trim().toLowerCase() === net.ssid.trim().toLowerCase() : false;
                                                const isConnecting = connectingSsid === net.ssid;

                                                return (
                                                    <button
                                                        key={net.ssid}
                                                        onClick={() => handleWifiClick(net)}
                                                        disabled={isConnecting}
                                                        className={`w-full flex items-center justify-between rounded-2xl px-8 py-5 mb-2 text-left transition cursor-pointer ${isCurrent ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <span className="flex items-center gap-2">
                                                            {net.ssid}
                                                            {!net.isKnown && <span className="text-xs">🔒</span>}
                                                        </span>

                                                        <div className="flex items-center gap-3">
                                                            {isConnecting && <span className="text-xs text-gray-500">Connecting...</span>}
                                                            {isCurrent && <span className="text-xs text-green-600 font-medium">Connected</span>}
                                                            <SignalIcon signal={net.signal} />
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {connectError && (
                                        <p className="text-xs text-red-500 text-center mt-3">{connectError}</p>
                                    )}
                                </div>
                            )}

                            {/* Ethernet Status View */}
                            {activeTab === 'ethernet' && (
                                <div className="mt-10 flex flex-col items-center gap-4">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${ethernetConnected ? 'bg-green-50' : 'bg-gray-50'}`}>
                                        <span className="text-2xl">{ethernetConnected ? '🔗' : '🔌'}</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {ethernetConnected ? network_ethernet_connected : network_ethernet_waiting}
                                    </p>
                                </div>
                            )}

                            {/* Bottom Navigation Buttons */}
                            <div className="flex gap-3 mt-8">
                                <SetupButton disabled={!canContinue} onClick={handleContinue} text={next_btn} />
                            </div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Connection Dialog Modal Overlay */}
            <AnimatePresence>
                {selectedNetwork && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-6 w-85 shadow-xl"
                        >
                            {/* 🔍 FIX HERE: Clean string comparison format using trim & lowerCase */}
                            {connectedWifi && connectedWifi.trim().toLowerCase() === selectedNetwork.ssid.trim().toLowerCase() ? (
                                /* IF CONNECTED: Show Disconnect & Forget Actions */
                                <>
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900 text-lg">{selectedNetwork.ssid}</h3>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                                            Connected
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">This network is currently active and managing your internet connection.</p>
                                    <div className="flex gap-2 mt-6">
                                        <button
                                            onClick={() => handleForgetNetwork(selectedNetwork.ssid)}
                                            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                                        >
                                            Forget
                                        </button>
                                        <button
                                            onClick={() => executeDisconnect(selectedNetwork.ssid)}
                                            disabled={connectingSsid === selectedNetwork.ssid}
                                            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:bg-gray-300 transition cursor-pointer"
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                </>
                            ) : (
                                /* IF NOT CONNECTED: Ask for password, checkbox & Connect Button */
                                <>
                                    <h3 className="font-semibold text-gray-900 text-lg">{selectedNetwork.ssid}</h3>
                                    <p className="text-xs text-gray-500 mt-1">Enter the network security password key</p>

                                    <input
                                        type="password"
                                        autoFocus
                                        value={passwordInput}
                                        onChange={(e) => setPasswordInput(e.target.value)}
                                        className="mt-4 w-full px-3 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-amber-500 text-sm"
                                        placeholder="Password"
                                    />

                                    <label className="flex items-center gap-2 mt-4 text-xs text-gray-600 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={connectAuto}
                                            onChange={(e) => setConnectAuto(e.target.checked)}
                                            className="rounded text-amber-500 focus:ring-amber-400 border-gray-300 w-3.5 h-3.5"
                                        />
                                        Connect automatically
                                    </label>

                                    <div className="flex gap-2 mt-5">
                                        <button
                                            onClick={closeModal}
                                            disabled={connectingSsid === selectedNetwork.ssid}
                                            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => executeConnection(selectedNetwork.ssid, passwordInput)}
                                            disabled={!passwordInput || connectingSsid === selectedNetwork.ssid}
                                            className="flex-1 py-2.5 rounded-lg text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 cursor-pointer"
                                        >
                                            {network_connect_btn}
                                        </button>
                                    </div>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </SetupLayoutPage>
    );
}