"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { EmptyState } from "@/components/ui/empty-state";
import { StatCardSkeleton, ListSkeleton } from "@/components/ui/loading-skeleton";
import { useToast } from "@/components/ui/toast";
import { api, Project, getErrorMessage } from "@/lib/api";
import {
    Video,
    Upload,
    BarChart3,
    FileText,
    TrendingUp,
    Clock,
    CheckCircle2,
    ArrowRight,
    Inbox
} from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [stats, setStats] = useState({
        totalProjects: 0,
        processing: 0,
        completed: 0,
        totalVideos: 0,
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const data = await api.getProjects();
            setProjects(data);
            setStats({
                totalProjects: data.length,
                processing: data.filter((p) => p.status === "processing").length,
                completed: data.filter((p) => p.status === "completed").length,
                totalVideos: data.length,
            });
        } catch (error) {
            addToast({
                title: "Error",
                description: getErrorMessage(error),
                variant: "error",
            });
            // Use mock data as fallback
            setStats({
                totalProjects: 0,
                processing: 0,
                completed: 0,
                totalVideos: 0,
            });
        } finally {
            setLoading(false);
        }
    };

    const quickActions = [
        {
            title: "Upload Video",
            description: "Start a new video analysis project",
            icon: Upload,
            href: "/annotate",
            color: "from-blue-500 to-cyan-500",
            borderColor: "hover:border-blue-500",
            hoverText: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
        },
        {
            title: "View Analytics",
            description: "Analyze your video insights",
            icon: BarChart3,
            href: "/analyze",
            color: "from-purple-500 to-pink-500",
            borderColor: "hover:border-purple-500",
            hoverText: "group-hover:text-purple-600 dark:group-hover:text-purple-400",
        },
        {
            title: "Generate Reports",
            description: "Create detailed reports",
            icon: FileText,
            href: "/reports",
            color: "from-orange-500 to-red-500",
            borderColor: "hover:border-orange-500",
            hoverText: "group-hover:text-orange-600 dark:group-hover:text-orange-400",
        },
    ];

    const statCards = [
        {
            title: "Total Projects",
            value: stats.totalProjects,
            icon: Video,
            trend: "+12%",
            trendUp: true,
        },
        {
            title: "Processing",
            value: stats.processing,
            icon: Clock,
            trend: `${stats.processing} active`,
            trendUp: false,
        },
        {
            title: "Completed",
            value: stats.completed,
            icon: CheckCircle2,
            trend: "+5 today",
            trendUp: true,
        },
        {
            title: "Total Videos",
            value: stats.totalVideos,
            icon: FileText,
            trend: "All time",
            trendUp: false,
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8">
                <Breadcrumb />

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Welcome back! Here's an overview of your video analytics.
                    </p>
                </div>

                {/* Stats Grid */}
                {loading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <StatCardSkeleton key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        {statCards.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <motion.div
                                    key={stat.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Card className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                            <CardTitle className="text-sm font-medium">
                                                {stat.title}
                                            </CardTitle>
                                            <Icon className="h-4 w-4 text-muted-foreground" />
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-2xl font-bold">{stat.value}</div>
                                            <p className={`text-xs flex items-center gap-1 ${stat.trendUp ? "text-green-600" : "text-muted-foreground"
                                                }`}>
                                                {stat.trendUp && <TrendingUp className="h-3 w-3" />}
                                                {stat.trend}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {/* Quick Actions */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {quickActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <motion.div
                                    key={action.title}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.1 + 0.4 }}
                                    onClick={() => router.push(action.href)}
                                >
                                    <Card className={`group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent ${action.borderColor}`}>
                                        <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                                        <CardHeader>
                                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                            <CardTitle className={`transition-colors duration-300 ${action.hoverText}`}>
                                                {action.title}
                                            </CardTitle>
                                            <CardDescription>{action.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Button variant="ghost" className="group-hover:translate-x-2 transition-transform duration-300 p-0 hover:bg-transparent">
                                                Get Started
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>Your latest video processing activities</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <ListSkeleton count={3} />
                        ) : projects.length === 0 ? (
                            <EmptyState
                                icon={Inbox}
                                title="No projects yet"
                                description="Start by uploading a video to begin your analysis journey"
                                action={{
                                    label: "Upload Video",
                                    onClick: () => router.push("/annotate"),
                                }}
                            />
                        ) : (
                            <div className="space-y-4">
                                {projects.slice(0, 3).map((project, i) => (
                                    <div key={project.project_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <CheckCircle2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{project.video_filename}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Status: {project.status} • {new Date(project.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={() => router.push("/analyze")}>
                                            View
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
