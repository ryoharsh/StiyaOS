import { useState } from "react";
import { MagnifyingGlassIcon, StarIcon, DownloadSimpleIcon } from "@phosphor-icons/react";
import BG from "../../assets/backgrounds/bg1.png";

interface AppItem {
    id: number;
    name: string;
    description: string;
    rating: number;
    icon: string;
}

const trendingApps: AppItem[] = [
    { id: 1, name: "Stiya Code", description: "Develop react web application.", rating: 5.0, icon: BG },
    { id: 2, name: "Stiya Code", description: "Develop react web application.", rating: 4.8, icon: BG },
    { id: 3, name: "Stiya Code", description: "Develop react web application.", rating: 4.9, icon: BG },
    { id: 4, name: "Stiya Code", description: "Develop react web application.", rating: 5.0, icon: BG },
    { id: 5, name: "Stiya Code", description: "Develop react web application.", rating: 4.7, icon: BG },
    { id: 6, name: "Stiya Code", description: "Develop react web application.", rating: 5.0, icon: BG },
];

function AppCard({ app }: { app: AppItem }) {
    return (
        <div className="flex flex-col items-start min-w-36 max-w-40 group cursor-pointer">
            <div className="relative">
                <img
                    src={app.icon}
                    alt={app.name}
                    className="size-24 rounded-3xl shadow-lg border-4 border-white object-cover transition-transform group-hover:scale-105"
                />
                <button
                    className="absolute -bottom-2 -right-2 size-8 rounded-full bg-blue-500 hover:bg-blue-600 flex items-center justify-center shadow-md transition-colors"
                    aria-label={`Install ${app.name}`}
                >
                    <DownloadSimpleIcon size={16} weight="bold" color="#fff" />
                </button>
            </div>
            <p className="text-sm font-semibold mt-3 text-gray-900 line-clamp-1">{app.name}</p>
            <p className="text-xs mt-1 text-gray-500 line-clamp-2 leading-snug">{app.description}</p>
            <div className="flex items-center gap-1 mt-2">
                <StarIcon size={12} weight="fill" color="#facc15" />
                <span className="text-xs text-gray-700 font-medium">{app.rating.toFixed(1)}</span>
            </div>
        </div>
    );
}

function AppRow({ title, apps }: { title: string; apps: AppItem[] }) {
    return (
        <div className="flex flex-col mx-4">
            <h2 className="font-bold text-black text-base mt-6">{title}</h2>
            <div className="mt-4 border-y border-gray-200 py-5 px-1 w-full flex flex-row gap-6 overflow-x-auto scrollbar-hide">
                {apps.map((app) => (
                    <AppCard key={app.id} app={app} />
                ))}
            </div>
        </div>
    );
}

export default function AppStore() {
    const [query, setQuery] = useState("");

    return (
        <div className="flex size-full bg-white">
            <div className="flex flex-col w-full">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 mt-3 mx-40 border border-slate-200 rounded-full hover:border-slate-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
                    <MagnifyingGlassIcon size={18} color="#71717a" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search apps..."
                        className="bg-transparent outline-none text-gray-900 placeholder-gray-400 w-full text-sm"
                    />
                </div>

                <div className="pb-20 overflow-auto scroll-smooth hidesb mt-5 mx-40">
                    <AppRow title="Trending" apps={trendingApps} />
                    <AppRow title="New & Updated" apps={trendingApps} />
                </div>
            </div>
        </div>
    );
}