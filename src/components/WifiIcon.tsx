export default function WifiIcon({
    connected,
    strength
}: {
    connected: boolean;
    strength: number;
}) {
    if (!connected) {
        return (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 8a18.4 18.4 0 0 1 22 0" opacity="0.3" stroke="white" />
                <path d="M5 12a13 13 0 0 1 14 0" opacity="0.3" stroke="white" />
                <path d="M9 16a7.4 7.4 0 0 1 6 0" opacity="0.3" stroke="white" />
                <line x1="1" y1="1" x2="23" y2="23" stroke="#ef4444" strokeWidth="2.5" />
            </svg>
        );
    }

    return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 8a18.4 18.4 0 0 1 22 0" stroke="white" className="transition-opacity duration-300" opacity={strength >= 4 ? "1" : "0.25"} />
            <path d="M5 12a13 13 0 0 1 14 0" stroke="white" className="transition-opacity duration-300" opacity={strength >= 3 ? "1" : "0.25"} />
            <path d="M9 16a7.4 7.4 0 0 1 6 0" stroke="white" className="transition-opacity duration-300" opacity={strength >= 2 ? "1" : "0.25"} />
            <path d="M12 20h.01" stroke="white" strokeWidth="3.5" className="transition-opacity duration-300" opacity={strength >= 1 ? "1" : "0.25"} />
        </svg>
    );
}