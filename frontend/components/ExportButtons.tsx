"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Package, FileJson, FileCode, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "react-hot-toast";

interface ExportButtonsProps {
    projectId: string;
}

export function ExportButtons({ projectId }: ExportButtonsProps) {
    const [exportingCoco, setExportingCoco] = useState(false);
    const [exportingYolo, setExportingYolo] = useState(false);
    const [cocoExported, setCocoExported] = useState(false);
    const [yoloExported, setYoloExported] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const exportToCoco = async () => {
        setExportingCoco(true);
        try {
            const response = await fetch(`${apiUrl}/api/export/${projectId}/coco`, {
                method: "POST",
            });

            if (!response.ok) throw new Error("Export failed");

            const data = await response.json();

            // Download the file
            const downloadUrl = `${apiUrl}${data.download_url}`;
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `${projectId}_coco.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setCocoExported(true);
            toast.success(`COCO dataset exported! ${data.statistics.images} images, ${data.statistics.annotations} annotations`);
        } catch (error) {
            toast.error("Failed to export COCO dataset");
            console.error(error);
        } finally {
            setExportingCoco(false);
        }
    };

    const exportToYolo = async () => {
        setExportingYolo(true);
        try {
            const response = await fetch(`${apiUrl}/api/export/${projectId}/yolo`, {
                method: "POST",
            });

            if (!response.ok) throw new Error("Export failed");

            const data = await response.json();

            // Download the file
            const downloadUrl = `${apiUrl}${data.download_url}`;
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `${projectId}_yolo.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setYoloExported(true);
            toast.success(`YOLO dataset exported! ${data.statistics.classes} classes`);
        } catch (error) {
            toast.error("Failed to export YOLO dataset");
            console.error(error);
        } finally {
            setExportingYolo(false);
        }
    };

    return (
        <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    <CardTitle>Dataset Export</CardTitle>
                </div>
                <CardDescription>
                    Export your segmentation data to industry-standard formats
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* COCO Export */}
                <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <FileJson className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold">COCO Format</h4>
                            <p className="text-sm text-muted-foreground">
                                Standard format for object detection datasets
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={exportToCoco}
                        disabled={exportingCoco}
                        className="gap-2"
                        variant={cocoExported ? "outline" : "default"}
                    >
                        {exportingCoco ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Exporting...
                            </>
                        ) : cocoExported ? (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Exported
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Export COCO
                            </>
                        )}
                    </Button>
                </div>

                {/* YOLO Export */}
                <div className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <FileCode className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-semibold">YOLO Format</h4>
                            <p className="text-sm text-muted-foreground">
                                Ready for YOLO model training
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={exportToYolo}
                        disabled={exportingYolo}
                        className="gap-2"
                        variant={yoloExported ? "outline" : "default"}
                    >
                        {exportingYolo ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Exporting...
                            </>
                        ) : yoloExported ? (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Exported
                            </>
                        ) : (
                            <>
                                <Download className="h-4 w-4" />
                                Export YOLO
                            </>
                        )}
                    </Button>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    <p className="font-medium mb-1">📦 What's included:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>All annotated images</li>
                        <li>Bounding box coordinates</li>
                        <li>Class labels and categories</li>
                        <li>Ready for model training</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
