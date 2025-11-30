"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

export function Breadcrumb() {
    const pathname = usePathname()

    // Don't show breadcrumb on home page
    if (pathname === "/") return null

    const paths = pathname.split("/").filter(Boolean)

    const breadcrumbs = [
        { label: "Home", href: "/" },
        ...paths.map((path, index) => ({
            label: path.charAt(0).toUpperCase() + path.slice(1),
            href: "/" + paths.slice(0, index + 1).join("/"),
        })),
    ]

    return (
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-2">
                    {index === 0 && <Home className="h-4 w-4" />}
                    {index > 0 && <ChevronRight className="h-4 w-4" />}
                    {index === breadcrumbs.length - 1 ? (
                        <span className="font-medium text-foreground">{crumb.label}</span>
                    ) : (
                        <Link
                            href={crumb.href}
                            className="hover:text-foreground transition-colors"
                        >
                            {crumb.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    )
}
