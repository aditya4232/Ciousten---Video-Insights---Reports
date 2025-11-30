"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Video, Play, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AnnotatePage() {
    const [file, setFile] = useState<File | null>(null);
    const [projectId, setProjectId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [segmenting, setSegmenting] = useState(false);
    const [status, setStatus] = useState<string>("idle");
    const [stats, setStats] = useState<any>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setStatus("uploading");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload-video", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            setProjectId(data.project_id);
            setStatus("uploaded");
        } catch (error) {
            console.error("Upload error:", error);
            setStatus("error");
        } finally {
            setUploading(false);
        }
    };

    const handleSegment = async () => {
        if (!projectId) return;

        setSegmenting(true);
        setStatus("segmenting");

        try {
            const response = await fetch(`/api/segment-video/${projectId}`, {
                method: "POST",
            });

            if (!response.ok) throw new Error("Segmentation failed");

            // Poll for status
            const pollStatus = async () => {
                const statusResponse = await fetch(`/api/segment-video/${projectId}/status`);
                const statusData = await statusResponse.json();

                if (statusData.status === "segmented") {
                    setStats(statusData.stats);
                    setStatus("segmented");
                    setSegmenting(false);
                } else if (statusData.status === "failed") {
                    setStatus("error");
                    setSegmenting(false);
                } else {
                    setTimeout(pollStatus, 3000);
                }
            };

            setTimeout(pollStatus, 3000);
        } catch (error) {
            console.error("Segmentation error:", error);
            setStatus("error");
            setSegmenting(false);
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
                            <Button variant="default">Annotate</Button>
                        </Link>
                        <Link href="/analyze">
                            <Button variant="ghost">Analyze</Button>
                        </Link>
                        <Link href="/reports">
                            <Button variant="ghost">Reports</Button>
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
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
                                    <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                                        <input
                                            type="file"
                                            accept="video/mp4,video/quicktime,video/x-msvideo"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="video-upload"
                                        />
                                        <label htmlFor="video-upload" className="cursor-pointer">
                                            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                            <p className="text-sm font-medium mb-1">
                                                {file ? file.name : "Click to upload or drag and drop"}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                MP4, MOV, or AVI (max 500MB)
                                            </p>
                                        </label>
                                    </div>

                                    <Button
                                        onClick={handleUpload}
                                        disabled={!file || uploading || status !== "idle"}
                                        className="w-full"
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

                                        <Button
                                            onClick={handleSegment}
                                            disabled={segmenting || status === "segmented"}
                                            className="w-full"
                                        >
                                            {segmenting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Segmenting... (this may take a few minutes)
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
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Total Frames</p>
                                            <p className="text-2xl font-bold text-blue-600">{stats.total_frames}</p>
                                        </div>
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Total Objects</p>
                                            <p className="text-2xl font-bold text-purple-600">{stats.total_objects}</p>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Avg Objects/Frame</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {stats.avg_objects_per_frame?.toFixed(2)}
                                            </p>
                                        </div>
                                        <div className="bg-orange-50 rounded-lg p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Processing Time</p>
                                            <p className="text-2xl font-bold text-orange-600">
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
                                        <Link href="/analyze" className="flex-1">
                                            <Button className="w-full">
                                                Continue to Analysis →
                                            </Button>
                                        </Link>
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
