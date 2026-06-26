import { GoogleGenAI } from "@google/genai";

const API_KEY = import.meta.env.VITE_GEMINI_API;

const ai = new GoogleGenAI({ apiKey: API_KEY ?? "" });

const MODEL = "gemini-3.5-flash";

const SYSTEM_INSTRUCTION = `You are Stiya AI, the built-in assistant for Stiya OS — a custom Linux kiosk
operating system. You are friendly, concise, and technically sharp.

Rules:
- When asked for code, ALWAYS return it inside a fenced code block with the correct language tag,
  e.g. \`\`\`tsx ... \`\`\`. Never paste code inline without fences.
- Keep prose explanations short and to the point — the user is usually a developer mid-task.
- If a request is ambiguous, make a reasonable assumption and say so in one line instead of asking
  multiple clarifying questions.
- You can be asked to open apps, but that is handled outside of you — only respond conversationally
  or with code/explanations here.`;

export interface GeminiHistoryItem {
    role: "user" | "model";
    text: string;
}

/**
 * A typed error so the UI layer can show something more useful than
 * "Sorry, I couldn't get a response right now" for every failure mode.
 */
export class GeminiApiError extends Error {
    public cause?: unknown;

    constructor(message: string, cause?: unknown) {
        super(message);
        this.name = "GeminiApiError";
        this.cause = cause;
    }
}

function assertApiKey(): void {
    if (!API_KEY || API_KEY.trim() === "") {
        throw new GeminiApiError(
            "VITE_GEMINI_API is missing or empty at build time. Check your .env file is named " +
                "exactly '.env' (not '.env.local' unless your vite config reads that), sits in the " +
                "project root next to vite.config.ts, and that you FULLY RESTARTED the dev server " +
                "after adding/editing it — Vite only reads env vars at startup, not on hot reload."
        );
    }
}

/**
 * Translates raw SDK/network errors into a readable message instead of
 * letting a generic catch-all swallow the real cause.
 */
function describeError(err: unknown): string {
    if (err instanceof GeminiApiError) return err.message;

    const anyErr = err as any;
    const status = anyErr?.status ?? anyErr?.response?.status;
    const rawMsg: string = anyErr?.message ?? String(err);

    if (status === 400 || /api key not valid/i.test(rawMsg)) {
        return "Gemini rejected the API key (400 / invalid key). Generate a fresh key in Google AI Studio and double-check it's pasted into .env with no quotes or trailing spaces.";
    }
    if (status === 403) {
        return "Gemini returned 403 — the API key may not have the Generative Language API enabled, or is restricted to different referrers/IPs than Electron's runtime.";
    }
    if (status === 404 || /not found/i.test(rawMsg)) {
        return `Gemini returned 404 for model "${MODEL}" — this model id may not exist on your account/region yet, or your @google/genai SDK version is too old to recognize it. Try "gemini-2.5-flash" as a fallback.`;
    }
    if (status === 429) {
        return "Gemini rate limit (429) — too many requests, or you're on a free tier quota that's exhausted.";
    }
    if (/network|fetch|ENOTFOUND|ECONNREFUSED/i.test(rawMsg)) {
        return "Network error reaching Gemini — check internet access from the Electron renderer/main process, and that this domain isn't blocked by a proxy or firewall.";
    }

    return `Gemini request failed: ${rawMsg}`;
}

/**
 * Non-streaming call — kept for simple one-off use cases.
 */
export const sendMessageToGemini = async (
    message: string,
    history: GeminiHistoryItem[] = []
): Promise<string> => {
    assertApiKey();

    try {
        const contents = [
            ...history.map((h) => ({
                role: h.role,
                parts: [{ text: h.text }],
            })),
            { role: "user", parts: [{ text: message }] },
        ];

        const response = await ai.models.generateContent({
            model: MODEL,
            contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.6,
            },
        });

        return response.text ?? "Sorry, I didn't get a response back.";
    } catch (err) {
        const friendly = describeError(err);
        console.error("[Stiya AI] generateContent failed:", err);
        throw new GeminiApiError(friendly, err);
    }
};

/**
 * Streaming call — preferred for chat UI so the bot "types" live.
 * onChunk fires for every partial piece of text; resolves with the full text at the end.
 */
export const streamMessageToGemini = async (
    message: string,
    history: GeminiHistoryItem[] = [],
    onChunk: (chunkText: string, fullTextSoFar: string) => void
): Promise<string> => {
    assertApiKey();

    const contents = [
        ...history.map((h) => ({
            role: h.role,
            parts: [{ text: h.text }],
        })),
        { role: "user", parts: [{ text: message }] },
    ];

    let full = "";

    try {
        const stream = await ai.models.generateContentStream({
            model: MODEL,
            contents,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.6,
            },
        });

        for await (const chunk of stream) {
            const piece = chunk.text ?? "";
            if (piece) {
                full += piece;
                onChunk(piece, full);
            }
        }

        return full || "Sorry, I didn't get a response back.";
    } catch (err) {
        const friendly = describeError(err);
        console.error("[Stiya AI] generateContentStream failed:", err);
        throw new GeminiApiError(friendly, err);
    }
};