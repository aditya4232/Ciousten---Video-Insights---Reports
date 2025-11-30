"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Brain, FileText, Sparkles, AlertTriangle, Activity, Zap, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-hidden">

            {/* Hero Section */}
            <main className="container mx-auto px-4 pt-20 pb-16 relative">
                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse" />

                <motion.div
                    className="text-center max-w-5xl mx-auto mb-20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full mb-6"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                        </span>
                        <span className="text-sm font-medium text-primary">
                            New in V2: Anomaly Detection & Activity Recognition
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-6xl md:text-7xl font-bold mb-6 tracking-tight"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        Video Analytics, <br />
                        <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Reimagined.
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        Transform raw footage into actionable insights with <span className="font-semibold text-foreground">Ciousten V2</span>.
                        Now featuring advanced anomaly detection, domain-specific modes, and auto-generated dataset cards.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    >
                        <Link href="/annotate">
                            <Button size="lg" className="h-12 px-8 text-lg gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                                <Video className="h-5 w-5" />
                                Start Analyzing
                            </Button>
                        </Link>
                        <Link href="/reports">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-lg gap-2">
                                <FileText className="h-5 w-5" />
                                View Demo Reports
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Stats/Badges */}
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-t pt-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        {[
                            { label: "SAM2 + YOLO", value: "Dual Engine" },
                            { label: "OpenRouter", value: "LLM Powered" },
                            { label: "Privacy First", value: "Local Processing" },
                            { label: "Open Source", value: "MIT License" },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="font-bold text-lg">{stat.value}</div>
                                <div className="text-sm text-muted-foreground">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                {/* What's New in V2 Grid */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">What's New in V2</h2>
                        <p className="text-muted-foreground">Major upgrades to intelligence and usability</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {[
                            {
                                icon: AlertTriangle,
                                title: "Anomaly Detection",
                                description: "Automatically identify unusual spikes in object counts or behaviors using statistical heuristics.",
                                color: "orange",
                            },
                            {
                                icon: Activity,
                                title: "Activity Recognition",
                                description: "Classify video segments into meaningful activities like 'Traffic Congestion' or 'Customer Browsing'.",
                                color: "green",
                            },
                            {
                                icon: Layers,
                                title: "Domain Modes",
                                description: "Tailored analysis for Traffic, Retail, and Security domains with specific KPIs.",
                                color: "blue",
                            },
                            {
                                icon: Sparkles,
                                title: "Dataset Cards",
                                description: "One-click generation of comprehensive AI dataset documentation (Markdown).",
                                color: "purple",
                            },
                            {
                                icon: Zap,
                                title: "Dataset Export",
                                description: "Export your segmented data to standard COCO and YOLO formats for training custom models.",
                                color: "yellow",
                            },
                            {
                                icon: FileText,
                                title: "Enhanced Reports",
                                description: "Richer PDF and Excel reports with dedicated sections for anomalies and activities.",
                                color: "pink",
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                            >
                                <Card className="h-full border hover:border-primary/50 transition-all hover:shadow-md group bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                    <CardHeader>
                                        <div className={`h-12 w-12 rounded-xl bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <feature.icon className={`h-6 w-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                                        </div>
                                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                                        <CardDescription className="text-base mt-2">
                                            {feature.description}
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Video className="h-6 w-6 text-primary" />
                        <span className="text-xl font-bold">Ciousten V2</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-6">
                        Advanced Video Analytics for Everyone.
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Made by <a href="https://www.adityacuz.dev" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Aditya Shenvi</a> @2025
                    </p>
                </div>
            </footer>
        </div>
    );
}
