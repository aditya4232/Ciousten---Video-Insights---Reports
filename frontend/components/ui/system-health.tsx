"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Database, HardDrive, Cpu, Users } from "lucide-react";

interface SystemHealth {
    status: string;
    version?: string;
    timestamp?: string;
    system?: {
        cpu_percent?: number;
        memory_percent?: number;
        memory_available_mb?: number;
        disk_percent?: number;
        disk_free_gb?: number;
    };
    services?: {
        database?: string;
        data_directory?: string;
        reports_directory?: string;
    };
    sessions?: {
        active_count?: number;
    };
    environment?: string;
}

export function SystemHealthWidget() {
    const [health, setHealth] = useState<SystemHealth | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchHealth();
        const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const fetchHealth = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            const response = await fetch(`${apiUrl}/health`);
            if (!response.ok) throw new Error("Failed to fetch health");
            const data = await response.json();
            setHealth(data);
            setError(null);
        } catch (err) {
            setError("Unable to fetch system health");
            console.error("Health fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 animate-pulse" />
                        System Health
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">Loading...</div>
                </CardContent>
            </Card>
        );
    }

    if (error || !health) {
        return (
            <Card className="border-orange-200 dark:border-orange-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600">
                        <Activity className="h-5 w-5" />
                        System Health
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-sm text-orange-600">{error || "No data available"}</div>
                    <button
                        onClick={fetchHealth}
                        className="mt-2 text-xs text-blue-600 hover:underline"
                    >
                        Retry
                    </button>
                </CardContent>
            </Card>
        );
    }

    const getStatusColor = (status?: string) => {
        if (!status) return "text-gray-600 dark:text-gray-400";
        if (status === "healthy" || status === "ok") return "text-green-600 dark:text-green-400";
        if (status === "degraded") return "text-orange-600 dark:text-orange-400";
        return "text-red-600 dark:text-red-400";
    };

    const getPercentageColor = (percent?: number) => {
        if (!percent) return "text-gray-600 dark:text-gray-400";
        if (percent < 60) return "text-green-600 dark:text-green-400";
        if (percent < 80) return "text-orange-600 dark:text-orange-400";
        return "text-red-600 dark:text-red-400";
    };

    // Safe accessors with defaults
    const cpuPercent = health.system?.cpu_percent ?? 0;
    const memoryPercent = health.system?.memory_percent ?? 0;
    const memoryAvailable = health.system?.memory_available_mb ?? 0;
    const diskPercent = health.system?.disk_percent ?? 0;
    const diskFree = health.system?.disk_free_gb ?? 0;
    const dbStatus = health.services?.database ?? "unknown";
    const activeCount = health.sessions?.active_count ?? 0;

    return (
        <Card className={health.status === "healthy" ? "border-green-200 dark:border-green-800" : "border-orange-200 dark:border-orange-800"}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className={`h-5 w-5 ${getStatusColor(health.status)}`} />
                    System Health
                </CardTitle>
                <CardDescription>
                    {health.version && `Version ${health.version}`}
                    {health.environment && ` • ${health.environment}`}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Overall Status */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <span className={`text-sm font-semibold uppercase ${getStatusColor(health.status)}`}>
                        {health.status || "unknown"}
                    </span>
                </div>

                {/* System Metrics */}
                {health.system && (
                    <div className="space-y-3 pt-2 border-t">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Cpu className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">CPU</span>
                            </div>
                            <span className={`text-sm font-medium ${getPercentageColor(cpuPercent)}`}>
                                {cpuPercent.toFixed(1)}%
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Server className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Memory</span>
                            </div>
                            <span className={`text-sm font-medium ${getPercentageColor(memoryPercent)}`}>
                                {memoryPercent.toFixed(1)}% ({memoryAvailable.toFixed(0)} MB free)
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <HardDrive className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Disk</span>
                            </div>
                            <span className={`text-sm font-medium ${getPercentageColor(diskPercent)}`}>
                                {diskPercent.toFixed(1)}% ({diskFree.toFixed(1)} GB free)
                            </span>
                        </div>
                    </div>
                )}

                {/* Services */}
                {health.services && (
                    <div className="space-y-2 pt-2 border-t">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Database className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Database</span>
                            </div>
                            <span className={`text-xs font-medium uppercase ${getStatusColor(dbStatus)}`}>
                                {dbStatus}
                            </span>
                        </div>
                    </div>
                )}

                {/* Active Sessions */}
                {health.sessions && (
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Active Sessions</span>
                        </div>
                        <span className="text-sm font-medium">
                            {activeCount}
                        </span>
                    </div>
                )}

                {/* Last Updated */}
                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Last updated: {health.timestamp ? new Date(health.timestamp).toLocaleTimeString() : "N/A"}
                </div>
            </CardContent>
        </Card>
    );
}
