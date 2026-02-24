'use client'
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { X, AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

type ToastVariant = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    message: string
    variant: ToastVariant
    duration: number
}

interface ToastContextValue {
    toast: (message: string, variant?: ToastVariant, duration?: number) => void
    success: (message: string) => void
    error: (message: string) => void
    warning: (message: string) => void
    info: (message: string) => void
}

// ─── Context ────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within a ToastProvider')
    return ctx
}

// ─── Variant Styles ─────────────────────────────────────────────────────────

const VARIANT_CONFIG: Record<ToastVariant, { icon: React.ReactNode; border: string; bg: string; text: string }> = {
    success: {
        icon: <CheckCircle2 size={16} />,
        border: 'border-green-500/30',
        bg: 'bg-green-500/10',
        text: 'text-green-400',
    },
    error: {
        icon: <AlertCircle size={16} />,
        border: 'border-destructive/30',
        bg: 'bg-destructive/10',
        text: 'text-destructive',
    },
    warning: {
        icon: <AlertTriangle size={16} />,
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
    },
    info: {
        icon: <Info size={16} />,
        border: 'border-blue-500/30',
        bg: 'bg-blue-500/10',
        text: 'text-blue-400',
    },
}

// ─── Single Toast Item ──────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
    const [exiting, setExiting] = useState(false)
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const config = VARIANT_CONFIG[toast.variant]

    useEffect(() => {
        timerRef.current = setTimeout(() => {
            setExiting(true)
            setTimeout(() => onDismiss(toast.id), 200)
        }, toast.duration)
        return () => { if (timerRef.current) clearTimeout(timerRef.current) }
    }, [toast.id, toast.duration, onDismiss])

    return (
        <div
            className={`
                flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-lg
                ${config.border} ${config.bg}
                transition-all duration-200
                ${exiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}
            `}
            style={{ animation: exiting ? 'none' : 'toastSlideIn 0.25s ease-out' }}
        >
            <span className={`flex-shrink-0 mt-0.5 ${config.text}`}>{config.icon}</span>
            <p className="text-sm text-foreground flex-1 leading-relaxed">{toast.message}</p>
            <button
                onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 200) }}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 mt-0.5 cursor-pointer"
            >
                <X size={14} />
            </button>
        </div>
    )
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])
    const idCounter = useRef(0)

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const addToast = useCallback((message: string, variant: ToastVariant = 'info', duration = 5000) => {
        const id = `toast-${++idCounter.current}-${Date.now()}`
        setToasts(prev => [...prev.slice(-4), { id, message, variant, duration }]) // max 5 at once
    }, [])

    const value: ToastContextValue = {
        toast: addToast,
        success: useCallback((msg: string) => addToast(msg, 'success', 4000), [addToast]),
        error: useCallback((msg: string) => addToast(msg, 'error', 6000), [addToast]),
        warning: useCallback((msg: string) => addToast(msg, 'warning', 5000), [addToast]),
        info: useCallback((msg: string) => addToast(msg, 'info', 4000), [addToast]),
    }

    return (
        <ToastContext.Provider value={value}>
            {children}

            {/* Toast Container — fixed bottom-right */}
            <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map(t => (
                    <div key={t.id} className="pointer-events-auto">
                        <ToastItem toast={t} onDismiss={dismiss} />
                    </div>
                ))}
            </div>

            {/* Animation keyframe */}
            <style jsx global>{`
                @keyframes toastSlideIn {
                    from { opacity: 0; transform: translateX(20px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </ToastContext.Provider>
    )
}
