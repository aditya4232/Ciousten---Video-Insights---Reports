"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/loading-skeleton";
import { useToast } from "@/components/ui/toast";
import { api, Project, getErrorMessage } from "@/lib/api";
import { Brain, Loader2, CheckCircle2, AlertCircle, Inbox, Settings2 } from "lucide-react";
import { AnomalyTimeline } from "@/components/AnomalyTimeline";
import { ActivityTrack } from "@/components/ActivityTrack";

export default function AnalyzePage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState("");
    const [analysisType, setAnalysisType] = useState("generic");
    const [mode, setMode] = useState("generic");
    const [model, setModel] = useState("deepseek/deepseek-chat-free");
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [totalFrames, setTotalFrames] = useState(0);

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        if (selectedProject) {
            fetchProjectStats(selectedProject);
        }
    }, [selectedProject]);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await api.getProjects();
            setProjects(data.filter((p) => p.has_segmentation));
        } catch (error) {
            addToast({
                title: "Error",
                description: getErrorMessage(error),
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectStats = async (projectId: string) => {
        try {
            const status = await api.getSegmentationStatus(projectId);
            if (status.stats) {
                setTotalFrames(status.stats.total_frames);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedProject) return;

        setAnalyzing(true);
        setAnalysis(null);

        try {
            const data = await api.analyzeVideo(selectedProject, analysisType, model, mode);
            setAnalysis(data.analysis);
            addToast({
                title: "Success",
                description: "Analysis completed successfully",
                variant: "success",
            });
        } catch (error) {
            console.error("Analysis error:", error);
            addToast({
                title: "Analysis Failed",
                description: getErrorMessage(error),
                variant: "error",
            });
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto">
                    <Breadcrumb />

                    <h2 className="text-3xl font-bold mb-2">AI Analysis</h2>
                    <p className="text-muted-foreground mb-8">
                        Generate insights, detect anomalies, and recognize activities using advanced AI.
                    </p>

                    <div className="grid gap-6">
                        {/* Configuration Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings2 className="h-5 w-5" />
                                    Analysis Configuration
                                </CardTitle>
                                <CardDescription>
                                    Select a project and configure analysis parameters
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium mb-2 block">Select Project</label>
                                        {loading ? (
                                            <Skeleton className="h-10 w-full" />
                                        ) : (
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
                                        )}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium mb-2 block">Domain Mode</label>
                                        <select
                                            value={mode}
                                            onChange={(e) => setMode(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md bg-background"
                                        >
                                            <option value="generic">Generic / General Purpose</option>
                                            <option value="traffic">Traffic Analytics</option>
                                            <option value="retail">Retail Analytics</option>
                                            <option value="security">Security / Surveillance</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Adjusts AI focus (e.g., congestion for Traffic, dwell time for Retail).
                                        </p>
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
                                </div>

                                <Button
                                    onClick={handleAnalyze}
                                    disabled={!selectedProject || analyzing}
                                    className="w-full mt-4"
                                >
                                    {analyzing ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Analyzing... (this may take 30-60 seconds)
                                        </>
                                    ) : (
                                        "Run Advanced Analysis"
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Empty State */}
                        {!loading && projects.length === 0 && (
                            <EmptyState
                                icon={Inbox}
                                title="No segmented projects found"
                                description="Please upload and segment a video first before running analysis"
                                action={{
                                    label: "Go to Annotate",
                                    onClick: () => router.push("/annotate"),
                                }}
                            />
                        )}

                        {/* Results Cards */}
                        {analysis && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Advanced Visualizations */}
                                <div className="grid gap-6">
                                    {analysis.anomaly_events && analysis.anomaly_events.length > 0 && (
                                        <AnomalyTimeline
                                            anomalies={analysis.anomaly_events}
                                            totalFrames={totalFrames || 1000}
                                        />
                                    )}

                                    {analysis.activities && analysis.activities.length > 0 && (
                                        <ActivityTrack
                                            activities={analysis.activities}
                                            totalFrames={totalFrames || 1000}
                                        />
                                    )}
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <Card className="h-full">
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                Executive Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm leading-relaxed text-muted-foreground">{analysis.summary}</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="h-full">
                                        <CardHeader>
                                            <CardTitle>Key Findings</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2">
                                                {analysis.key_findings?.map((finding: string, idx: number) => (
                                                    <li key={idx} className="flex gap-2 items-start">
                                                        <span className="text-primary mt-1">•</span>
                                                        <span className="text-sm">{finding}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </div>

                                {analysis.kpis && analysis.kpis.length > 0 && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Key Performance Indicators ({mode})</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {analysis.kpis.map((kpi: any, idx: number) => (
                                                    <div key={idx} className="bg-muted/50 rounded-lg p-4 border">
                                                        <p className="text-sm text-muted-foreground mb-1 truncate" title={kpi.name}>{kpi.name}</p>
                                                        <p className="text-2xl font-bold">
                                                            {kpi.value} <span className="text-sm font-normal text-muted-foreground">{kpi.unit}</span>
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                <div className="flex gap-3 justify-end">
                                    <Button size="lg" onClick={() => router.push("/reports")}>
                                        Generate Reports & Dataset Card →
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
