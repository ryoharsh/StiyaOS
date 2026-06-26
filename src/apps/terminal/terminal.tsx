import { useEffect, useState, useRef } from "react";
import { create, all } from "mathjs";
import nerdamer from "nerdamer";
import "nerdamer/Algebra";
import "nerdamer/Calculus";
import { allApps } from "../appRegistry";
import { useAppManager } from "../../context/useAppManager";
import { AboutStiyaOS, MathsInfo, SystemInformation, TenInfo } from "../../utils/constant";
// import { runAppByName } from "../../utils/runApp";

const math = create(all);

export default function TerminalBox() {
    // --- state & refs ---
    const [history, setHistory] = useState<string[]>([
        "Welcome to Stiya Terminal!",
        "Type a command to begin. Type 'help' to see available commands.",
    ]);
    const [commandHistory, setCommandHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState<number | null>(null);
    const [input, setInput] = useState("");
    const [isMathMode, setIsMathMode] = useState(false);
    const [mathCategory, setMathCategory] = useState("");
    const inputRef = useRef<HTMLInputElement | null>(null);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const isTypingInterruptedRef = useRef(false);
    const [isAuthRequired, setIsAuthRequired] = useState(false);
    const [isAuthDone, setIsAuthDone] = useState(false);
    const [authUsername, setAuthUsername] = useState("");
    const [authPassword, setAuthPassword] = useState("");
    const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const appManager = useAppManager();
    
    useEffect(() => {
        inputRef.current?.focus();
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    useEffect(() => {
        return () => {
            if (typingTimerRef.current) {
                clearTimeout(typingTimerRef.current);
            }
        };
    }, []);

    // --- copy selection helper ---
    const copySelectionToClipboard = async (): Promise<boolean> => {
        try {
            const selection = window.getSelection();
            const selectedText = selection ? selection.toString() : "";

            if (!selectedText) return false;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                try {
                    await navigator.clipboard.writeText(selectedText);
                    selection?.removeAllRanges();
                    setHistory(prev => [...prev, `Copied selection: "${selectedText.slice(0, 120)}${selectedText.length > 120 ? "..." : ""}"`]);
                    return true;
                } catch (err) {
                    console.warn("navigator.clipboard failed:", err);
                }
            }

            const maybeElectron = (window as any).electronAPI || (window as any).ipcRenderer || (window as any).electron;
            if (maybeElectron && typeof maybeElectron.clipboardWrite === "function") {
                try {
                    await maybeElectron.clipboardWrite(selectedText);
                    selection?.removeAllRanges();
                    setHistory(prev => [...prev, `Copied selection: "${selectedText.slice(0, 120)}${selectedText.length > 120 ? "..." : ""}"`]);
                    return true;
                } catch (err) {
                    console.warn("electronAPI.clipboardWrite failed:", err);
                }
            }

            try {
                const electron = (window as any).require ? (window as any).require("electron") : null;
                if (electron && electron.clipboard && typeof electron.clipboard.writeText === "function") {
                    electron.clipboard.writeText(selectedText);
                    selection?.removeAllRanges();
                    setHistory(prev => [...prev, `Copied selection: "${selectedText.slice(0, 120)}${selectedText.length > 120 ? "..." : ""}"`]);
                    return true;
                }
            } catch (err) {
                // ignore
            }

            const ta = document.createElement("textarea");
            ta.value = selectedText;
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            ta.setAttribute("readonly", "true");
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand("copy");
                selection?.removeAllRanges();
                setHistory(prev => [...prev, `Copied selection: "${selectedText.slice(0, 120)}${selectedText.length > 120 ? "..." : ""}"`]);
                return true;
            } finally {
                document.body.removeChild(ta);
            }
        } catch (err) {
            console.error("Copy selection failed:", err);
            return false;
        }
    };

    // --- global keyboard handling (Enter, Ctrl+C, arrows) ---
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            const isCmdOrCtrl = e.ctrlKey || e.metaKey;

            if (e.key === "Enter" && input.trim() !== "" && !isTyping) {
                executeCommand(input);
                setCommandHistory((prev) => [...prev, input]);
                setHistoryIndex(null);
                setInput("");
                return;
            }

            if (isCmdOrCtrl && e.key.toLowerCase() === "c") {
                const selectionText = window.getSelection ? window.getSelection()?.toString() || "" : "";
                if (selectionText && selectionText.length > 0) {
                    e.preventDefault();
                    copySelectionToClipboard();
                    return;
                }

                e.preventDefault();
                if (isTyping) {
                    if (isMathMode) {
                        setIsMathMode(false);
                        setMathCategory("");
                    }
                    isTypingInterruptedRef.current = true;
                } else if (isAuthRequired) {
                    setIsAuthRequired(false);
                    setHistory((prev) => [...prev, "Command execution interrupted."]);
                } else if (isMathMode) {
                    setIsMathMode(false);
                    setMathCategory("");
                    setHistory((prev) => [...prev, "Command execution interrupted."]);
                }
                return;
            }

            if (e.key === "ArrowUp") {
                e.preventDefault();
                if (commandHistory.length === 0) return;
                
                if (historyIndex === null) {
                    setHistoryIndex(commandHistory.length - 1);
                } else if (historyIndex > 0) {
                    setHistoryIndex(historyIndex - 1);
                }
                return;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                if (historyIndex === null) return;
                
                if (historyIndex < commandHistory.length - 1) {
                    setHistoryIndex(historyIndex + 1);
                } else {
                    setHistoryIndex(null);
                    setInput("");
                }
                return;
            }
        };

        window.addEventListener("keydown", handleGlobalKeyDown);
        return () => {
            window.removeEventListener("keydown", handleGlobalKeyDown);
        };
    }, [input, isTyping, commandHistory, historyIndex, isMathMode, isAuthRequired, history]);

    useEffect(() => {
        if (historyIndex !== null && commandHistory[historyIndex]) {
            setInput(commandHistory[historyIndex]);
        }
    }, [historyIndex, commandHistory]);

    useEffect(() => {
        const handleMouseUp = () => {
            // Selection tracking if needed
        };
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    // --- main command executor ---
    const executeCommand = async (cmd: string) => {
        isTypingInterruptedRef.current = false;
        const trimmedCmd = cmd.trim();
        if (trimmedCmd === "") return;

        let output = "";
        let shouldContinue = true;

        if (isAuthRequired) {
            if (!authUsername) {
                setAuthUsername(trimmedCmd);
                output = "Enter your password:";
            } else if (!authPassword) {
                setAuthPassword(trimmedCmd);
                const loginSuccess = await handleLogin(authUsername, trimmedCmd);

                if (loginSuccess) {
                    output = "✅ Access granted! You can now use 'stiya -acc' commands.";
                    setIsAuthRequired(false);
                    setIsAuthDone(true);
                } else {
                    output = "❌ Access denied. Try again.";
                    setAuthUsername("");
                    setAuthPassword("");
                    setIsAuthRequired(false);
                    setIsAuthDone(false);
                }
            }
            shouldContinue = false;
        } else if (trimmedCmd === "stiya -init") {
            setIsAuthRequired(true);
            setAuthUsername("");
            setAuthPassword("");
            output = "🔐 Authentication Required\nEnter your username:";
        } else if (isMathMode) {
            if (!mathCategory) {
                setMathCategory(trimmedCmd);
                output = `📐 Math Category: ${trimmedCmd}\nEnter your equation:`;
            } else {
                output = solveMathEquation(trimmedCmd);
                setIsMathMode(false);
                setMathCategory("");
            }
        } else if (trimmedCmd === "clear") {
            setHistory([]);
            shouldContinue = false;
        } else if (trimmedCmd === "kill") {
            const instances = appManager.getRunningInstances("terminal");
            output = `📋 All terminal instances: \n${instances.map((i: { instanceId: any; }) => ` • ${i.instanceId}`).join("\n")}\n\nUsage:\n- kill -[instanceId]: Close specific instance\n- kill -all: Close all instances`;
        } else if (trimmedCmd.startsWith("kill -")) {
            if (trimmedCmd === "kill -all") {
                output = "🗑️ Closing all terminal instances...";
                appManager.closeAllInstancesOfApp("terminal");
            } else {
                const targetId = trimmedCmd.replace("kill -", "");
                const instances = appManager.getRunningInstances("terminal");
                if (instances.some(i => i.instanceId === targetId)) {
                    output = `🗑️ Closing instance: ${targetId}`;
                    appManager.closeInstance(targetId);
                } else {
                    output = `❌ No terminal instance found with ID: ${targetId}`;
                }
            }
        } else if (trimmedCmd === "help") {
            output = `📚 Available Commands:\n
  🔹 help          - Show available commands
  🔹 about         - Info about TenjikuOS & Developer
  🔹 run [app]     - Execute applications
  🔹 clear         - Clear the terminal
  🔹 math          - Perform arithmetic (e.g., 40 + 30)
  🔹 developer     - Know the Developer
  🔹 portfolio     - Know the Developer's Portfolio
  🔹 author        - Know the Developer
  🔹 apps          - List all available apps
  🔹 maths         - Solve mathematical expressions
  🔹 exit          - Close the current app
  🔹 date          - Display current date
  🔹 time          - Display current time
  🔹 fdate         - Display full date and time
  🔹 system        - Display system information
  🔹 stiya         - Help related to Stiya OS
  🔹 stiya -init   - Initialize authentication
  🔹 stiya -acc    - Account information
  🔹 stiya -build  - Build information
  🔹 kill          - Terminal instance management`;
        } else if (trimmedCmd === "about") {
            output = AboutStiyaOS;
        } else if (trimmedCmd === "system") {
            output = `🖥️ System Information:\n
  📛 System Name: ${SystemInformation.name}
  🔢 Version: ${SystemInformation.version}
  👤 Author: ${SystemInformation.author}
  ⚡ Features:\n${SystemInformation.features.map((feature: any, index: number) => `    ${index + 1}. ${feature}`).join("\n")}
  🔑 Session ID: ${SystemInformation.sessionId}
  📅 Last Updated: ${SystemInformation.lastUpdated}`;
        } else if (trimmedCmd === "hello" || trimmedCmd === "stiya") {
            output = "👋 Hello! It's me Stiya CLI. You can use my commands to perform any task related to Stiya OS. How can I help you?";
        } else if (trimmedCmd === "date") {
            output = `📅 ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
        } else if (trimmedCmd === "time") {
            output = `⏰ ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`;
        } else if (trimmedCmd === "fdate") {
            output = `📅 ${new Date().toDateString()}, ${new Date().toLocaleTimeString()}`;
        } else if (trimmedCmd === "maths") {
            setIsMathMode(true);
            setMathCategory("");
            output = MathsInfo;
        } else if (trimmedCmd === "sti") {
            output = TenInfo;
        } else if (trimmedCmd === "apps") {
            const apps = Object.values(allApps);
            output = `📱 Available Apps (${apps.length}):\n${apps.map((app, index) => `  ${index + 1}. ${app.name}`).join("\n")}`;
        } else if (trimmedCmd === "developer" || trimmedCmd === "author" || trimmedCmd === "portfolio") {
            output = "👨‍💻 Wait a minute... You already know me but still check this! 😄";
            // Commented out runAppByName
            // output = runAppByName("aboutDev", appManager);
        } else if (trimmedCmd.startsWith("run ")) {
            const appName = trimmedCmd.replace("run ", "").toLowerCase();
            // Commented out runAppByName
            // output = runAppByName(appName, appManager);
            output = `🚀 Attempting to run: ${appName}\n(Feature temporarily disabled)`;
        } else if (trimmedCmd === "exit") {
            const instances = appManager.getRunningInstances("terminal");
            if (instances.length > 1) {
                output = "👋 Closing current terminal instance...";
                setTimeout(() => {
                    const currentInstance = instances[instances.length - 1];
                    appManager.closeInstance(currentInstance.instanceId);
                }, 500);
            } else {
                output = "⚠️ Cannot close the last terminal instance.";
            }
        } else if (isMathExpression(trimmedCmd)) {
            try {
                const result = math.evaluate(trimmedCmd);
                output = `🧮 Result: ${result}`;
            } catch {
                output = "❌ Invalid mathematical expression";
            }
        } else if (trimmedCmd.startsWith("stiya -acc") && isAuthDone) {
            if (!localStorage.getItem("username")) {
                output = "⚠️ You must be logged in to use this command.";
            } else if (trimmedCmd === "stiya -acc") {
                output = `👤 Account Information:\n• Current User: ${localStorage.getItem("username")}\n• Session: Active\n• Permissions: User`;
            } else if (trimmedCmd === "stiya -acc --pwd change") {
                output = "🔐 Changing password.\nEnter your old password:";
                // handleUpdate(trimmedCmd);
            } else {
                output = "❌ Invalid stiya -acc command.";
            }
        } else if (trimmedCmd === "stiya -build") {
            output = `🏗️ Stiya OS Build Info:\n• Version: 1.0.0\n• Build Date: ${new Date().toLocaleDateString()}\n• Architecture: x86_64\n• Kernel: StiyaKernel 5.15`;
        } else {
            output = `❌ Command not found: '${trimmedCmd}'\nType 'help' for available commands.`;
        }

        if (shouldContinue !== false) {
            setHistory(prev => [...prev, `stiya$ ${trimmedCmd}`]);
            if (output) {
                await typeWriterEffect(output);
            }
        }
    };

    // --- small utilities ---
    const isMathExpression = (cmd: string) => {
        return /^[\d+\-*/().\s]+$/.test(cmd);
    };

    const typeWriterEffect = async (text: string) => {
        setIsTyping(true);
        const lines = text.split("\n");

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
            const line = lines[lineIndex];
            let displayedText = "";
            
            for (let i = 0; i < line.length; i++) {
                if (isTypingInterruptedRef.current) {
                    setHistory((prev) => [...prev, "⚠️ Command execution interrupted."]);
                    setIsTyping(false);
                    return;
                }
                displayedText += line[i];
                
                // Update the last line in history
                setHistory((prev) => {
                    const newHistory = [...prev];
                    // Find the last output line index
                    const lastOutputIndex = newHistory.length - 1;
                    if (lastOutputIndex >= 0) {
                        // If this is the first character of a new line, add it
                        if (i === 0 && lineIndex > 0) {
                            newHistory.push(displayedText);
                        } else {
                            // Replace the last line
                            newHistory[lastOutputIndex] = 
                                (newHistory[lastOutputIndex] || "") + 
                                (i === 0 && lineIndex === 0 ? "" : "") + 
                                line[i];
                        }
                    }
                    return newHistory;
                });
                
                await new Promise((resolve) => {
                    typingTimerRef.current = setTimeout(resolve, 10);
                });
            }
            
            if (lineIndex < lines.length - 1) {
                setHistory((prev) => [...prev, ""]);
                await new Promise((resolve) => {
                    typingTimerRef.current = setTimeout(resolve, 50);
                });
            }
        }

        setIsTyping(false);
    };

    const solveMathEquation = (equation: string): string => {
        try {
            switch (mathCategory) {
                case "1":
                    return `➕ Result: ${math.evaluate(equation)}`;
                case "2":
                    return `➖ Result: ${math.evaluate(equation)}`;
                case "3":
                    return `✖️ Result: ${math.evaluate(equation)}`;
                case "4":
                    return `➗ Result: ${math.evaluate(equation)}`;
                case "5":
                    return `🔢 Factorized: ${nerdamer(`factor(${equation})`).text()}`;
                case "6":
                    if (equation.includes("dx")) {
                        return `📈 Derivative: ${nerdamer(`diff(${equation.replace("dx", "")}, x)`).text()}`;
                    } else if (equation.includes("∫")) {
                        return `📊 Integral: ${nerdamer(`integrate(${equation.replace("∫", "")}, x)`).text()} + C`;
                    } else {
                        return "❌ Invalid calculus expression. Use 'dx' for differentiation or '∫' for integration.";
                    }
                default:
                    return "❌ Invalid category.";
            }
        } catch {
            return "❌ Invalid equation.";
        }
    };

    // --- handle login/update ---
    const handleLogin = async (username: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Sign in failed");
            
            localStorage.setItem("username", username);
            return true;
        } catch {
            return false;
        }
    };

    const handleUpdate = async (newPassword: string): Promise<boolean> => {
        try {
            const response = await fetch("/api/update", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    username: authUsername, 
                    oldPassword: authPassword, 
                    password: newPassword 
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Password update failed");

            localStorage.setItem("passwordUpdated", "true");
            return true;
        } catch (error: any) {
            return false;
        }
    };

    // --- render ---
    return (
        <div
            className="text-gray-800 font-mono p-4 h-full overflow-y-auto scrollbar-hide text-sm/6 bg-gray-50"
            onClick={() => inputRef.current?.focus()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
                userSelect: "text",
                WebkitUserSelect: "text",
                MozUserSelect: "text",
                msUserSelect: "text",
            }}>
            {history.map((line, index) => (
                <div 
                    key={index}
                    style={{ 
                        userSelect: "text", 
                        WebkitUserSelect: "text", 
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word"
                    }}
                >
                    {line || '\u00A0'}
                </div>
            ))}
            <div ref={scrollRef}></div>
            {!isTyping && (
                <div className="flex items-center">
                    <span className="text-green-700 font-bold">stiya$ </span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="text-gray-900 outline-none w-full ml-2 bg-transparent border-none"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        autoFocus
                        spellCheck={false}
                        autoComplete="off"
                    />
                </div>
            )}
            {isTyping && (
                <div className="flex items-center">
                    <span className="text-green-700 font-bold">stiya$ </span>
                    <span className="ml-2 text-gray-400 italic">Typing...</span>
                </div>
            )}
        </div>
    );
}