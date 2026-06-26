import { memo, useEffect, useState } from "react";
import type { WifiNetwork } from "../types";
import { CaretLeftIcon, WifiHighIcon } from "@phosphor-icons/react";
import { SignalIcon } from "../pages/Setup/Network/NetworkPage";

interface WifiPanelProps {
    visible: boolean;
    onBackPressed: () => void;
}

export const WifiPanel = memo(function WifiPanel({ visible, onBackPressed }: WifiPanelProps) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [wifiList, setWifiList] = useState<WifiNetwork[]>([]);
    const [connectedWifi, setConnectedWifi] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState<string | null>(null);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState<string | null>(null);
    const [password, setPassword] = useState<string>('');

    const syncNetworkStatus = async () => {
        if (!window.networkAPI) return;

        try {
            const status = await window.networkAPI.getStatus();

            setConnectedWifi(
                status.wifiConnected
                    ? status.activeSsid
                    : null
            );
        } catch (err) {
            console.error(err);
        }
    };

    const handleScan = async () => {
        if (!window.networkAPI) return;

        setIsLoading(true);
        setError(null);

        try {
            const networks =
                await window.networkAPI.scanWifi();

            setWifiList(
                Array.isArray(networks)
                    ? networks
                    : []
            );

            await syncNetworkStatus();
        } catch (err) {
            console.error(err);
            setError(
                "Failed to scan for Wi-Fi networks."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleConnectionToggle = async (
        network: WifiNetwork
    ) => {
        if (!window.networkAPI) return;

        try {
            setIsConnecting(network.ssid);
            setError(null);

            const isConnected =
                connectedWifi?.trim().toLowerCase() ===
                network.ssid.trim().toLowerCase();

            if (isConnected) {
                const result =
                    await window.networkAPI.disconnectWifi();

                if (!result.success) {
                    setError(
                        result.error ??
                        "Failed to disconnect."
                    );
                    return;
                }

                setConnectedWifi(null);
            } else if (network.isKnown) {
                const result =
                    await window.networkAPI.connectWifi(
                        network.ssid,
                        ""
                    );

                if (!result.success) {
                    setError(
                        result.error ??
                        "Failed to connect."
                    );
                    return;
                }

                setConnectedWifi(network.ssid);
            } else {
                setShowPasswordPrompt(
                    network.ssid
                );
            }

            await syncNetworkStatus();
        } catch (err) {
            console.error(err);

            setError(
                "Network operation failed."
            );
        } finally {
            setIsConnecting(null);
        }
    };

    const handleConnect = async () => {
        if (
            !showPasswordPrompt ||
            !window.networkAPI
        ) {
            return;
        }

        try {
            setIsConnecting(
                showPasswordPrompt
            );

            setError(null);

            const result =
                await window.networkAPI.connectWifi(
                    showPasswordPrompt,
                    password
                );

            if (!result.success) {
                setError(
                    result.error ??
                    "Invalid password."
                );
                return;
            }

            await syncNetworkStatus();

            setShowPasswordPrompt(null);
            setPassword("");
        } catch (err) {
            console.error(err);

            setError(
                "Failed to connect."
            );
        } finally {
            setIsConnecting(null);
        }
    };

    useEffect(() => {
        if (!visible) return;

        const timer = setInterval(() => {
            syncNetworkStatus();
        }, 3000);

        return () => clearInterval(timer);
    }, [visible]);

    return (
        <div
            className={`absolute z-40000 right-5 bottom-20 w-80 bg-white/75 p-4 flex flex-col border border-white/50 backdrop-blur-2xl rounded-3xl shadow-2xl transition-all duration-300 ${visible ? 'win11-open' : 'win11-close opacity-0 pointer-events-none'
                }`}
        >
            {/* Header / Action Bar */}
            <div className="flex items-center justify-between rounded-2xl p-2.5 bg-white shadow-sm">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onBackPressed}
                        className="p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                        aria-label="Back to quick settings"
                    >
                        <CaretLeftIcon />
                    </button>
                    <span className="text-sm font-medium text-gray-800">WiFi</span>
                </div>
                <button
                    onClick={handleScan}
                    disabled={isLoading}
                    className="text-xs px-2.5 py-1.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-gray-700 font-medium disabled:opacity-50"
                >
                    {isLoading ? 'Scanning…' : 'Rescan'}
                </button>
            </div>

            {/* Error Message */}
            {error && <p className="text-[11px] text-red-500 mt-2 px-1">{error}</p>}

            {/* Network List Container */}
            <div className="mt-2 space-y-1.5 overflow-y-auto max-h-60 pr-0.5" style={{ scrollbarWidth: 'none' }}>
                {wifiList.length > 0 ? (
                    wifiList.map((wifi, index) => {
                        const isConnectedNetwork =
                            connectedWifi?.trim().toLowerCase() ===
                            wifi.ssid.trim().toLowerCase();

                        const isConnectingNetwork = wifi.ssid === isConnecting;

                        return (
                            <div
                                key={index}
                                className={`p-3 rounded-2xl w-full flex flex-col transition-colors shadow-sm bg-white border border-transparent ${isConnectedNetwork ? 'border-indigo-200/60 bg-indigo-50/20' : 'hover:bg-gray-50'
                                    }`}
                            >
                                <div className="flex gap-3 w-full items-start">
                                    <div className="mt-0.5 shrink-0 text-gray-700">
                                        <SignalIcon signal={wifi.signal} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-900 truncate">{wifi.ssid}</p>
                                        <p className="text-[10px] text-gray-500">
                                            {isConnectedNetwork ? 'Connected, secured' : 'Available'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleConnectionToggle(wifi)}
                                    disabled={isConnectingNetwork}
                                    className="text-[11px] font-medium px-3 py-1.5 mt-2 w-fit self-end text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all disabled:opacity-50"
                                >
                                    {isConnectingNetwork ? 'Connecting…' : isConnectedNetwork ? 'Disconnect' : 'Connect'}
                                </button>
                            </div>
                        );
                    })
                ) : (
                    !isLoading && <p className="text-xs text-gray-400 text-center py-6 bg-white/50 rounded-2xl">No networks found</p>
                )}
            </div>

            {/* Inline Password Dialog Container */}
            {showPasswordPrompt && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-xs flex items-center justify-center z-[50000]">
                    <div className="bg-white p-5 rounded-3xl w-72 shadow-2xl border border-gray-100">
                        <h3 className="text-xs font-semibold mb-2 text-gray-800 truncate">Connect to {showPasswordPrompt}</h3>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none focus:ring-1 focus:ring-indigo-500 mb-4 transition-all"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => { setShowPasswordPrompt(null); setPassword(''); }}
                                className="px-3 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConnect}
                                className="px-3 py-1.5 text-xs font-medium bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                            >
                                Connect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});