import { useEffect, useState } from "react";
import {
    UserIcon,
    GearIcon,
    ShieldCheckIcon,
    PaintBucketIcon,
    TrophyIcon,
    MedalIcon,
    ArrowLeftIcon,
    BellRingingIcon,
    CameraIcon,
    CheckIcon,
    CloudArrowUpIcon,
    CodeIcon,
    CpuIcon,
    DesktopIcon,
    EnvelopeIcon,
    EyeIcon,
    Gear,
    GithubLogoIcon,
    GlobeIcon,
    HardDrivesIcon,
    HeartIcon,
    InfoIcon,
    LinkedinLogoIcon,
    MapPinIcon,
    Medal,
    MemoryIcon,
    MonitorIcon,
    PaintBucket,
    PhoneIcon,
    RocketIcon,
    ShieldCheck,
    SignOutIcon,
    SlidersIcon,
    SparkleIcon,
    SpinnerIcon,
    StarIcon,
    SunIcon,
    Trophy,
    User,
    UserCircleIcon,
    UserListIcon,
    UserPlusIcon,
    WarningIcon,
    WifiHighIcon,
    WrenchIcon,
    XIcon,
    YoutubeLogoIcon,
    LockIcon,
    Image,
} from "@phosphor-icons/react";

interface SystemInformation {
    name: string;
    version: string;
    author: string;
    features: string[];
    sessionId: string;
    lastUpdated: string;
    buildNumber: string;
    kernel: string;
    architecture: string;
    uptime: string;
    memory: {
        total: string;
        used: string;
        free: string;
    };
    storage: {
        total: string;
        used: string;
        free: string;
    };
    network: {
        status: string;
        ip: string;
        speed: string;
    };
}

