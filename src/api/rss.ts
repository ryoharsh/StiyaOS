import { XMLParser } from "fast-xml-parser";
import { useCallback, useEffect, useState } from "react";

export type RSSItem = {
    id: string;
    title: string;
    description: string;
    link?: string;
    pubDate?: string;
    author?: string;
    authorImg?: string;
    image?: string;
};

export type FetchRssOptions = {
    url?: string; // defaults to BBC Asia RSS
    retries?: number;
    timeoutMs?: number;
    useProxyIfFailed?: boolean;
    cacheTtlMs?: number;
    cacheKey?: string;
    proxyUrlBuilder?: (url: string) => string;
};

declare global {
    interface Window {
        rssApi?: {
            fetchRss: (feedUrl: string) => Promise<string>;
        };
    }
}

const DEFAULT_RSS_URL = "https://feeds.feedburner.com/ndtvnews-trending-news";
const DEFAULT_CACHE_TTL = 1000 * 60 * 2; // 2 minutes

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

/**
 * Browser-safe fetch with timeout.
 */
async function fetchWithTimeout(url: string, timeoutMs = 8000, signal?: AbortSignal) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
        const mergedSignal = signal ?? controller.signal;
        const res = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/rss+xml, application/xml, text/xml, */*",
            },
            signal: mergedSignal,
        });
        return res;
    } finally {
        window.clearTimeout(timer);
    }
}

/**
 * Try Electron main-process IPC first (no CORS, no proxy, no rate limits).
 * Falls back to direct browser fetch, then to a public CORS proxy as a last
 * resort — only relevant when running outside Electron (e.g. browser preview).
 */
async function fetchRssText(rawUrl: string, opts: FetchRssOptions = {}): Promise<string> {
    const retries = opts.retries ?? 2;
    const timeoutMs = opts.timeoutMs ?? 8000;
    const useProxyIfFailed = opts.useProxyIfFailed ?? true;

    // 1) Preferred path: Electron main process via IPC. Runs outside the
    // renderer's browser context, so CORS never applies here at all.
    if (typeof window !== "undefined" && window.rssApi?.fetchRss) {
        try {
            return await window.rssApi.fetchRss(rawUrl);
        } catch (err) {
            console.warn("[RSS] Electron IPC fetch failed, falling back to browser fetch:", err);
            // fall through to browser fetch below
        }
    }

    // 2) Browser fetch — will hit CORS if the target server doesn't send
    // Access-Control-Allow-Origin. Works fine for CORS-friendly feeds.
    let lastErr: unknown = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetchWithTimeout(rawUrl, timeoutMs);
            if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
            return await res.text();
        } catch (err) {
            lastErr = err;
            await sleep(400 * (attempt + 1));
        }
    }

    // 3) Last resort: public CORS proxy. Known to be unreliable (rate
    // limited, occasional downtime) — only reached if window.rssApi isn't
    // available AND direct fetch failed.
    if (useProxyIfFailed) {
        try {
            const builder =
                opts.proxyUrlBuilder ??
                ((u: string) => `https://corsproxy.io?${encodeURIComponent(u)}`);
            const proxyUrl = builder(rawUrl);
            const res = await fetchWithTimeout(proxyUrl, timeoutMs);
            if (!res.ok) throw new Error(`Proxy HTTP ${res.status} ${res.statusText}`);
            return await res.text();
        } catch (err) {
            lastErr = err;
        }
    }

    throw lastErr ?? new Error("Unknown fetch error");
}

/**
 * Builds a short, stable, ASCII-safe id fragment from arbitrary text.
 * btoa() throws on non-Latin1 characters (e.g. Hindi/Devanagari titles),
 * even after encodeURIComponent in some edge cases — TextEncoder + manual
 * base36 hashing avoids that entirely and never throws.
 */
function stableIdFragment(input: string): string {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash << 5) - hash + input.charCodeAt(i);
        hash |= 0; // force 32-bit int, prevents unbounded growth
    }
    return Math.abs(hash).toString(36).slice(0, 12);
}

/**
 * Parse RSS/Atom XML string into array of RSSItem
 */
