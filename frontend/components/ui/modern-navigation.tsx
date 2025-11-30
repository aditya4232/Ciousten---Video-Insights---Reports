"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Video, Home, Upload, BarChart3, FileText, Settings, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";

export function ModernNavigation() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { href: "/", label: "Home", icon: Home },
        { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
        { href: "/annotate", label: "Annotate", icon: Upload },
        { href: "/analyze", label: "Analyze", icon: BarChart3 },
        { href: "/reports", label: "Reports", icon: FileText },
        { href: "/settings", label: "Settings", icon: Settings },
    ];

    return (
        <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="relative">
                            <Video className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/30 transition-all" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                            Ciousten
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant={isActive ? "default" : "ghost"}
                                        size="sm"
                                        className="relative group"
                                    >
                                        <Icon className="h-4 w-4 mr-2" />
                                        {item.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                                                transition={{ type: "spring", duration: 0.5 }}
                                            />
                                        )}
                                    </Button>
                                </Link>
                            );
                        })}
                        <ThemeToggle />
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex md:hidden items-center gap-2">
                        <ThemeToggle />
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden"
                        >
                            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden pb-4"
                        >
                            <div className="flex flex-col gap-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = pathname === item.href;

                                    return (
                                        <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                                            <Button
                                                variant={isActive ? "default" : "ghost"}
                                                size="sm"
                                                className="w-full justify-start"
                                            >
                                                <Icon className="h-4 w-4 mr-2" />
                                                {item.label}
                                            </Button>
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </nav>
    );
}
