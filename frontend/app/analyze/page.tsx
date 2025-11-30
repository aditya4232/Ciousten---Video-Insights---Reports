"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Brain, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AnalyzePage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [analysisType, setAnalysisType] = useState("generic");
    const [model, setModel] = useState("deepseek/deepseek-chat-free");
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch("/api/projects");
            const data = await response.json();
            setProjects(data.filter((p: any) => p.has_segmentation));
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedProject) return;

        setAnalyzing(true);
        setError(null);

        try {
            const response = await fetch(`/api/analyze/${selectedProject}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ analysis_type: analysisType, model }),
            });

            if (!response.ok) throw new Error("Analysis failed");

            const data = await response.json();
            setAnalysis(data.analysis);
        } catch (error: any) {
            console.error("Analysis error:", error);
            setError(error.message || "Analysis failed");
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Video className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Ciousten
                        </h1>
                    </Link>
                    <nav className="flex gap-4">
                        <Link href="/annotate">
                            <Button variant="ghost">Annotate</Button>
                        </Link>
                        <Link href="/analyze">
                            <Button variant="default">Analyze</Button>
                        </Link>
                        <Link href="/reports">
                            <Button variant="ghost">Reports</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-2">AI Analysis</h2>
                    <p className="text-muted-foreground mb-8">
                        Generate insights and recommendations using OpenRouter LLMs
                    </p>

                    <div className="grid gap-6">
                        {/* Configuration Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5" />
                                    Analysis Configuration
                                </CardTitle>
                                <CardDescription>
                                    Select a project and configure analysis parameters
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium mb-2 block">Select Project</label>
                                    <select
                                        value={selectedProject}
                                        onChange={(e) => setSelectedProject(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-background"
                                    >
                                        <option value="">Choose a segmented project...</option>
                                        {projects.map((project) => (
                                            <option key={project.project_id} value={project.project_id}>
                                                {project.video_filename} ({project.project_id.slice(0, 8)}...)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">Analysis Type</label>
                                    <select
                                        value={analysisType}
                                        onChange={(e) => setAnalysisType(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-background"
                                    >
                                        <option value="generic">Generic</option>
                                        <option value="traffic">Traffic</option>
                                        <option value="retail">Retail</option>
                                        <option value="sports">Sports</option>
                                        <option value="security">Security</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium mb-2 block">AI Model</label>
                                    <select
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md bg-background"
                                    >
                                        <option value="deepseek/deepseek-chat-free">DeepSeek Chat (Free)</option>
                                        <option value="meta-llama/llama-3.1-8b-instruct:free">Llama 3.1 8B (Free)</option>
                                        <option value="google/gemini-flash-1.5">Gemini Flash 1.5</option>
                                    </select>
                                </div>

                                <Button
                                    onClick={handleAnalyze}
                                    disabled={!selectedProject || analyzing}
                                    className="w-full"
                                >
                                    {analyzing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing... (this may take 30-60 seconds)
                                        </>
                                    ) : (
                                        "Run AI Analysis"
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Error Card */}
                        {error && (
                            <Card className="border-destructive">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 text-destructive">
                                        <AlertCircle className="h-5 w-5" />
                                        <p className="font-medium">{error}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Results Card */}
                        {analysis && (
                            <>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            Summary
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm leading-relaxed">{analysis.summary}</p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Key Findings</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2">
                                            {analysis.key_findings?.map((finding: string, idx: number) => (
                                                <li key={idx} className="flex gap-2">
                                                    <span className="text-primary">•</span>
                                                    <span className="text-sm">{finding}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                {analysis.anomalies && analysis.anomalies.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Anomalies Detected</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {analysis.anomalies.map((anomaly: string, idx: number) => (
                                                    <li key={idx} className="flex gap-2">
                                                        <span className="text-orange-600">⚠</span>
                                                        <span className="text-sm">{anomaly}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                )}

                                {analysis.kpis && analysis.kpis.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Key Performance Indicators</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 gap-4">
                                                {analysis.kpis.map((kpi: any, idx: number) => (
                                                    <div key={idx} className="bg-muted/50 rounded-lg p-4">
                                                        <p className="text-sm text-muted-foreground mb-1">{kpi.name}</p>
                                                        <p className="text-2xl font-bold">
                                                            {kpi.value} <span className="text-sm font-normal text-muted-foreground">{kpi.unit}</span>
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                <div className="flex gap-3">
                                    <Link href="/reports" className="flex-1">
                                        <Button className="w-full">
                                            Generate Reports →
                                        </Button>
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
