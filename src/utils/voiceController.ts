// Lightweight wrapper around the Web Speech API.
// Browser/Electron support: Chromium-based (which Electron is) supports both
// SpeechRecognition (via webkitSpeechRecognition) and SpeechSynthesis natively.

type RecognitionResultHandler = (transcript: string, isFinal: boolean) => void;
type RecognitionErrorHandler = (error: string) => void;

// Minimal shape of the bits of the SpeechRecognition API we actually use.
// Avoids depending on lib.dom speech types, which TS doesn't ship by default.
interface MinimalSpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    onresult: ((event: any) => void) | null;
    onerror: ((event: any) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
    abort: () => void;
}

function getRecognitionCtor(): (new () => MinimalSpeechRecognition) | null {
    const w = window as any;
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isSpeechRecognitionSupported(): boolean {
    return getRecognitionCtor() !== null;
}

export function isSpeechSynthesisSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
}

export class VoiceInputController {
    private recognition: MinimalSpeechRecognition | null = null;
    private listening = false;
    private lang: string;

    constructor(lang: string = "en-US") {
        this.lang = lang;
    }

    isListening() {
        return this.listening;
    }

    start(onResult: RecognitionResultHandler, onError?: RecognitionErrorHandler, onEnd?: () => void) {
        const Ctor = getRecognitionCtor();
        if (!Ctor) {
            onError?.("Speech recognition isn't supported in this environment.");
            return;
        }

        // Always create a fresh instance — reusing one across start/stop cycles
        // is flaky in Chromium's implementation.
        this.recognition = new Ctor();
        this.recognition.lang = this.lang;
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event: any) => {
            let interim = "";
            let final = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    final += result[0].transcript;
                } else {
                    interim += result[0].transcript;
                }
            }
            if (final) onResult(final, true);
            else if (interim) onResult(interim, false);
        };

        this.recognition.onerror = (event: any) => {
            this.listening = false;
            onError?.(event?.error ?? "unknown_error");
        };

        this.recognition.onend = () => {
            this.listening = false;
            onEnd?.();
        };

        try {
            this.recognition.start();
            this.listening = true;
        } catch (err) {
            this.listening = false;
            onError?.((err as Error)?.message ?? "failed_to_start");
        }
    }

    stop() {
        this.recognition?.stop();
        this.listening = false;
    }

    abort() {
        this.recognition?.abort();
        this.listening = false;
    }
}

// ---------------- Text to Speech ----------------

let preferredVoice: SpeechSynthesisVoice | null = null;

function pickVoice(lang: string): SpeechSynthesisVoice | null {
    if (!isSpeechSynthesisSupported()) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    return (
        voices.find((v) => v.lang === lang) ||
        voices.find((v) => v.lang.startsWith(lang.split("-")[0])) ||
        voices[0]
    );
}

// Voices load async in Chromium; warm the cache once available.
if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.onvoiceschanged = () => {
        preferredVoice = pickVoice("en-US");
    };
}

/**
 * Strips code fences / markdown noise so TTS doesn't try to read out
 * "backtick backtick backtick tsx" or asterisks.
 */
export function sanitizeForSpeech(text: string): string {
    return text
        .replace(/```[\s\S]*?```/g, " I've written some code for that, check the message above. ")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1")
        .replace(/#+\s/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export function speak(
    text: string,
    lang: string = "en-US",
    onEnd?: () => void,
    onError?: () => void
): void {
    if (!isSpeechSynthesisSupported()) {
        onError?.();
        return;
    }
    const synth = window.speechSynthesis;
    synth.cancel(); // stop anything currently speaking before starting new

    const utterance = new SpeechSynthesisUtterance(sanitizeForSpeech(text));
    utterance.voice = preferredVoice || pickVoice(lang);
    utterance.lang = lang;
    utterance.rate = 1.02;
    utterance.pitch = 1;

    utterance.onend = () => onEnd?.();
    utterance.onerror = () => onError?.();

    // Chromium sometimes silently drops speak() if called right after cancel()
    // in the same tick. A microtask delay makes this reliable.
    setTimeout(() => synth.speak(utterance), 0);
}

export function stopSpeaking(): void {
    if (!isSpeechSynthesisSupported()) return;
    window.speechSynthesis.cancel();
}

export function isSpeaking(): boolean {
    if (!isSpeechSynthesisSupported()) return false;
    return window.speechSynthesis.speaking;
}