function parseRssXml(xml: string): RSSItem[] {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "",
        removeNSPrefix: true,
        allowBooleanAttributes: true,
        textNodeName: "#text",
    });

    const json = parser.parse(xml);
    const channel = json?.rss?.channel ?? json?.feed ?? null;

    let itemsRaw = [];
    if (Array.isArray(channel?.item)) itemsRaw = channel.item;
    else if (channel?.item) itemsRaw = [channel.item];
    else if (Array.isArray(json?.feed?.entry)) itemsRaw = json.feed.entry;
    else if (json?.feed?.entry) itemsRaw = [json.feed.entry];

    const items: RSSItem[] = (itemsRaw || []).map((it: any, idx: number) => {
        const title = it.title?.["#text"] ?? it.title ?? "";
        const description = it.description ?? it.summary ?? "";
        const link = it.link?.href ?? it.link ?? (Array.isArray(it.link) ? it.link[0] : undefined);
        const pubDate = it.pubDate ?? it.published ?? it.updated ?? "";
        let author: unknown = channel?.title ?? it.author ?? it.creator ?? "";
        const authorImg: string | undefined = channel?.image?.url;

        if (Array.isArray(author)) author = author.join(", ");

        let image: string | undefined;
        if (it["media:thumbnail"]?.url) image = it["media:thumbnail"].url;
        else if (it["thumbnail"]?.url) image = it["thumbnail"].url;
        else if (it["media:content"]?.url) image = it["media:content"].url;
        else if (it["content"]?.url) image = it["content"].url;
        else if (it.enclosure?.url && (it.enclosure.type ?? "").startsWith("image"))
            image = it.enclosure.url;
        else {
            const m = /<img[^>]+src=["']([^"']+)["']/i.exec(String(description));
            if (m) image = m[1];
        }

        // Stable id from link/title — content-based hash avoids both
        // timestamp churn AND btoa() crashes on non-Latin1 titles.
        const stableSource = link || title || `${idx}`;
        const cleanId = stableIdFragment(stableSource);

        return {
            id: `rss-item-${cleanId}-${idx}`,
            title: String(title).trim(),
            description: String(description).replace(/(<([^>]+)>)/gi, "").trim().slice(0, 320),
            link,
            pubDate,
            author: String(author).trim(),
            authorImg,
            image,
        } as RSSItem;
    });

    return items;
}

/**
 * Browser-friendly fetchRss: fetch + parse + cache (localStorage).
 */
export async function fetchRss(options?: FetchRssOptions): Promise<{ source: string; items: RSSItem[] }> {
    const url = options?.url ?? DEFAULT_RSS_URL;
    const cacheKey = options?.cacheKey ?? `rss_cache:${url}`;
    const cacheTtl = options?.cacheTtlMs ?? DEFAULT_CACHE_TTL;

    try {
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
            const parsed = JSON.parse(cachedRaw) as { ts: number; data: { source: string; items: RSSItem[] } };
            if (parsed?.ts && Date.now() - parsed.ts < cacheTtl && parsed.data) {
                return parsed.data;
            }
        }
    } catch {
        // ignore localStorage errors (private mode)
    }

    const xml = await fetchRssText(url, options);
    const items = parseRssXml(xml);
    const payload = { source: url, items };

    try {
        localStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), data: payload }));
    } catch {
        // ignore if storage fails
    }

    return payload;
}

/**
 * Optimized React hook with stable dependency cycles and polling refresh tokens.
 */
export function useRssFeed(opts?: { url?: string; refreshMs?: number; initial?: { source: string; items: RSSItem[] } }) {
    const targetUrl = opts?.url ?? DEFAULT_RSS_URL;
    const refreshMs = opts?.refreshMs ?? 0;

    const [data, setData] = useState<{ source: string; items: RSSItem[] } | null>(opts?.initial ?? null);
    const [loading, setLoading] = useState<boolean>(!opts?.initial);
    const [error, setError] = useState<string | null>(null);

    const reload = useCallback(async (options?: FetchRssOptions) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetchRss({ url: targetUrl, ...options });
            setData(res);
            setLoading(false);
            return res;
        } catch (err: any) {
            setError(String(err?.message ?? err));
            setLoading(false);
            throw err;
        }
    }, [targetUrl]);

    useEffect(() => {
        let mounted = true;

        const loadFeed = async () => {
            try {
                const res = await fetchRss({ url: targetUrl });
                if (mounted) {
                    setData(res);
                    setError(null);
                }
            } catch (err: any) {
                if (mounted) setError(String(err?.message ?? err));
            } finally {
                if (mounted) setLoading(false);
            }
        };

        if (!data) {
            setLoading(true);
            loadFeed();
        }

        let timer: number | undefined;
        if (refreshMs > 0) {
            timer = window.setInterval(async () => {
                try {
                    const res = await fetchRss({ url: targetUrl });
                    if (mounted) setData(res);
                } catch {
                    // silent ignore polling refresh updates glitches
                }
            }, refreshMs);
        }

        return () => {
            mounted = false;
            if (timer) window.clearInterval(timer);
        };
    }, [targetUrl, refreshMs]);

    return { data, loading, error, reload };
}