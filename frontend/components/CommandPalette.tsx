"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
    Home,
    Upload,
    BarChart3,
    FileText,
    Settings,
    Search,
    Keyboard,
    Moon,
    Sun,
} from "lucide-react";

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const router = useRouter();

    // Toggle command palette with Cmd+K or Ctrl+K
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const runCommand = useCallback((command: () => void) => {
        setOpen(false);
        command();
    }, []);

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border rounded-lg hover:bg-accent transition-colors"
            >
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Search...</span>
                <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="overflow-hidden p-0 shadow-lg">
                    <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                        <Command.Input
                            placeholder="Type a command or search..."
                            className="flex h-11 w-full rounded-md bg-transparent py-3 px-4 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
                            <Command.Empty className="py-6 text-center text-sm">
                                No results found.
                            </Command.Empty>

                            <Command.Group heading="Navigation">
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/"))}
                                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                >
                                    <Home className="h-4 w-4" />
                                    <span>Home</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/dashboard"))}
                                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    <span>Dashboard</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/annotate"))}
                                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                >
                                    <Upload className="h-4 w-4" />
                                    <span>Upload Video</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/analyze"))}
                                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                >
                                    <BarChart3 className="h-4 w-4" />
                                    <span>Analyze</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/reports"))}
                                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span>Reports</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => runCommand(() => router.push("/settings"))}
                                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                >
                                    <Settings className="h-4 w-4" />
                                    <span>Settings</span>
                                </Command.Item>
                            </Command.Group>

                            <Command.Group heading="Actions">
                                <Command.Item
                                    onSelect={() => runCommand(() => window.open("/docs", "_blank"))}
                                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                >
                                    <FileText className="h-4 w-4" />
                                    <span>View Documentation</span>
                                </Command.Item>
                                <Command.Item
                                    onSelect={() => runCommand(() => {
                                        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
                                        window.open(`${apiUrl}/docs`, "_blank");
                                    })}
                                    className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent aria-selected:bg-accent"
                                >
                                    <Keyboard className="h-4 w-4" />
                                    <span>API Documentation</span>
                                </Command.Item>
                            </Command.Group>

                            <Command.Separator className="h-px bg-border my-1" />

                            <Command.Group heading="Help">
                                <Command.Item className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm opacity-50">
                                    <Keyboard className="h-4 w-4" />
                                    <span>Press ⌘K to toggle this menu</span>
                                </Command.Item>
                            </Command.Group>
                        </Command.List>
                    </Command>
                </DialogContent>
            </Dialog>
        </>
    );
}
