"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface WelcomeModalProps {
    onSessionStart: (name: string, sessionId: string) => void;
}

export function WelcomeModal({ onSessionStart }: WelcomeModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [agreedToSession, setAgreedToSession] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [deviceInfo, setDeviceInfo] = useState({ device: "Unknown", timezone: "UTC" });

    useEffect(() => {
        // Check if user already has a session
        const existingSession = localStorage.getItem("ciousten_session");
        if (!existingSession) {
            setIsOpen(true);
        }

        // Detect device and timezone
        const device = detectDevice();
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        setDeviceInfo({ device, timezone });
    }, []);

    const detectDevice = () => {
        const ua = navigator.userAgent;
        if (/mobile/i.test(ua)) return "Mobile";
        if (/tablet/i.test(ua)) return "Tablet";
        if (/windows/i.test(ua)) return "Windows PC";
        if (/macintosh/i.test(ua)) return "Mac";
        if (/linux/i.test(ua)) return "Linux";
        return "Desktop";
    };

    const handleStart = async () => {
        if (!name.trim()) {
            alert("Please enter your name");
            return;
        }

        setIsLoading(true);

        try {
            if (agreedToSession) {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
                const response = await fetch(`${apiUrl}/api/session`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name: name.trim(),
                        device: deviceInfo.device,
                        timezone: deviceInfo.timezone,
                        user_agent: navigator.userAgent,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem("ciousten_session", JSON.stringify(data));
                    onSessionStart(name, data.session_id);
                }
            }
        } catch (error) {
            console.log("Session creation skipped (API unavailable)");
        }

        // Save name locally regardless
        localStorage.setItem("ciousten_user", name);
        setIsOpen(false);
        setIsLoading(false);
    };

    const handleSkip = () => {
        localStorage.setItem("ciousten_session", "skipped");
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
                {/* Close button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                {/* Header */}
                <div className="p-6 pb-4 text-center border-b border-gray-700">
                    <div className="mb-4">
                        <span className="text-3xl">🎬</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Welcome to Ciousten
                    </h2>
                    <p className="text-gray-400 text-sm">
                        Video Insights & Reports Platform
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Name input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            What should we call you?
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onKeyDown={(e) => e.key === "Enter" && handleStart()}
                        />
                    </div>

                    {/* Session checkbox */}
                    <div className="flex items-start gap-3">
                        <input
                            type="checkbox"
                            id="session"
                            checked={agreedToSession}
                            onChange={(e) => setAgreedToSession(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500"
                        />
                        <label htmlFor="session" className="text-sm text-gray-400">
                            Start a temporary session to track your progress (data cleared when you leave)
                        </label>
                    </div>

                    {/* Device info */}
                    <div className="bg-gray-800/50 rounded-lg p-3 text-xs text-gray-500">
                        <div className="flex justify-between">
                            <span>Device: {deviceInfo.device}</span>
                            <span>Timezone: {deviceInfo.timezone}</span>
                        </div>
                    </div>

                    {/* Start button */}
                    <Button
                        onClick={handleStart}
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all"
                    >
                        {isLoading ? "Starting..." : "Start Exploring 🚀"}
                    </Button>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-800/50 text-center border-t border-gray-700">
                    <p className="text-xs text-gray-500">
                        Made with ❤️ by{" "}
                        <a
                            href="https://www.adityacuz.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                        >
                            Aditya Shenvi
                        </a>{" "}
                        @ 2025-26
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                        Open Source • MIT License
                    </p>
                </div>
            </div>
        </div>
    );
}
