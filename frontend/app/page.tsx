"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Brain, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

            {/* Hero Section */}
            <main className="container mx-auto px-4 py-16">
                <motion.div
                    className="text-center max-w-4xl mx-auto mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <motion.div
                        className="inline-block mb-4"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <div className="flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-full">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                AI-Powered Video Analytics
                            </span>
                        </div>
                    </motion.div>

                    <motion.h2
                        className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        Video Insights & Reports
                    </motion.h2>

                    <motion.p
                        className="text-xl text-muted-foreground mb-8 leading-relaxed"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        Segment, understand, and report on videos with <span className="font-semibold text-foreground">SAM2</span> + <span className="font-semibold text-foreground">OpenRouter</span>
                    </motion.p>

                    <motion.div
                        className="flex gap-4 justify-center mb-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.6 }}
                    >
                        <Link href="/annotate">
                            <Button size="lg" className="gap-2 group">
                                <Video className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                Start Annotating
                            </Button>
                        </Link>
                        <Link href="/reports">
                            <Button size="lg" variant="outline" className="gap-2 group">
                                <FileText className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                View Reports
                            </Button>
                        </Link>
                    </motion.div>

                    <motion.p
                        className="text-sm text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                    >
                        Made by <a href="https://www.adityacuz.dev" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Aditya Shenvi</a> @2025
                    </motion.p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {[
                        {
                            icon: Video,
                            title: "Smart Segmentation",
                            description: "Powered by Meta SAM2 and YOLO for accurate object detection and tracking",
                            features: ["CPU-optimized processing", "Frame-by-frame analysis", "Multi-class detection"],
                            color: "blue",
                        },
                        {
                            icon: Brain,
                            title: "AI Analysis",
                            description: "OpenRouter LLMs generate insights, anomalies, and dataset recommendations",
                            features: ["Natural language summaries", "Anomaly detection", "Dataset planning"],
                            color: "purple",
                        },
                        {
                            icon: FileText,
                            title: "Auto Reports",
                            description: "Professional Excel and PDF reports generated automatically",
                            features: ["Multi-sheet Excel workbooks", "Interactive charts", "PDF analysis reports"],
                            color: "pink",
                        },
                    ].map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
                        >
                            <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg group">
                                <CardHeader>
                                    <div className={`h-12 w-12 rounded-lg bg-${feature.color}-100 dark:bg-${feature.color}-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <feature.icon className={`h-6 w-6 text-${feature.color}-600 dark:text-${feature.color}-400`} />
                                    </div>
                                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                                    <CardDescription>
                                        {feature.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2 text-sm text-muted-foreground">
                                        {feature.features.map((item) => (
                                            <li key={item}>• {item}</li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Tech Stack */}
                <motion.div
                    className="mt-16 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2, duration: 0.6 }}
                >
                    <p className="text-sm text-muted-foreground mb-4">Powered by</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-muted-foreground">
                        {["Next.js 15", "FastAPI", "Meta SAM2", "YOLO", "OpenRouter", "Docker"].map((tech, index) => (
                            <motion.span
                                key={tech}
                                className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full border hover:border-primary/50 transition-colors cursor-default"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.3 + index * 0.05, duration: 0.3 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                {tech}
                            </motion.span>
                        ))}
                    </div>
                </motion.div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm mt-16">
                <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>© 2025 Ciousten. Open source project by Aditya Shenvi.</p>
                    <p className="mt-2">
                        <a href="https://www.adityacuz.dev" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                            www.adityacuz.dev
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
