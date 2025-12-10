"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface ProgressUpdate {
    type: string;
    project_id: string;
    stage: string;
    progress: number;
    message: string;
    timestamp: string;
}

interface RealTimeProgressProps {
    projectId: string;
    onComplete?: () => void;
    onError?: (error: string) => void;
}

export function RealTimeProgress({ projectId, onComplete, onError }: RealTimeProgressProps) {
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState("Initializing");
    const [message, setMessage] = useState("Connecting...");
    const [status, setStatus] = useState<"connecting" | "processing" | "complete" | "error">("connecting");
    const [ws, setWs] = useState<WebSocket | null>(null);

    useEffect(() => {
        // Get WebSocket URL from environment or default to localhost
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const wsUrl = apiUrl.replace("http", "ws").replace("https", "wss");

        // Connect to WebSocket
        const websocket = new WebSocket(`${wsUrl}/api/ws/${projectId}`);

        websocket.onopen = () => {
            console.log("WebSocket connected");
            setStatus("processing");
            setMessage("Connected to server");
        };

        websocket.onmessage = (event) => {
            const data: ProgressUpdate = JSON.parse(event.data);

            if (data.type === "progress") {
                setProgress(data.progress);
                setStage(data.stage);
                setMessage(data.message);
                setStatus("processing");
            } else if (data.type === "completion") {
                setProgress(100);
                setStatus("complete");
                setMessage(data.message);
                onComplete?.();
            } else if (data.type === "error") {
                setStatus("error");
                setMessage(data.message || "An error occurred");
                onError?.(data.message);
            }
        };

        websocket.onerror = (error) => {
            console.error("WebSocket error:", error);
            setStatus("error");
            setMessage("Connection error");
        };

        websocket.onclose = () => {
            console.log("WebSocket disconnected");
        };

        setWs(websocket);

        return () => {
            websocket.close();
        };
    }, [projectId, onComplete, onError]);

    const getStatusIcon = () => {
        switch (status) {
            case "connecting":
            case "processing":
                return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
            case "complete":
                return <CheckCircle2 className="h-5 w-5 text-green-500" />;
            case "error":
                return <AlertCircle className="h-5 w-5 text-red-500" />;
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case "connecting":
            case "processing":
                return "text-blue-600 dark:text-blue-400";
            case "complete":
                return "text-green-600 dark:text-green-400";
            case "error":
                return "text-red-600 dark:text-red-400";
        }
    };

    return (
        <Card className="border-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        <CardTitle className="text-lg">Processing Status</CardTitle>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor()}`}>
                        {progress}%
                    </span>
                </div>
                <CardDescription>
                    Stage: <span className="font-medium">{stage}</span>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Progress value={progress} className="h-3" />
                <p className="text-sm text-muted-foreground">{message}</p>

                {status === "complete" && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                            ✓ Processing completed successfully!
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                            ✗ {message}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
