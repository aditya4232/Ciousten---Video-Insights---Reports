"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { useToast } from "@/components/ui/toast";
import { api, getErrorMessage } from "@/lib/api";
import { Upload, Play, Loader2, CheckCircle2, AlertCircle, Video } from "lucide-react";

export default function AnnotatePage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [projectId, setProjectId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [segmenting, setSegmenting] = useState(false);
    const [status, setStatus] = useState<string>("idle");
    const [stats, setStats] = useState<any>(null);
    const [dragActive, setDragActive] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type.startsWith("video/")) {
                setFile(droppedFile);
            } else {
                addToast({
                    title: "Invalid File",
                    description: "Please upload a video file",
                    variant: "error",
                });
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus("uploading");

        try {
            const data = await api.uploadVideo(file);
            setProjectId(data.project_id);
            setStatus("uploaded");
            addToast({
                title: "Success",
                description: "Video uploaded successfully",
                variant: "success",
            });
        } catch (error) {
            console.error("Upload error:", error);
            setStatus("error");
            addToast({
                title: "Upload Failed",
                description: getErrorMessage(error),
                variant: "error",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSampleVideo = async () => {
        setUploading(true);
        setStatus("uploading");

        try {
            const data = await api.createSampleProject();
            setProjectId(data.project_id);
            setStatus("uploaded");
            addToast({
                title: "Success",
                description: "Sample video loaded successfully",
                variant: "success",
            });
        } catch (error) {
            console.error("Sample load error:", error);
            setStatus("error");
            addToast({
                title: "Failed to load sample",
                description: getErrorMessage(error),
                variant: "error",
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSegment = async () => {
        if (!projectId) return;

        setSegmenting(true);
        setStatus("segmenting");

        try {
            await api.startSegmentation(projectId);

            // Poll for status
            const pollStatus = async () => {
                try {
                    const statusData = await api.getSegmentationStatus(projectId);

                    if (statusData.progress) setProgress(statusData.progress);
                    if (statusData.status_message) setStatusMessage(statusData.status_message);

                    if (statusData.status === "segmented") {
                        setStats(statusData.stats);
                        setStatus("segmented");
                        setSegmenting(false);
                        setProgress(100);
                        addToast({
                            title: "Success",
                            description: "Segmentation completed successfully",
                            variant: "success",
                        });
                    } else if (statusData.status === "failed") {
                        setStatus("error");
                        setSegmenting(false);
                        addToast({
                            title: "Segmentation Failed",
                            description: "An error occurred during segmentation",
                            variant: "error",
                        });
                    } else {
                        setTimeout(pollStatus, 1000);
                    }
                } catch (error) {
                    setStatus("error");
                    setSegmenting(false);
                    addToast({
                        title: "Error",
                        description: getErrorMessage(error),
                        variant: "error",
                    });
                }
            };

            setTimeout(pollStatus, 3000);
        } catch (error) {
            console.error("Segmentation error:", error);
            setStatus("error");
            setSegmenting(false);
            addToast({
                title: "Segmentation Failed",
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

                    <h2 className="text-3xl font-bold mb-2">Video Annotation</h2>
                    <p className="text-muted-foreground mb-8">
                        Upload a video and run AI-powered segmentation with SAM2 + YOLO
                    </p>

                    <div className="grid gap-6">
                        {/* Upload Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Upload className="h-5 w-5" />
                                    Step 1: Upload Video
                                </CardTitle>
                                <CardDescription>
                                    Select a video file (.mp4, .mov, .avi) to analyze
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div
                                        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                                            ? "border-primary bg-primary/5"
                                            : "hover:border-primary/50"
                                            }`}
                                        onDragEnter={handleDrag}
                                        onDragLeave={handleDrag}
                                        onDragOver={handleDrag}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            type="file"
                                            accept="video/mp4,video/quicktime,video/x-msvideo"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="video-upload"
                                        />
                                        <label htmlFor="video-upload" className="cursor-pointer">
                                            {file ? (
                                                <Video className="h-12 w-12 mx-auto mb-4 text-primary" />
                                            ) : (
                                                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                            )}
                                            <p className="text-sm font-medium mb-1">
                                                {file ? file.name : "Click to upload or drag and drop"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                MP4, MOV, or AVI (max 500MB)
                                            </p>
                                        </label>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={handleUpload}
                                            disabled={!file || uploading || status !== "idle"}
                                            className="flex-1"
                                        >
                                            {uploading ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Uploading...
                                                </>
                                            ) : status === "uploaded" || status === "segmented" ? (
                                                <>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Uploaded
                                                </>
                                            ) : (
                                                "Upload Video"
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={handleSampleVideo}
                                            disabled={uploading || status !== "idle"}
                                            className="flex-1"
                                        >
                                            Try Sample Video
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Segmentation Card */}
                        {projectId && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Play className="h-5 w-5" />
                                        Step 2: Run Segmentation
                                    </CardTitle>
                                    <CardDescription>
                                        Process video with YOLO detection and SAM2 segmentation
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="bg-muted/50 rounded-lg p-4">
                                            <p className="text-sm font-medium mb-1">Project ID</p>
                                            <p className="text-xs text-muted-foreground font-mono">{projectId}</p>
                                        </div>

                                        {segmenting && (
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span>{statusMessage || "Processing..."}</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-500 ease-out"
                                                        style={{ width: `${progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleSegment}
                                            disabled={segmenting || status === "segmented"}
                                            className="w-full"
                                        >
                                            {segmenting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Segmenting...
                                                </>
                                            ) : status === "segmented" ? (
                                                <>
                                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                                    Segmentation Complete
                                                </>
                                            ) : (
                                                "Start Segmentation"
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Results Card */}
                        {stats && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        Segmentation Results
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Total Frames</p>
                                            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.total_frames}</p>
                                        </div>
                                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Total Objects</p>
                                            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.total_objects}</p>
                                        </div>
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Avg Objects/Frame</p>
                                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {stats.avg_objects_per_frame?.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Processing Time</p>
                                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                                {stats.processing_time_seconds?.toFixed(1)}s
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <p className="text-sm font-medium mb-2">Objects by Class</p>
                                        <div className="space-y-2">
                                            {Object.entries(stats.objects_per_class || {}).map(([className, count]) => (
                                                <div key={className} className="flex justify-between items-center bg-muted/50 rounded px-3 py-2">
                                                    <span className="text-sm font-medium">{className}</span>
                                                    <span className="text-sm text-muted-foreground">{count as number} objects</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <Button className="flex-1" onClick={() => router.push("/analyze")}>
                                            Continue to Analysis →
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {status === "error" && (
                            <Card className="border-destructive">
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-2 text-destructive">
                                        <AlertCircle className="h-5 w-5" />
                                        <p className="font-medium">An error occurred. Please try again.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
