"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/loading-skeleton";
import { useToast } from "@/components/ui/toast";
import { api, Project, getErrorMessage, DatasetCard } from "@/lib/api";
import { FileText, Download, Loader2, CheckCircle2, Inbox, Sparkles } from "lucide-react";
import { DatasetCardView } from "@/components/DatasetCardView";

export default function ReportsPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState<string | null>(null);
    const [generatingCard, setGeneratingCard] = useState<string | null>(null);
    const [datasetCards, setDatasetCards] = useState<Record<string, DatasetCard>>({});

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await api.getProjects();
            setProjects(data.filter((p) => p.has_analysis));
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

    const handleGenerateReports = async (projectId: string) => {
        setGenerating(projectId);

        try {
            await api.generateReports(projectId);
            addToast({
                title: "Success",
                description: "Reports generated successfully",
                variant: "success",
            });
            // Refresh projects list
            await fetchProjects();
        } catch (error) {
            console.error("Report generation error:", error);
            addToast({
                title: "Generation Failed",
                description: getErrorMessage(error),
                variant: "error",
            });
        } finally {
            setGenerating(null);
        }
    };

    const handleGenerateDatasetCard = async (projectId: string) => {
        setGeneratingCard(projectId);
        try {
            const card = await api.generateDatasetCard(projectId);
            setDatasetCards(prev => ({ ...prev, [projectId]: card }));
            addToast({
                title: "Success",
                description: "Dataset Card generated successfully",
                variant: "success",
            });
        } catch (error) {
            console.error("Card generation error:", error);
            addToast({
                title: "Generation Failed",
                description: getErrorMessage(error),
                variant: "error",
            });
        } finally {
            setGeneratingCard(null);
        }
    };

    const handleDownload = async (projectId: string, type: "excel" | "pdf") => {
        try {
            const blob = await api.downloadReport(projectId, type);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `ciousten_${projectId}.${type === "excel" ? "xlsx" : "pdf"}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            addToast({
                title: "Success",
                description: `${type.toUpperCase()} report downloaded successfully`,
                variant: "success",
            });
        } catch (error) {
            console.error("Download error:", error);
            addToast({
                title: "Download Failed",
                description: getErrorMessage(error),
                variant: "error",
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <Breadcrumb />

                    <h2 className="text-3xl font-bold mb-2">Reports & Downloads</h2>
                    <p className="text-muted-foreground mb-8">
                        Generate and download Excel/PDF reports and Dataset Cards.
                    </p>

                    {loading ? (
                        <ListSkeleton count={3} />
                    ) : projects.length === 0 ? (
                        <EmptyState
                            icon={Inbox}
                            title="No analyzed projects found"
                            description="Please analyze a video project first before generating reports"
                            action={{
                                label: "Go to Analyze",
                                onClick: () => router.push("/analyze"),
                            }}
                        />
                    ) : (
                        <div className="space-y-6">
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
                                        <div className="flex flex-col gap-4">
                                            {/* Report Buttons */}
                                            {project.has_reports ? (
                                                <div className="flex gap-3">
                                                    <Button
                                                        onClick={() => handleDownload(project.project_id, "excel")}
                                                        variant="outline"
                                                        className="flex-1"
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        Excel Report
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDownload(project.project_id, "pdf")}
                                                        variant="outline"
                                                        className="flex-1"
                                                    >
                                                        <Download className="mr-2 h-4 w-4" />
                                                        PDF Report
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
                                                            Generate Reports (Excel + PDF)
                                                        </>
                                                    )}
                                                </Button>
                                            )}

                                            {/* Dataset Card Button */}
                                            {!datasetCards[project.project_id] && (
                                                <Button
                                                    onClick={() => handleGenerateDatasetCard(project.project_id)}
                                                    disabled={generatingCard === project.project_id}
                                                    variant="secondary"
                                                    className="w-full"
                                                >
                                                    {generatingCard === project.project_id ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Generating Dataset Card...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Sparkles className="mr-2 h-4 w-4 text-purple-500" />
                                                            Generate AI Dataset Card
                                                        </>
                                                    )}
                                                </Button>
                                            )}

                                            {/* Dataset Card View */}
                                            {datasetCards[project.project_id] && (
                                                <DatasetCardView card={datasetCards[project.project_id]} />
                                            )}
                                        </div>
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
