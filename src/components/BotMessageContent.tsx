import React, { useState } from "react";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";

interface Segment {
    type: "text" | "code";
    content: string;
    language?: string;
}

function parseMessage(raw: string): Segment[] {
    const segments: Segment[] = [];
    const fenceRegex = /```(\w+)?\n?([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = fenceRegex.exec(raw)) !== null) {
        if (match.index > lastIndex) {
            segments.push({ type: "text", content: raw.slice(lastIndex, match.index) });
        }
        segments.push({
            type: "code",
            language: match[1] || "text",
            content: match[2].replace(/\n$/, ""),
        });
        lastIndex = fenceRegex.lastIndex;
    }

    if (lastIndex < raw.length) {
        segments.push({ type: "text", content: raw.slice(lastIndex) });
    }

    return segments;
}

function CodeBlock({ language, content }: { language: string; content: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard API can fail without permissions; fail silently, button just won't flip
        }
    };

    return (
        <div className="my-2 rounded-xl overflow-hidden border border-gray-700 bg-[#1e1e2e] text-xs">
            <div className="flex items-center justify-between px-3 py-1.5 bg-[#11111b] text-gray-300">
                <span className="font-mono lowercase">{language}</span>
                <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                >
                    {copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>
            <pre className="overflow-x-auto p-3 m-0">
                <code className="font-mono text-[#cdd6f4] whitespace-pre">{content}</code>
            </pre>
        </div>
    );
}

// Very small inline-markdown handler for bold text inside plain segments.
// Intentionally minimal — full markdown rendering is out of scope here.
function renderInlineText(text: string, keyPrefix: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
        }
        return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>;
    });
}

export default function BotMessageContent({ text }: { text: string }) {
    const segments = parseMessage(text);

    return (
        <div className="text-sm font-medium text-gray-800 mt-2 whitespace-pre-wrap break-words">
            {segments.map((seg, idx) =>
                seg.type === "code" ? (
                    <CodeBlock key={idx} language={seg.language || "text"} content={seg.content} />
                ) : (
                    <span key={idx}>{renderInlineText(seg.content, `seg-${idx}`)}</span>
                )
            )}
        </div>
    );
}