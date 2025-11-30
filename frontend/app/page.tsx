import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video, Brain, FileText, Sparkles } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Video className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Ciousten
                        </h1>
                    </div>
                    <nav className="flex gap-4">
                        <Link href="/annotate">
                            <Button variant="ghost">Annotate</Button>
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

            {/* Hero Section */}
            <main className="container mx-auto px-4 py-16">
                <div className="text-center max-w-4xl mx-auto mb-16">
                    <div className="inline-block mb-4">
                        <div className="flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-full">
                            <Sparkles className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium text-primary">
                                AI-Powered Video Analytics
                            </span>
                        </div>
                    </div>

                    <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Video Insights & Reports
                    </h2>

                    <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                        Segment, understand, and report on videos with <span className="font-semibold text-foreground">SAM2</span> + <span className="font-semibold text-foreground">OpenRouter</span>
                    </p>

                    <div className="flex gap-4 justify-center mb-8">
                        <Link href="/annotate">
                            <Button size="lg" className="gap-2">
                                <Video className="h-5 w-5" />
                                Start Annotating
                            </Button>
                        </Link>
                        <Link href="/reports">
                            <Button size="lg" variant="outline" className="gap-2">
                                <FileText className="h-5 w-5" />
                                View Reports
                            </Button>
                        </Link>
                    </div>

                    <p className="text-sm text-muted-foreground">
                        Made by <a href="https://www.adityacuz.dev" target="_blank" rel="noopener noreferrer" className="font-semibold text-primary hover:underline">Aditya Shenvi</a> @2025
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                        <CardHeader>
                            <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                                <Video className="h-6 w-6 text-blue-600" />
                            </div>
                            <CardTitle className="text-xl">Smart Segmentation</CardTitle>
                            <CardDescription>
                                Powered by Meta SAM2 and YOLO for accurate object detection and tracking
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>• CPU-optimized processing</li>
                                <li>• Frame-by-frame analysis</li>
                                <li>• Multi-class detection</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                        <CardHeader>
                            <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                                <Brain className="h-6 w-6 text-purple-600" />
                            </div>
                            <CardTitle className="text-xl">AI Analysis</CardTitle>
                            <CardDescription>
                                OpenRouter LLMs generate insights, anomalies, and dataset recommendations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>• Natural language summaries</li>
                                <li>• Anomaly detection</li>
                                <li>• Dataset planning</li>
                            </ul>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                        <CardHeader>
                            <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
                                <FileText className="h-6 w-6 text-pink-600" />
                            </div>
                            <CardTitle className="text-xl">Auto Reports</CardTitle>
                            <CardDescription>
                                Professional Excel and PDF reports generated automatically
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>• Multi-sheet Excel workbooks</li>
                                <li>• Interactive charts</li>
                                <li>• PDF analysis reports</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Tech Stack */}
                <div className="mt-16 text-center">
                    <p className="text-sm text-muted-foreground mb-4">Powered by</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-muted-foreground">
                        <span className="px-4 py-2 bg-white rounded-full border">Next.js 15</span>
                        <span className="px-4 py-2 bg-white rounded-full border">FastAPI</span>
                        <span className="px-4 py-2 bg-white rounded-full border">Meta SAM2</span>
                        <span className="px-4 py-2 bg-white rounded-full border">YOLO</span>
                        <span className="px-4 py-2 bg-white rounded-full border">OpenRouter</span>
                        <span className="px-4 py-2 bg-white rounded-full border">Docker</span>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t bg-white/80 backdrop-blur-sm mt-16">
                <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
                    <p>© 2025 Ciousten. Open source project by Aditya Shenvi.</p>
                    <p className="mt-2">
                        <a href="https://www.adityacuz.dev" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                            www.adityacuz.dev
                        </a>
                    </p>
                </div>
            </footer>
        </div>
    );
}
