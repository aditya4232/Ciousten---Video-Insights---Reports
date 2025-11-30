import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ModernNavigation } from "@/components/ui/modern-navigation";
import { ToastProvider } from "@/components/ui/toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Ciousten - Video Insights & Reports",
    description: "AI-powered video analytics platform with SAM2, YOLO, and OpenRouter",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <ThemeProvider defaultTheme="system" storageKey="ciousten-theme">
                    <ToastProvider>
                        <ModernNavigation />
                        {children}
                        <div className="fixed bottom-2 right-4 text-xs text-muted-foreground/50 pointer-events-none select-none z-50">
                            Aditya Shenvi
                        </div>
                    </ToastProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