export default function Settings() {
    const [show, setShow] = useState(true);
    const [showDisplay, setShowDisplay] = useState(false);
    const [showInfo, setShowInfo] = useState(false);
    const [showUser, setShowUser] = useState(false);
    const [brightness, setBrightness] = useState(100);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [activeTab, setActiveTab] = useState('general');
    const [showPassword, setShowPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
    const [systemInfo, setSystemInfo] = useState<SystemInformation>({
        name: "TenjikuOS",
        version: "2.4.1",
        buildNumber: "2024.07.15.001",
        author: "Harsh Kumar Singh",
        features: [
            "Modern Desktop Interface",
            "Integrated App Ecosystem",
            "Advanced Security Features",
            "Customizable UI/UX",
            "Cloud Sync Integration",
            "Developer Tools Suite",
            "Media Player with Equalizer",
            "Photo Management System"
        ],
        sessionId: "SES-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        lastUpdated: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        kernel: "TenjikuKernel 5.15.0",
        architecture: "x86_64",
        uptime: "2d 14h 32m",
        memory: {
            total: "16 GB",
            used: "8.2 GB",
            free: "7.8 GB"
        },
        storage: {
            total: "512 GB",
            used: "234 GB",
            free: "278 GB"
        },
        network: {
            status: "Connected",
            ip: "192.168.1.100",
            speed: "100 Mbps"
        }
    });

    const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleBrightnessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBrightness(Number(e.target.value));
    };

    const handleWallpaperChange = (url: any) => {
        setShow(true);
        setShowDisplay(false);
        setShowInfo(false);
        setShowUser(false);
        console.log("wallpaper: ", url);
        showNotification('success', 'Wallpaper updated successfully');
    };

    const handleSignout = () => {
        if (window.confirm("Are you sure you want to sign out?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const handleUpdate = async () => {
        if (!username) {
            showNotification('error', 'Username is required');
            return;
        }

        if (!oldPassword) {
            showNotification('error', 'Old password is required');
            return;
        }

        if (!password) {
            showNotification('error', 'New password is required');
            return;
        }

        if (password !== confirmPassword) {
            showNotification('error', 'Passwords do not match');
            return;
        }

        if (password.length < 8) {
            showNotification('error', 'Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            // Simulated API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            localStorage.setItem("username", username);
            localStorage.setItem("passwordUpdated", "true");
            showNotification('success', 'Profile updated successfully!');

            // Clear fields
            setOldPassword("");
            setPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            showNotification('error', error.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    return (
        <div className="flex h-full w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8">
            {/* Notification Toast */}
            {notification && (
                <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
                    <div className={`flex items-center space-x-3 px-5 py-3 rounded-xl shadow-2xl border ${notification.type === 'success'
                            ? 'bg-green-500 text-white border-green-400'
                            : notification.type === 'error'
                                ? 'bg-red-500 text-white border-red-400'
                                : 'bg-blue-500 text-white border-blue-400'
                        }`}>
                        {notification.type === 'success' && <CheckIcon size={20} weight="bold" />}
                        {notification.type === 'error' && <WarningIcon size={20} weight="bold" />}
                        {notification.type === 'info' && <InfoIcon size={20} weight="bold" />}
                        <span className="font-medium">{notification.message}</span>
                        <button
                            onClick={() => setNotification(null)}
                            className="ml-2 p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <XIcon size={16} weight="bold" />
                        </button>
                    </div>
                </div>
            )}

            <div className="w-full max-w-7xl mx-auto">
                {show ? showMain() : null}
                {!show ? (
                    <div className="flex w-full h-full flex-col space-y-4">
                        <button
                            onClick={() => {
                                setShow(true);
                                setShowDisplay(false);
                                setShowInfo(false);
                                setShowUser(false);
                            }}
                            className="flex items-center space-x-2 bg-white dark:bg-gray-800 w-28 py-2.5 px-4 rounded-xl text-black dark:text-white text-sm hover:shadow-xl border border-slate-200 dark:border-gray-700 transition-all duration-200 font-medium"
                        >
                            <ArrowLeftIcon size={18} weight="bold" />
                            <span>Back</span>
                        </button>
                        {showDisplay ? display() : null}
                        {showInfo ? info() : null}
                        {showUser ? user() : null}
                    </div>
                ) : null}
            </div>
        </div>
    );

    function user() {
        return (
            <div className="flex h-full w-full">
                <div className="bg-white dark:bg-gray-800 me-7 w-3/5 mb-10 rounded-2xl shadow-lg px-8 py-6 flex flex-col space-y-6 overflow-y-auto scrollbar-hide border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl">
                            <UserCircleIcon size={24} className="text-white" weight="fill" />
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-white font-bold text-xl">Current User</p>
                            <p className="text-slate-500 dark:text-gray-400 font-regular text-sm">Manage your account settings</p>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-6">
                        <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-pink-50 dark:from-gray-700/50 dark:to-gray-700/50 rounded-2xl">
                            <div className="relative">
                                <img
                                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                                    width={60}
                                    height={60}
                                    alt="User Profile"
                                    className="rounded-full ring-4 ring-white dark:ring-gray-600 shadow-lg"
                                />
                                <button className="absolute -bottom-1 -right-1 p-1.5 bg-orange-400 rounded-full text-white hover:bg-orange-500 transition-colors">
                                    <CameraIcon size={14} weight="fill" />
                                </button>
                            </div>
                            <div className="flex-1">
                                <p className="text-black dark:text-white font-bold text-lg">{username || "User"}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Administrator</p>
                                <div className="flex items-center space-x-2 mt-1">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    <span className="text-xs text-green-500 font-medium">Online</span>
                                </div>
                            </div>
                            <button className="px-4 py-2 bg-orange-400 text-white rounded-xl hover:bg-orange-500 transition-colors text-sm font-medium">
                                Change Photo
                            </button>
                        </div>

                        <div>
                            <p className="text-slate-900 dark:text-white font-semibold mb-4 text-lg">Update Credentials</p>

                            <div className="space-y-4">
                                <div className="relative">
                                    <div className="flex items-center border-2 border-slate-200 dark:border-gray-600 px-4 py-3 rounded-xl focus-within:border-orange-400 transition-colors">
                                        <User size={20} className="text-gray-400 dark:text-gray-500" weight="bold" />
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="bg-transparent text-slate-900 dark:text-white outline-none w-full placeholder-gray-300 dark:placeholder-gray-600 ml-3"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <div className="flex items-center border-2 border-slate-200 dark:border-gray-600 px-4 py-3 rounded-xl rounded-b-none focus-within:border-orange-400 transition-colors">
                                        <LockIcon size={20} className="text-gray-400 dark:text-gray-500" weight="bold" />
                                        <input
                                            type={showOldPassword ? "text" : "password"}
                                            placeholder="Old Password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="bg-transparent text-slate-900 dark:text-white outline-none w-full placeholder-gray-300 dark:placeholder-gray-600 ml-3"
                                            autoComplete="off"
                                        />
                                        <button onClick={() => setShowOldPassword(!showOldPassword)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                            <EyeIcon size={18} weight={showOldPassword ? "fill" : "regular"} />
                                        </button>
                                    </div>
                                    <div className="flex items-center border-2 border-slate-200 dark:border-gray-600 px-4 py-3 focus-within:border-orange-400 transition-colors border-t-0">
                                        <LockIcon size={20} className="text-gray-400 dark:text-gray-500" weight="bold" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="New Password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="bg-transparent text-slate-900 dark:text-white outline-none w-full placeholder-gray-300 dark:placeholder-gray-600 ml-3"
                                            autoComplete="off"
                                        />
                                        <button onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                            <EyeIcon size={18} weight={showPassword ? "fill" : "regular"} />
                                        </button>
                                    </div>
                                    <div className="flex items-center border-2 border-slate-200 dark:border-gray-600 px-4 py-3 rounded-xl rounded-t-none focus-within:border-orange-400 transition-colors border-t-0">
                                        <LockIcon size={20} className="text-gray-400 dark:text-gray-500" weight="bold" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm Password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="bg-transparent text-slate-900 dark:text-white outline-none w-full placeholder-gray-300 dark:placeholder-gray-600 ml-3"
                                            autoComplete="off"
                                        />
                                        <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                            <EyeIcon size={18} weight={showConfirmPassword ? "fill" : "regular"} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <button
                                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${loading
                                                ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                                                : 'bg-gradient-to-r from-orange-400 to-pink-500 hover:from-orange-500 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
                                            }`}
                                        disabled={loading}
                                        onClick={handleUpdate}
                                    >
                                        <span className="flex items-center justify-center space-x-2">
                                            {loading ? (
                                                <>
                                                    <SpinnerIcon size={18} className="animate-spin" />
                                                    <span>Updating...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckIcon size={18} weight="bold" />
                                                    <span>Update Profile</span>
                                                </>
                                            )}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 w-3/5 mb-10 rounded-2xl shadow-lg px-8 py-6 flex flex-col space-y-6 overflow-y-auto scrollbar-hide border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl">
                            <UserListIcon size={24} className="text-white" weight="fill" />
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-white font-bold text-xl">Switch Accounts</p>
                            <p className="text-slate-500 dark:text-gray-400 font-regular text-sm">Manage multiple accounts</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="mt-4 w-full">
                            <p className="text-slate-900 dark:text-white font-semibold mb-4 text-lg">Active Sessions</p>
                            <ul className="space-y-2">
                                <li className="flex items-center justify-between border-2 border-slate-200 dark:border-gray-600 p-5 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-all duration-200 cursor-pointer">
                                    <div className="flex justify-center items-center gap-3">
                                        <div className="relative">
                                            <img
                                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
                                                width={40}
                                                height={40}
                                                alt="User Profile"
                                                className="rounded-full ring-2 ring-green-500 h-10 w-10 object-cover"
                                            />
                                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></span>
                                        </div>
                                        <div>
                                            <span className="text-slate-900 dark:text-white font-medium">{username || "User"}</span>
                                            <p className="text-xs text-gray-500">Current Session</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSignout}
                                        className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 py-2 px-4 text-sm rounded-xl transition-all duration-200 font-medium"
                                    >
                                        <SignOutIcon size={16} weight="bold" />
                                        <span>Sign Out</span>
                                    </button>
                                </li>
                            </ul>

                            <button className="w-full mt-4 flex items-center justify-center space-x-2 border-2 border-dashed border-slate-200 dark:border-gray-600 p-5 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-all duration-200 text-gray-500 dark:text-gray-400 font-medium">
                                <UserPlusIcon size={20} weight="bold" />
                                <span>Add New Account</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 text-center">
                            <HeartIcon size={32} className="mx-auto text-pink-500 mb-2" weight="fill" />
                            <p className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-500 font-bold text-2xl">
                                Thank You!
                            </p>
                            <p className="text-slate-600 dark:text-gray-300 text-sm mt-1">We hope you enjoy TenjikuOS</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 w-2/5 ms-7 mb-10 rounded-2xl shadow-lg px-8 py-6 flex flex-col space-y-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl">
                            <ShieldCheck size={24} className="text-white" weight="fill" />
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-white font-bold text-lg">Security Tips</p>
                        </div>
                    </div>

                    <div className="space-y-4 flex-1">
                        <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <InfoIcon size={20} className="text-blue-500 flex-shrink-0 mt-0.5" weight="fill" />
                            <div>
                                <p className="font-medium text-sm">Strong Password</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Use at least 8 characters with a mix of letters, numbers, and symbols.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <ShieldCheck size={20} className="text-green-500 flex-shrink-0 mt-0.5" weight="fill" />
                            <div>
                                <p className="font-medium text-sm">Two-Factor Auth</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Enable 2FA for an extra layer of security on your account.</p>
                            </div>
                        </div>

                        <div className="flex items-start space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                            <BellRingingIcon size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" weight="fill" />
                            <div>
                                <p className="font-medium text-sm">Regular Updates</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Keep your system updated for the latest security patches.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    function info() {
        return (
            <div className="flex h-full w-full">
                <div className="me-7 bg-white dark:bg-gray-800 w-3/5 mb-10 rounded-2xl shadow-lg px-8 py-6 flex flex-col space-y-6 overflow-y-auto scrollbar-hide border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl">
                            <InfoIcon size={24} className="text-white" weight="fill" />
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-white font-bold text-xl">System Information</p>
                            <p className="text-slate-500 dark:text-gray-400 text-sm">Detailed system specifications</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700/50 dark:to-gray-700/50 p-4 rounded-xl">
                            <CpuIcon size={24} className="text-blue-500 mb-2" weight="fill" />
                            <p className="text-sm font-semibold">{systemInfo.kernel}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Kernel Version</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-gray-700/50 dark:to-gray-700/50 p-4 rounded-xl">
                            <MemoryIcon size={24} className="text-purple-500 mb-2" weight="fill" />
                            <p className="text-sm font-semibold">{systemInfo.memory.total}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Total Memory</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-700/50 dark:to-gray-700/50 p-4 rounded-xl">
                            <HardDrivesIcon size={24} className="text-green-500 mb-2" weight="fill" />
                            <p className="text-sm font-semibold">{systemInfo.storage.free} free</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Storage</p>
                        </div>

                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-700/50 dark:to-gray-700/50 p-4 rounded-xl">
                            <WifiHighIcon size={24} className="text-orange-500 mb-2" weight="fill" />
                            <p className="text-sm font-semibold">{systemInfo.network.status}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">Network</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">System Name</span>
                            <span className="text-sm font-medium">{systemInfo.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
                            <span className="text-sm font-medium">{systemInfo.version}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Build</span>
                            <span className="text-sm font-medium">{systemInfo.buildNumber}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Architecture</span>
                            <span className="text-sm font-medium">{systemInfo.architecture}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
                            <span className="text-sm font-medium">{systemInfo.uptime}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Session ID</span>
                            <span className="text-xs font-mono font-medium">{systemInfo.sessionId}</span>
                        </div>
                    </div>

                    <div>
                        <p className="font-semibold mb-3">Features</p>
                        <div className="grid grid-cols-2 gap-2">
                            {systemInfo.features.map((feature, index) => (
                                <div key={index} className="flex items-center space-x-2 text-sm">
                                    <CheckIcon size={16} className="text-green-500" weight="bold" />
                                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 w-3/5 mb-10 rounded-2xl shadow-lg px-8 py-6 flex flex-col space-y-6 overflow-y-auto scrollbar-hide border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl">
                            <CodeIcon size={24} className="text-white" weight="fill" />
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-white font-bold text-xl">Developer Profile</p>
                            <p className="text-slate-500 dark:text-gray-400 text-sm">About the creator</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700/50 dark:to-gray-700/50 rounded-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
                            width={60}
                            height={60}
                            alt="Developer"
                            className="rounded-full ring-4 ring-white dark:ring-gray-600"
                        />
                        <div>
                            <p className="font-bold text-lg">Harsh Kumar Singh</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Full Stack Developer</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center space-x-3 text-sm">
                            <MapPinIcon size={18} className="text-red-500" weight="fill" />
                            <span>India</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <EnvelopeIcon size={18} className="text-blue-500" weight="fill" />
                            <a href="mailto:harsh95829@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                                harsh95829@gmail.com
                            </a>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <PhoneIcon size={18} className="text-green-500" weight="fill" />
                            <span>+91 9536303129</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                            <GlobeIcon size={18} className="text-purple-500" weight="fill" />
                            <a href="https://developerharsh01.vercel.app" target="_blank" className="text-blue-600 dark:text-blue-400 hover:underline">
                                developerharsh01.vercel.app
                            </a>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <a href="https://github.com/Developer-Harsh" target="_blank" className="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <GithubLogoIcon size={24} weight="fill" />
                        </a>
                        <a href="https://www.linkedin.com/in/developerharsh" target="_blank" className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors">
                            <LinkedinLogoIcon size={24} className="text-blue-600" weight="fill" />
                        </a>
                        <a href="https://www.youtube.com/@developerharsh" target="_blank" className="p-3 bg-red-100 dark:bg-red-900/20 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/30 transition-colors">
                            <YoutubeLogoIcon size={24} className="text-red-600" weight="fill" />
                        </a>
                    </div>

                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4 text-center">
                        <SparkleIcon size={24} className="mx-auto text-yellow-500 mb-1" weight="fill" />
                        <p className="text-sm font-medium">Wanna develop something?</p>
                        <a href="mailto:harsh95829@gmail.com" className="text-orange-500 hover:text-orange-600 font-semibold text-sm">
                            Contact Harsh!
                        </a>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 w-2/5 ms-7 mb-10 rounded-2xl shadow-lg px-8 py-6 flex flex-col space-y-4 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
                            <Trophy size={24} className="text-white" weight="fill" />
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-white font-bold text-lg">Achievements</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                            <Medal size={24} className="text-yellow-500" weight="fill" />
                            <div>
                                <p className="font-medium text-sm">Top Developer 2024</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">Recognized for excellence</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                            <RocketIcon size={24} className="text-blue-500" weight="fill" />
                            <div>
                                <p className="font-medium text-sm">Fastest Growing OS</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">10k+ users worldwide</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                            <StarIcon size={24} className="text-green-500" weight="fill" />
                            <div>
                                <p className="font-medium text-sm">Open Source Star</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">500+ GitHub stars</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    function display() {
        return (
            <div className="flex h-full w-full">
                <div className="bg-white dark:bg-gray-800 w-3/5 mb-10 rounded-2xl shadow-lg px-8 py-6 flex flex-col space-y-6 overflow-y-auto scrollbar-hide border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl">
                            <DesktopIcon size={24} className="text-white" weight="fill" />
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-white font-bold text-xl">Change Wallpaper</p>
                            <p className="text-slate-500 dark:text-gray-400 text-sm">Customize your desktop</p>
                        </div>
                    </div>

                    <div className="relative group cursor-pointer">
                        <img
                            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop"
                            alt="Current Wallpaper"
                            className="rounded-2xl w-full h-60 object-cover shadow-lg group-hover:scale-[0.98] transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="text-center text-white">
                                <Image size={32} className="mx-auto mb-2" weight="fill" />
                                <p className="font-medium">Current Wallpaper</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="font-semibold mb-3 text-slate-900 dark:text-white">Choose Wallpaper</p>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
                                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
                                'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
                                'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=400&h=300&fit=crop',
                                'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop',
                                'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop'
                            ].map((img, index) => (
                                <div key={index} className="relative group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-200">
                                    <img
                                        src={img}
                                        alt={`Wallpaper ${index + 1}`}
                                        className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => handleWallpaperChange(img)}
                                            className="bg-white/20 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-white/30 transition-colors"
                                        >
                                            Set as Wallpaper
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button className="flex items-center justify-center space-x-2 border-2 border-dashed border-slate-200 dark:border-gray-600 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-all duration-200 text-gray-500 dark:text-gray-400 font-medium">
                        <CloudArrowUpIcon size={20} weight="bold" />
                        <span>Upload Custom Wallpaper</span>
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 w-2/5 ms-7 mb-10 rounded-2xl shadow-lg px-8 py-6 flex flex-col space-y-6 border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl">
                            <SlidersIcon size={24} className="text-white" weight="fill" />
                        </div>
                        <div>
                            <p className="text-slate-900 dark:text-white font-bold text-xl">Display Settings</p>
                            <p className="text-slate-500 dark:text-gray-400 text-sm">Adjust your display</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium flex items-center space-x-2">
                                    <SunIcon size={18} className="text-yellow-500" weight="fill" />
                                    <span>Brightness</span>
                                </label>
                                <span className="text-sm text-gray-500">{brightness}%</span>
                            </div>
                            <input
                                type="range"
                                min="30"
                                max="100"
                                value={brightness}
                                onChange={handleBrightnessChange}
                                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                                <MonitorIcon size={18} className="text-blue-500" weight="fill" />
                                <span>Resolution</span>
                            </label>
                            <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white cursor-pointer hover:border-orange-400 focus:border-orange-400 transition-colors outline-none">
                                <option>1920 × 1080 (Recommended)</option>
                                <option>2560 × 1440</option>
                                <option>3840 × 2160 (4K)</option>
                                <option>1280 × 720</option>
                                <option>1024 × 768</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                                <MonitorIcon size={18} className="text-purple-500" weight="fill" />
                                <span>Refresh Rate</span>
                            </label>
                            <select className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-900 dark:text-white cursor-pointer hover:border-orange-400 focus:border-orange-400 transition-colors outline-none">
                                <option>60 Hz</option>
                                <option>120 Hz</option>
                                <option>144 Hz</option>
                                <option>240 Hz</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium flex items-center space-x-2 mb-2">
                                <PaintBucket size={18} className="text-pink-500" weight="fill" />
                                <span>Color Scheme</span>
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {['blue', 'purple', 'green', 'orange'].map((color) => (
                                    <button
                                        key={color}
                                        className={`h-10 rounded-xl bg-${color}-500 hover:ring-2 ring-offset-2 ring-${color}-500 transition-all`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    function showMain() {
        return (
            <div className="space-y-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl mb-4">
                        <Gear size={32} className="text-white" weight="fill" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h2>
                    <p className="text-slate-500 dark:text-gray-400 text-sm mt-1">Customize your TenjikuOS experience</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div
                        onClick={() => { setShow(false); setShowDisplay(true); }}
                        className="group bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500"
                    >
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                                <DesktopIcon size={24} className="text-white" weight="fill" />
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-white font-bold">Display</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Personalization</p>
                            </div>
                        </div>
                        <p className="text-slate-600 dark:text-gray-400 text-sm">
                            Manage your display preferences, change wallpaper, adjust resolution and brightness.
                        </p>
                    </div>

                    <div
                        onClick={() => { setShow(false); setShowInfo(true); }}
                        className="group bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                    >
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                                <InfoIcon size={24} className="text-white" weight="fill" />
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-white font-bold">System</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Information</p>
                            </div>
                        </div>
                        <p className="text-slate-600 dark:text-gray-400 text-sm">
                            View detailed information about your system, hardware specs, and software versions.
                        </p>
                    </div>

                    <div
                        onClick={() => { setShow(false); setShowUser(true); }}
                        className="group bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500"
                    >
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                                <User size={24} className="text-white" weight="fill" />
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-white font-bold">User</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Settings</p>
                            </div>
                        </div>
                        <p className="text-slate-600 dark:text-gray-400 text-sm">
                            Manage user accounts, update credentials, and configure account preferences.
                        </p>
                    </div>

                    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                                <BellRingingIcon size={24} className="text-white" weight="fill" />
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-white font-bold">Notifications</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Preferences</p>
                            </div>
                        </div>
                        <p className="text-slate-600 dark:text-gray-400 text-sm">
                            Configure notification preferences, alerts, and system sounds.
                        </p>
                    </div>

                    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                                <ShieldCheck size={24} className="text-white" weight="fill" />
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-white font-bold">Privacy & Security</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Protection</p>
                            </div>
                        </div>
                        <p className="text-slate-600 dark:text-gray-400 text-sm">
                            Manage privacy settings, security options, and access controls.
                        </p>
                    </div>

                    <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-100 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500">
                        <div className="flex items-center space-x-4 mb-4">
                            <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl group-hover:scale-110 transition-transform duration-200">
                                <WrenchIcon size={24} className="text-white" weight="fill" />
                            </div>
                            <div>
                                <p className="text-slate-900 dark:text-white font-bold">Advanced</p>
                                <p className="text-xs text-slate-500 dark:text-gray-400">Developer Tools</p>
                            </div>
                        </div>
                        <p className="text-slate-600 dark:text-gray-400 text-sm">
                            Access developer tools, system logs, and advanced configuration options.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
}