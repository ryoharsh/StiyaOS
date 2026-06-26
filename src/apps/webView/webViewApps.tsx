import { useEffect, useRef } from "react";
import type { WebviewTag } from 'electron';

interface WebViewAppProp {
    url: string;
}

export default function WebViewApps({ url }: WebViewAppProp) {
    const webviewRef = useRef<Electron.WebviewTag>(null);

    useEffect(() => {
        const webview = webviewRef.current;
        if (webview) {
            webview.addEventListener("did-finish-load", () => {
            });
        }
    }, []);

    return (
        <webview id="foo" allowpopups src={url} className={`h-full w-full ${url.includes('vs') && 'bg-[#161616]'}`}></webview>
    );
}