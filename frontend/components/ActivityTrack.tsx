"use client";

import { Activity } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity as ActivityIcon } from "lucide-react";

interface ActivityTrackProps {
    activities: Activity[];
    totalFrames: number;
    onSeek?: (timestamp: number) => void;
}

export function ActivityTrack({ activities, totalFrames }: ActivityTrackProps) {
    if (!activities || activities.length === 0) return null;

    const getColor = (label: string) => {
        if (label.includes("High") || label.includes("Congestion")) return "bg-red-500";
        if (label.includes("Moderate")) return "bg-yellow-500";
        if (label.includes("Light")) return "bg-green-500";
        return "bg-gray-400";
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ActivityIcon className="h-5 w-5 text-blue-500" />
                    Activity Track
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative h-8 bg-muted rounded-md overflow-hidden flex">
                    {activities.map((activity, idx) => {
                        const width = ((activity.end_frame - activity.start_frame) / totalFrames) * 100;
                        return (
                            <div
                                key={idx}
                                className={`h-full ${getColor(activity.label)} hover:opacity-80 transition-opacity`}
                                style={{ width: `${width}%` }}
                                title={`${activity.label} (${activity.start_frame}-${activity.end_frame})`}
                            />
                        );
                    })}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                    {Array.from(new Set(activities.map(a => a.label))).map((label) => (
                        <div key={label} className="flex items-center gap-1 text-sm">
                            <div className={`w-3 h-3 rounded-full ${getColor(label)}`} />
                            <span>{label}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
