"use client";

import { Anomaly } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface AnomalyTimelineProps {
    anomalies: Anomaly[];
    totalFrames: number;
    onSeek?: (timestamp: number) => void;
}

export function AnomalyTimeline({ anomalies, totalFrames }: AnomalyTimelineProps) {
    if (!anomalies || anomalies.length === 0) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                    Anomaly Timeline
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative h-12 bg-muted rounded-full overflow-hidden mb-4">
                    {anomalies.map((anomaly, idx) => {
                        const position = (anomaly.frame_index / totalFrames) * 100;
                        return (
                            <div
                                key={idx}
                                className="absolute top-0 bottom-0 w-1 bg-orange-500 cursor-pointer hover:w-2 transition-all"
                                style={{ left: `${position}%` }}
                                title={`${anomaly.description} (Frame ${anomaly.frame_index})`}
                            />
                        );
                    })}
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                    {anomalies.map((anomaly, idx) => (
                        <div key={idx} className="text-sm flex justify-between items-center border-b pb-1 last:border-0">
                            <span className="text-muted-foreground">Frame {anomaly.frame_index}</span>
                            <span className="font-medium text-orange-600">{anomaly.description}</span>
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                                Severity: {anomaly.severity}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
