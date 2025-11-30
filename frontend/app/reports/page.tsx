"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, FileText, Download, Loader2, CheckCircle2 } from "lucide-react";

export default function ReportsPage() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch("/api/projects");
            const data = await response.json();
            setProjects(data.filter((p: any) => p.has_analysis));
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateReports = async (projectId: string) => {
        setGenerating(projectId);

        try {
            const response = await fetch(`/api/reports/${projectId}/generate`, {
                method: "POST",
            });

            if (!response.ok) throw new Error("Report generation failed");

            // Refresh projects list
            await fetchProjects();
        } catch (error) {
            console.error("Report generation error:", error);
        } finally {
            setGenerating(null);
        }
    };

    const handleDownload = async (projectId: string, type: "excel" | "pdf") => {
        try {
            const response = await fetch(`/api/reports/${projectId}/download/${type}`);
            if (!response.ok) throw new Error("Download failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ciousten_${projectId}.${type === "excel" ? "xlsx" : "pdf"}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
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
                            <Button variant="ghost">Analyze</Button>
                        </Link>
                        <Link href="/reports">
                            <Button variant="default">Reports</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-2">Reports & Downloads</h2>
                    <p className="text-muted-foreground mb-8">
                        Generate and download Excel and PDF reports for analyzed projects
                    </p>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : projects.length === 0 ? (
                        <Card>
                            <CardContent className="pt-6 text-center">
                                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <p className="text-muted-foreground mb-4">No analyzed projects found</p>
                                <Link href="/annotate">
                                    <Button>Start Annotating</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {projects.map((project) => (
                                <Card key={project.project_id}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{project.video_filename}</CardTitle>
                                                <CardDescription className="mt-1">
                                                    Project ID: {project.project_id}
                                                    <br />
                                                    Created: {new Date(project.created_at).toLocaleDateString()}
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {project.status === "completed" && (
                                                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                                                )}
                                                <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                                                    {project.status}
                                                </span>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        {project.has_reports ? (
                                            <div className="flex gap-3">
                                                <Button
                                                    onClick={() => handleDownload(project.project_id, "excel")}
                                                    variant="outline"
                                                    className="flex-1"
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download Excel
                                                </Button>
                                                <Button
                                                    onClick={() => handleDownload(project.project_id, "pdf")}
                                                    variant="outline"
                                                    className="flex-1"
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download PDF
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={() => handleGenerateReports(project.project_id)}
                                                disabled={generating === project.project_id}
                                                className="w-full"
                                            >
                                                {generating === project.project_id ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Generating Reports...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Generate Reports
                                                    </>
                                                )}
                                            </Button>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
