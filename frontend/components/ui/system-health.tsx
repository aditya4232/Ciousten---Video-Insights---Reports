"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, Database, HardDrive, Cpu, Users } from "lucide-react";

interface SystemHealth {
    status: string;
    version: string;
    timestamp: string;
    system: {
        cpu_percent: number;
        memory_percent: number;
        memory_available_mb: number;
        disk_percent: number;
        disk_free_gb: number;
    };
    services: {
        database: string;
        data_directory: string;
        reports_directory: string;
    };
    sessions: {
        active_count: number;
    };
    environment: string;
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
            console.error(err);
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
                    <div className="text-sm text-orange-600">{error}</div>
                </CardContent>
            </Card>
        );
    }

    const getStatusColor = (status: string) => {
        if (status === "healthy" || status === "ok") return "text-green-600 dark:text-green-400";
        if (status === "degraded") return "text-orange-600 dark:text-orange-400";
        return "text-red-600 dark:text-red-400";
    };

    const getPercentageColor = (percent: number) => {
        if (percent < 60) return "text-green-600 dark:text-green-400";
        if (percent < 80) return "text-orange-600 dark:text-orange-400";
        return "text-red-600 dark:text-red-400";
    };

    return (
        <Card className={health.status === "healthy" ? "border-green-200 dark:border-green-800" : "border-orange-200 dark:border-orange-800"}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className={`h-5 w-5 ${getStatusColor(health.status)}`} />
                    System Health
                </CardTitle>
                <CardDescription>
                    Version {health.version} • {health.environment}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Overall Status */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <span className={`text-sm font-semibold uppercase ${getStatusColor(health.status)}`}>
                        {health.status}
                    </span>
                </div>

                {/* System Metrics */}
                <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">CPU</span>
                        </div>
                        <span className={`text-sm font-medium ${getPercentageColor(health.system.cpu_percent)}`}>
                            {health.system.cpu_percent}%
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Memory</span>
                        </div>
                        <span className={`text-sm font-medium ${getPercentageColor(health.system.memory_percent)}`}>
                            {health.system.memory_percent}% ({health.system.memory_available_mb.toFixed(0)} MB free)
                        </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <HardDrive className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Disk</span>
                        </div>
                        <span className={`text-sm font-medium ${getPercentageColor(health.system.disk_percent)}`}>
                            {health.system.disk_percent}% ({health.system.disk_free_gb.toFixed(1)} GB free)
                        </span>
                    </div>
                </div>

                {/* Services */}
                <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Database</span>
                        </div>
                        <span className={`text-xs font-medium uppercase ${getStatusColor(health.services.database)}`}>
                            {health.services.database}
                        </span>
                    </div>
                </div>

                {/* Active Sessions */}
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Active Sessions</span>
                    </div>
                    <span className="text-sm font-medium">
                        {health.sessions.active_count}
                    </span>
                </div>

                {/* Last Updated */}
                <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    Last updated: {new Date(health.timestamp).toLocaleTimeString()}
                </div>
            </CardContent>
        </Card>
    );
}
