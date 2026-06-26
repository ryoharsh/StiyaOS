import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import DEFAULT_PROFILE from "../assets/dev_icon.png";
import { AnimatedEmojis } from "../types";
import { useChatStore, type ChatMessage } from "../store/useChatStore";
import { allApps } from "../apps/appRegistry.tsx";
import { openCommands } from "../utils/constant.tsx";
import { streamMessageToGemini, GeminiApiError, type GeminiHistoryItem } from "../api/geminiApi.ts";
import {
    VoiceInputController,
    isSpeechRecognitionSupported,
    isSpeechSynthesisSupported,
    speak,
    stopSpeaking,
} from "../utils/voiceController.ts";
import BotMessageContent from "./BotMessageContent.tsx";
import {
    ArrowBendUpLeftIcon,
    MagnifyingGlassIcon,
    MicrophoneIcon,
    SpeakerHighIcon,
    SpeakerXIcon,
    StopIcon,
    XIcon,
} from "@phosphor-icons/react";

interface StiyaBotProps {
    onClose: () => void;
    visible: boolean;
    onOpenApp: (appId: string) => void;
}

export default function StiyaBot({ onClose, visible, onOpenApp }: StiyaBotProps) {
    const scrollableContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const voiceControllerRef = useRef<VoiceInputController | null>(null);

    const { messages, addMessage, updateLastMessage, persistMessages, loadOfflineMessages } = useChatStore();
    const [currentEmoji, setCurrentEmoji] = useState(AnimatedEmojis.getRandomEmoji());
    const [input, setInput] = useState<string>("");
    const [isListening, setIsListening] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [autoSpeak, setAutoSpeak] = useState(false);
    const [speakingMsgIndex, setSpeakingMsgIndex] = useState<number | null>(null);
    const [replyTarget, setReplyTarget] = useState<{ text: string; sender: "user" | "bot" } | null>(null);

    const micSupported = isSpeechRecognitionSupported();
    const ttsSupported = isSpeechSynthesisSupported();

    useEffect(() => {
        voiceControllerRef.current = new VoiceInputController("en-US");
        return () => voiceControllerRef.current?.abort();
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleSend();
        }
    };

    // Auto-focus input when the panel opens
    useEffect(() => {
        if (visible) {
            inputRef.current?.focus();
        }
    }, [visible]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentEmoji(AnimatedEmojis.getRandomEmoji());
        }, 2000);

        return () => clearInterval(intervalId);
    }, []);

    useLayoutEffect(() => {
        const scrollToBottom = () => {
            if (scrollableContainerRef.current) {
                const container = scrollableContainerRef.current;
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: "smooth",
                });
            }
        };

        if (messages.length > 0) {
            scrollToBottom();
        }

        if (visible && messages.length > 0) {
            setTimeout(scrollToBottom, 150);
        }
    }, [messages, visible]);

    useEffect(() => {
        loadOfflineMessages();
    }, [loadOfflineMessages]);

    // Stop any speech when panel closes, so it doesn't keep talking in the background.
    useEffect(() => {
        if (!visible) {
            stopSpeaking();
            setSpeakingMsgIndex(null);
            setReplyTarget(null);
        }
    }, [visible]);

    // helper: normalize text
    const norm = (s: string) => s.trim().toLowerCase();

    // helper: try to resolve an app id from a name or id fragment
    function findAppIdFromInput(inputStr: string): string | null {
        const q = norm(inputStr);
        const appsArray = Object.values(allApps) as any[];

        // 1. Direct ID match or Exact ID Match
        for (const item of appsArray) {
            if (item.id && item.id.toLowerCase() === q) return item.id;
        }
        // 2. ID substring match
        for (const item of appsArray) {
            if (item.id && item.id.toLowerCase().includes(q)) return item.id;
        }
        // 3. Name Exact match
        for (const item of appsArray) {
            if (item.name && item.name.toLowerCase() === q) return item.id;
        }
        // 4. Name substring match
        for (const item of appsArray) {
            if (item.name && item.name.toLowerCase().includes(q)) return item.id;
        }
        return null;
    }

    // helper: extract the probable app name portion from a command sentence
    function extractAppQuery(inputStr: string): string {
        let s = inputStr.trim();
        s = s.replace(/^[^\w]+|[^\w]+$/g, "");
        const words = s.split(/\s+/);

        if (words.length > 1 && openCommands.includes(words[0].toLowerCase())) {
            return words.slice(1).join(" ");
        }

        for (let i = 0; i < words.length; i++) {
            if (openCommands.includes(words[i].toLowerCase())) {
                return words.slice(i + 1).join(" ");
            }
        }
        return s;
    }

    // Builds the rolling history we send to Gemini for context-aware replies.
    // Capped to the last 12 messages to keep request size sane.
    function buildHistory(): GeminiHistoryItem[] {
        return messages.slice(-12).map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            text: m.text,
        }));
    }

    const handleMicToggle = () => {
        if (!micSupported) return;

        if (isListening) {
            voiceControllerRef.current?.stop();
            setIsListening(false);
            return;
        }

        setIsListening(true);
        voiceControllerRef.current?.start(
            (transcript, isFinal) => {
                setInput(transcript);
                if (isFinal) {
                    setIsListening(false);
                    // small delay so state settles before send reads `input`
                    setTimeout(() => handleSendWithText(transcript), 50);
                }
            },
            (_err) => {
                setIsListening(false);
            },
            () => setIsListening(false)
        );
    };

    const handleToggleSpeakMessage = (index: number, text: string) => {
        if (speakingMsgIndex === index) {
            stopSpeaking();
            setSpeakingMsgIndex(null);
            return;
        }
        // Reset stale state from any previously "speaking" message first.
        setSpeakingMsgIndex(index);
        speak(
            text,
            "en-US",
            () => setSpeakingMsgIndex((current) => (current === index ? null : current)),
            () => setSpeakingMsgIndex((current) => (current === index ? null : current))
        );
    };

    const handleReplyTo = (msg: ChatMessage) => {
        setReplyTarget({ text: msg.text, sender: msg.sender });
        inputRef.current?.focus();
    };

    const clearReplyTarget = () => setReplyTarget(null);

    const handleSend = () => handleSendWithText(input);

    const handleSendWithText = async (rawText: string) => {
        if (!rawText.trim()) return;

        const activeReply = replyTarget;
        const userMsg: ChatMessage = {
            text: rawText,
            sender: "user",
            ...(activeReply ? { replyTo: activeReply } : {}),
        };
        await addMessage(userMsg);
        const currentInput = rawText;
        setInput("");
        clearReplyTarget();

        const low = norm(currentInput);
        const isOsIntent =
            openCommands.some((v) => low.startsWith(v)) || openCommands.some((v) => low.includes(` ${v} `));

        if (isOsIntent) {
            const appQuery = extractAppQuery(currentInput);
            let resolvedId = "";

            const quoted = appQuery.match(/"(.*?)"|'(.*?)'/);
            if (quoted) {
                resolvedId = findAppIdFromInput(quoted[1] || quoted[2]) || "";
            } else {
                resolvedId = findAppIdFromInput(appQuery) || "";
                if (!resolvedId) {
                    const tokens = appQuery.split(/\s+/).filter(Boolean);
                    for (const t of tokens) {
                        const id = findAppIdFromInput(t);
                        if (id) {
                            resolvedId = id;
                            break;
                        }
                    }
                }
            }

            if (resolvedId) {
                try {
                    onOpenApp(resolvedId);
                    const botReply: ChatMessage = {
                        text: `Opened application: ${allApps[resolvedId]?.name || resolvedId}`,
                        sender: "bot",
                    };
                    await addMessage(botReply);
                } catch (err: any) {
                    const botReply: ChatMessage = {
                        text: `Failed to open application: ${err?.message ?? "unknown error"}`,
                        sender: "bot",
                    };
                    await addMessage(botReply);
                }
            } else {
                const botReply: ChatMessage = {
                    text: `Could not find any application matching "${appQuery}".`,
                    sender: "bot",
                };
                await addMessage(botReply);
            }
            return;
        }

        // Non-OS intent -> forward to Gemini, streamed
        setIsStreaming(true);
        const history = buildHistory();

        const promptForGemini = activeReply
            ? `(Replying to ${activeReply.sender === "user" ? "my own earlier message" : "your earlier message"}: "${activeReply.text}")\n\n${currentInput}`
            : currentInput;

        // Push a placeholder bot message we'll fill in as chunks arrive.
        await addMessage({ text: "", sender: "bot" });
        const placeholderIndex = messages.length; // index this message will occupy after the above add

        try {
            const fullText = await streamMessageToGemini(promptForGemini, history, (_chunk, soFar) => {
                updateLastMessage(soFar);
            });

            if (autoSpeak && fullText) {
                speak(fullText);
                setSpeakingMsgIndex(placeholderIndex);
            }
        } catch (error) {
            console.error("Error streaming message from Gemini:", error);
            const friendlyMsg =
                error instanceof GeminiApiError
                    ? error.message
                    : "Sorry, I couldn't get a response right now. (Unknown error — check the console for details.)";
            updateLastMessage(friendlyMsg);
        } finally {
            setIsStreaming(false);
            await persistMessages();
        }
    };

    return (
        <div
            className={`absolute left-5 bottom-20 p-3 h-[80vh] max-h-[700px] w-120 bg-white border border-white/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden z-40000 transition-all duration-300 ${
                visible ? "win11-open opacity-100" : "win11-close opacity-0 pointer-events-none translate-y-10"
            }`}
        >
            {/* Header Area */}
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 shrink-0">
                <div className="flex items-center gap-3">
                    <img src={DEFAULT_PROFILE} width={40} height={40} alt="Stiya OS" className="rounded-full object-cover" />
                    <p className="text-md font-semibold text-gray-900">{localStorage.getItem("username") ?? "Harsh Singh"}</p>
                </div>
                <div className="flex items-center gap-2">
                    {ttsSupported && (
                        <button
                            title={autoSpeak ? "Auto-read replies: on" : "Auto-read replies: off"}
                            className={`p-2 rounded-full transition ease-in-out duration-200 hover:scale-95 ${
                                autoSpeak ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                            onClick={() => setAutoSpeak((v) => !v)}
                        >
                            {autoSpeak ? <SpeakerHighIcon size={18} /> : <SpeakerXIcon size={18} />}
                        </button>
                    )}
                    <button
                        className="bg-gray-200 p-2 rounded-full transition ease-in-out duration-200 hover:scale-95 hover:bg-gray-300"
                        onClick={onClose}
                    >
                        <XIcon />
                    </button>
                </div>
            </div>

            {/* Chat Messages Body Area */}
            <div ref={scrollableContainerRef} className="flex-1 overflow-y-auto py-4 pr-1" style={{ scrollbarWidth: "none" }}>
                {messages.length > 0 ? (
                    <>
                        <div className="text-center mt-2">
                            <img
                                src={AnimatedEmojis.getWomanStudent()}
                                alt="StiyaBot"
                                width={100}
                                height={100}
                                className="mx-auto mb-2 bg-white border-2 border-gray-100 rounded-full p-3"
                            />
                            <p className="font-bold text-lg mt-4 text-gray-800">Stiya Bot</p>
                            <p className="text-gray-600 text-sm mt-2 mb-5">Ask me anything about Stiya OS or just chat with me!</p>
                        </div>
                        {messages.map((msg, index) => (
                            <div key={index} className="p-2 flex items-start gap-4 relative group">
                                {msg.sender !== "user" && (
                                    <div className="border-l border-b border-gray-300 w-4 absolute left-6 top-2 bottom-4 rounded-bl-xl"></div>
                                )}
                                <div
                                    className={`w-full text-sm relative z-10 ${
                                        msg.sender === "user"
                                            ? "bg-white text-gray-800 rounded-xl shadow-xl shadow-gray-200 border border-gray-200 p-2"
                                            : "text-gray-800 ps-11"
                                    }`}
                                >
                                    {msg.sender === "user" ? (
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <img src={DEFAULT_PROFILE} alt="Profile Image User" className="w-8 h-8 object-cover rounded-full" />
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-950">Harsh</p>
                                                    <p className="text-gray-500 text-xs">just now</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleReplyTo(msg)}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                                                title="Reply to this message"
                                            >
                                                <ArrowBendUpLeftIcon size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <img src={AnimatedEmojis.getWomanTechnologist()} alt="Profile Image User" className="w-8 h-8 rounded-full" />
                                                <div>
                                                    <p className="font-semibold text-sm text-gray-950">Stiya AI</p>
                                                    <p className="text-gray-500 text-xs">
                                                        {isStreaming && index === messages.length - 1 ? "typing..." : "just now"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {msg.text && (
                                                    <button
                                                        onClick={() => handleReplyTo(msg)}
                                                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                                                        title="Reply to this message"
                                                    >
                                                        <ArrowBendUpLeftIcon size={16} />
                                                    </button>
                                                )}
                                                {ttsSupported && msg.text && (
                                                    <button
                                                        onClick={() => handleToggleSpeakMessage(index, msg.text)}
                                                        className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
                                                        title={speakingMsgIndex === index ? "Stop reading" : "Read aloud"}
                                                    >
                                                        {speakingMsgIndex === index ? <StopIcon size={16} /> : <SpeakerHighIcon size={16} />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {msg.replyTo && (
                                        <div
                                            className={`mt-2 border-l-2 border-gray-300 pl-2 text-xs text-gray-500 italic truncate ${
                                                msg.sender === "user" ? "" : "ms-11"
                                            }`}
                                        >
                                            Replying to {msg.replyTo.sender === "user" ? "Harsh" : "Stiya AI"}: "
                                            {msg.replyTo.text.slice(0, 80)}
                                            {msg.replyTo.text.length > 80 ? "…" : ""}"
                                        </div>
                                    )}

                                    {msg.sender === "user" ? (
                                        <p className="text-sm font-medium text-gray-800 mt-2 whitespace-pre-wrap break-words">{msg.text}</p>
                                    ) : (
                                        <BotMessageContent text={msg.text || (isStreaming && index === messages.length - 1 ? "…" : "")} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <div className="text-center flex flex-col justify-center h-full">
                        <img src={currentEmoji} alt="StiyaBot" width={160} height={160} className="mx-auto mb-6 animate-bounce" />
                        <p className="font-bold text-xl mt-4 text-gray-800">Start chatting with StiyaBot!</p>
                        <p className="text-gray-600 text-sm mt-2 px-8">Ask me anything about Stiya OS or just chat with me!</p>
                        <p className="text-gray-500 text-sm mt-1">Type your message below, or tap the mic to speak.</p>
                    </div>
                )}
            </div>

            {/* Reply Preview Bar */}
            {replyTarget && (
                <div className="flex items-center justify-between gap-2 bg-gray-100 rounded-2xl px-3 py-2 mt-2 shrink-0 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                        <ArrowBendUpLeftIcon size={14} className="text-gray-500 shrink-0" />
                        <span className="text-gray-500 shrink-0">
                            Replying to {replyTarget.sender === "user" ? "yourself" : "Stiya AI"}:
                        </span>
                        <span className="text-gray-700 truncate italic">"{replyTarget.text}"</span>
                    </div>
                    <button onClick={clearReplyTarget} className="text-gray-500 hover:text-gray-800 shrink-0">
                        <XIcon size={14} />
                    </button>
                </div>
            )}

            {/* Input Action Bar */}
            <div className="flex items-center bg-white border border-gray-200 p-2 rounded-full mt-2 shrink-0 shadow-sm">
                <div className="mx-2 text-gray-500">
                    <MagnifyingGlassIcon />
                </div>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder={isListening ? "Listening..." : "How can I help you?"}
                    value={input}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setInput(e.target.value)}
                    className="bg-transparent outline-none text-sm text-[#0b0411] placeholder-gray-500 w-full"
                />
                {micSupported && (
                    <button
                        onClick={handleMicToggle}
                        title={isListening ? "Stop listening" : "Speak your message"}
                        className={`p-2 rounded-full mx-1 transition ease-in-out duration-200 ${
                            isListening ? "bg-red-500 text-white animate-pulse" : "text-gray-500 hover:bg-gray-100"
                        }`}
                    >
                        <MicrophoneIcon />
                    </button>
                )}
                <button
                    onClick={handleSend}
                    disabled={isStreaming}
                    className="px-5 py-2 bg-gray-100 text-sm font-semibold text-[#0b0411] hover:scale-95 transition ease-in-out rounded-full active:scale-90 disabled:opacity-50 disabled:hover:scale-100"
                >
                    Send
                </button>
            </div>
        </div>
    );
}