import { createContext, useContext, useState, useCallback, ReactNode } from "react"

export interface ToastProps {
    id: string
    title?: string
    description?: string
    variant?: "default" | "success" | "error" | "warning"
}

const toastVariants = {
    default: "bg-background border",
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    error: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    warning: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800",
}

const ToastContext = createContext<{
    toasts: ToastProps[]
    addToast: (toast: Omit<ToastProps, "id">) => void
    removeToast: (id: string) => void
}>({
    toasts: [],
    addToast: () => { },
    removeToast: () => { },
})

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastProps[]>([])

    const addToast = useCallback((toast: Omit<ToastProps, "id">) => {
        const id = Math.random().toString(36).substr(2, 9)
        setToasts((prev) => [...prev, { ...toast, id }])

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 5000)
    }, [])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }, [])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`${toastVariants[toast.variant || "default"]} p-4 rounded-lg shadow-lg border animate-in slide-in-from-right`}
                    >
                        {toast.title && (
                            <div className="font-semibold mb-1">{toast.title}</div>
                        )}
                        {toast.description && (
                            <div className="text-sm text-muted-foreground">{toast.description}</div>
                        )}
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error("useToast must be used within ToastProvider")
    }
    return context
}
