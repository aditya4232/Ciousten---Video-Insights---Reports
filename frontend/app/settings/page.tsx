"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToast } from "@/components/ui/toast";
import { Settings as SettingsIcon, Save, TestTube, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function SettingsPage() {
    const { addToast } = useToast();
    const [activeTab, setActiveTab] = useState<"settings" | "test">("settings");
    const [settings, setSettings] = useState({
        openrouterApiKey: "",
        defaultModel: "deepseek/deepseek-chat-free",
        frameExtractionFps: 2,
        maxVideoSizeMb: 500,
        yoloConfidence: 0.25,
    });

    const [testResults, setTestResults] = useState<{
        backend: "idle" | "testing" | "success" | "error";
        health: "idle" | "testing" | "success" | "error";
        api: "idle" | "testing" | "success" | "error";
        message: string;
    }>({
        backend: "idle",
        health: "idle",
        api: "idle",
        message: "",
    });

    useEffect(() => {
        // Load settings from localStorage
        const saved = localStorage.getItem("ciousten_settings");
        if (saved) {
            try {
                setSettings(JSON.parse(saved));
            } catch (error) {
                console.error("Failed to load settings:", error);
            }
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem("ciousten_settings", JSON.stringify(settings));
        addToast({
            title: "Success",
            description: "Settings saved successfully",
            variant: "success",
        });
    };

    const handleChange = (key: string, value: string | number) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    const testBackendConnection = async () => {
        setTestResults({ backend: "testing", health: "idle", api: "idle", message: "Testing backend connection..." });

        try {
            const response = await fetch("http://localhost:8000", { method: "GET" });
            if (response.ok) {
                const data = await response.json();
                setTestResults({ backend: "success", health: "idle", api: "idle", message: `Backend connected! ${data.message || ""}` });
            } else {
                setTestResults({ backend: "error", health: "idle", api: "idle", message: `Backend returned status ${response.status}` });
            }
        } catch (error) {
            setTestResults({ backend: "error", health: "idle", api: "idle", message: "Cannot connect to backend. Make sure it's running on port 8000." });
        }
    };

    const testHealthCheck = async () => {
        setTestResults((prev) => ({ ...prev, health: "testing", message: "Checking backend health..." }));

        try {
            const response = await fetch("http://localhost:8000/health", { method: "GET" });
            if (response.ok) {
                const data = await response.json();
                setTestResults((prev) => ({ ...prev, health: "success", message: `Health check passed! Status: ${data.status}` }));
            } else {
                setTestResults((prev) => ({ ...prev, health: "error", message: `Health check failed with status ${response.status}` }));
            }
        } catch (error) {
            setTestResults((prev) => ({ ...prev, health: "error", message: "Health check failed. Backend not responding." }));
        }
    };

    const testApiEndpoints = async () => {
        setTestResults((prev) => ({ ...prev, api: "testing", message: "Testing API endpoints..." }));

        try {
            const response = await fetch("http://localhost:8000/api/projects", { method: "GET" });
            if (response.ok) {
                const data = await response.json();
                setTestResults((prev) => ({ ...prev, api: "success", message: `API working! Found ${data.length} projects.` }));
            } else {
                setTestResults((prev) => ({ ...prev, api: "error", message: `API test failed with status ${response.status}` }));
            }
        } catch (error) {
            setTestResults((prev) => ({ ...prev, api: "error", message: "API endpoints not responding." }));
        }
    };

    const runAllTests = async () => {
        await testBackendConnection();
        await new Promise(resolve => setTimeout(resolve, 500));
        await testHealthCheck();
        await new Promise(resolve => setTimeout(resolve, 500));
        await testApiEndpoints();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Breadcrumb />

                    <h2 className="text-3xl font-bold mb-2">Settings</h2>
                    <p className="text-muted-foreground mb-8">
                        Configure Ciousten for your environment
                    </p>

                    {/* Tab Navigation */}
                    <div className="flex gap-2 mb-6 border-b">
                        <button
                            onClick={() => setActiveTab("settings")}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === "settings"
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <SettingsIcon className="inline h-4 w-4 mr-2" />
                            Settings
                        </button>
                        <button
                            onClick={() => setActiveTab("test")}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === "test"
                                ? "border-b-2 border-primary text-primary"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <TestTube className="inline h-4 w-4 mr-2" />
                            Test
                        </button>
                    </div>

                    {/* Settings Tab */}
                    {activeTab === "settings" && (
                        <div className="grid gap-6">
                            {/* API Configuration */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <SettingsIcon className="h-5 w-5" />
                                        API Configuration
                                    </CardTitle>
                                    <CardDescription>
                                        Configure OpenRouter API settings for AI analysis
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            OpenRouter API Key
                                        </label>
                                        <input
                                            type="password"
                                            value={settings.openrouterApiKey}
                                            onChange={(e) => handleChange("openrouterApiKey", e.target.value)}
                                            placeholder="sk-or-v1-..."
                                            className="w-full px-3 py-2 border rounded-md bg-background"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Get your API key from{" "}
                                            <a
                                                href="https://openrouter.ai"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                openrouter.ai
                                            </a>
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Default AI Model
                                        </label>
                                        <select
                                            value={settings.defaultModel}
                                            onChange={(e) => handleChange("defaultModel", e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md bg-background"
                                        >
                                            <option value="deepseek/deepseek-chat-free">
                                                DeepSeek Chat (Free)
                                            </option>
                                            <option value="meta-llama/llama-3.1-8b-instruct:free">
                                                Llama 3.1 8B (Free)
                                            </option>
                                            <option value="google/gemini-flash-1.5">
                                                Gemini Flash 1.5
                                            </option>
                                            <option value="anthropic/claude-3.5-sonnet">
                                                Claude 3.5 Sonnet
                                            </option>
                                        </select>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Video Processing */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Video Processing</CardTitle>
                                    <CardDescription>
                                        Configure video processing parameters
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Frame Extraction FPS
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={settings.frameExtractionFps}
                                            onChange={(e) =>
                                                handleChange("frameExtractionFps", parseInt(e.target.value))
                                            }
                                            className="w-full px-3 py-2 border rounded-md bg-background"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Lower FPS = faster processing, higher FPS = more detailed analysis
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            Maximum Video Size (MB)
                                        </label>
                                        <input
                                            type="number"
                                            min="10"
                                            max="2000"
                                            value={settings.maxVideoSizeMb}
                                            onChange={(e) =>
                                                handleChange("maxVideoSizeMb", parseInt(e.target.value))
                                            }
                                            className="w-full px-3 py-2 border rounded-md bg-background"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Detection Settings */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detection Settings</CardTitle>
                                    <CardDescription>
                                        Configure YOLO object detection parameters
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-2 block">
                                            YOLO Confidence Threshold
                                        </label>
                                        <input
                                            type="number"
                                            min="0.1"
                                            max="1.0"
                                            step="0.05"
                                            value={settings.yoloConfidence}
                                            onChange={(e) =>
                                                handleChange("yoloConfidence", parseFloat(e.target.value))
                                            }
                                            className="w-full px-3 py-2 border rounded-md bg-background"
                                        />
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Higher values = fewer but more confident detections (0.1 - 1.0)
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* About */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>About Ciousten</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2 text-sm">
                                        <p>
                                            <strong>Version:</strong> 1.0.0
                                        </p>
                                        <p>
                                            <strong>Author:</strong> Aditya Shenvi @2025
                                        </p>
                                        <p>
                                            <strong>Website:</strong>{" "}
                                            <a
                                                href="https://www.adityacuz.dev"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-primary hover:underline"
                                            >
                                                www.adityacuz.dev
                                            </a>
                                        </p>
                                        <p className="text-muted-foreground mt-4">
                                            Ciousten is an open-source video analytics platform powered by
                                            SAM2, YOLO, and OpenRouter AI.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Save Button */}
                            <div className="flex gap-3">
                                <Button onClick={handleSave} className="flex-1">
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Settings
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Test Tab */}
                    {activeTab === "test" && (
                        <div className="grid gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <TestTube className="h-5 w-5" />
                                        Backend Connection Tests
                                    </CardTitle>
                                    <CardDescription>
                                        Verify that the Ciousten backend is running and accessible
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Test Results Display */}
                                    {testResults.message && (
                                        <div className={`p-4 rounded-lg border ${testResults.backend === "success" || testResults.health === "success" || testResults.api === "success"
                                            ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                                            : testResults.backend === "error" || testResults.health === "error" || testResults.api === "error"
                                                ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                                                : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                                            }`}>
                                            <p className="text-sm font-medium">{testResults.message}</p>
                                        </div>
                                    )}

                                    {/* Individual Tests */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-2">
                                                {testResults.backend === "testing" && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                                                {testResults.backend === "success" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                                {testResults.backend === "error" && <XCircle className="h-4 w-4 text-red-600" />}
                                                {testResults.backend === "idle" && <div className="h-4 w-4 rounded-full border-2" />}
                                                <span className="font-medium">Backend Connection</span>
                                            </div>
                                            <Button
                                                onClick={testBackendConnection}
                                                disabled={testResults.backend === "testing"}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Test
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-2">
                                                {testResults.health === "testing" && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                                                {testResults.health === "success" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                                {testResults.health === "error" && <XCircle className="h-4 w-4 text-red-600" />}
                                                {testResults.health === "idle" && <div className="h-4 w-4 rounded-full border-2" />}
                                                <span className="font-medium">Health Check</span>
                                            </div>
                                            <Button
                                                onClick={testHealthCheck}
                                                disabled={testResults.health === "testing"}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Test
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-2">
                                                {testResults.api === "testing" && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                                                {testResults.api === "success" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                                                {testResults.api === "error" && <XCircle className="h-4 w-4 text-red-600" />}
                                                {testResults.api === "idle" && <div className="h-4 w-4 rounded-full border-2" />}
                                                <span className="font-medium">API Endpoints</span>
                                            </div>
                                            <Button
                                                onClick={testApiEndpoints}
                                                disabled={testResults.api === "testing"}
                                                variant="outline"
                                                size="sm"
                                            >
                                                Test
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Run All Tests Button */}
                                    <Button onClick={runAllTests} className="w-full">
                                        <TestTube className="mr-2 h-4 w-4" />
                                        Run All Tests
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Backend Setup Instructions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Backend Setup Instructions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div>
                                        <p className="font-medium mb-2">If tests fail, ensure the backend is running:</p>
                                        <div className="bg-muted p-3 rounded font-mono text-xs">
                                            cd backend<br />
                                            .\venv\Scripts\activate.ps1<br />
                                            python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-medium mb-2">Or use Docker (recommended):</p>
                                        <div className="bg-muted p-3 rounded font-mono text-xs">
                                            docker-compose up --build
                                        </div>
                                    </div>
                                    <div className="text-muted-foreground">
                                        <p>Backend should be accessible at: <strong>http://localhost:8000</strong></p>
                                        <p>API documentation: <strong>http://localhost:8000/docs</strong></p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
