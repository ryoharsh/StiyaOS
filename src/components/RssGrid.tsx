import { motion, AnimatePresence } from 'framer-motion';
import {useRssFeed} from "../api/rss.ts";

export default function RssGrid() {
    const { data, loading, error } = useRssFeed({ url: 'https://feeds.feedburner.com/ndtvnews-trending-news', refreshMs: 0 });

    const formatTime = (s?: string) => {
        if (!s) return "";
        const d = new Date(s);
        if (isNaN(d.getTime())) return s;

        const now = new Date();
        const diffMs = now.getTime() - d.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        const diffMonth = Math.floor(diffDay / 30);
        const diffYear = Math.floor(diffDay / 365);

        if (diffSec < 60) return "just now";
        if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
        if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
        if (diffDay === 1) return "yesterday";
        if (diffDay < 30) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
        if (diffMonth === 1) return "a month ago";
        if (diffMonth < 12) return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
        if (diffYear === 1) return "1 year ago";
        return `${diffYear} years ago`;
    };

    return (
        <div>
            {loading && <div className="text-gray-300">Loading...</div>}
            {error && <div className="text-red-400">Error: {error}</div>}

            <AnimatePresence>
                <motion.div layout className="flex-wrap gap-6 grid grid-cols-2">
                    {data?.items.map(item => (
                        <motion.a
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.18 }}
                            href={item.link ?? '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block rounded-xl overflow-hidden bg-white/60 hover:bg-white/50 p-0 transition duration-300 ease-in-out"
                        >
                            <div className=''>
                                {item.image ? (
                                    // Next/Image requires domain config for external images; fallback: plain img if not configured
                                    // We'll render an img tag to be safe in dev/electron environments.
                                    <img src={item.image} alt={item.title} width={300} height={300} className='object-cover rounded-xl h-44 w-full' />
                                ) : (
                                    <div style={{ width: '100%', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f1724', color: '#9CA3AF' }}>
                                        No image
                                    </div>
                                )}
                            </div>

                            <div className="p-3">
                                <h3 className="text-sm text-gray-950 font-semibold mb-1 line-clamp-2">{item.title}</h3>
                                <p className="text-xs text-gray-700 mb-3 line-clamp-3">{item.description}</p>

                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <img src={item.authorImg} className='size-8 rounded-full object-cover' />
                                        <div>
                                            <div className="text-xs text-gray-900 font-medium">{item.author || 'BBC'}</div>
                                            <div className="text-xs text-gray-500">{formatTime(item.pubDate)}</div>
                                        </div>
                                    </div>

                                    <div>
                                        <span className="text-xs text-white px-2 py-1 rounded-xl bg-gray-900">Read</span>
                                    </div>
                                </div>
                            </div>
                        </motion.a>
                    ))}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
