"use client";

import { useState } from "react";
import { WelcomeModal } from "@/components/WelcomeModal";

export function ClientWrapper({ children }: { children: React.ReactNode }) {
    const [userName, setUserName] = useState<string>("");
    const [sessionId, setSessionId] = useState<string>("");

    const handleSessionStart = (name: string, id: string) => {
        setUserName(name);
        setSessionId(id);
    };

    return (
        <>
            <WelcomeModal onSessionStart={handleSessionStart} />
            {children}
        </>
    );
}
