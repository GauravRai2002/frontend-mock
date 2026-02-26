'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Copy, Share2, Save, Loader2, AlertCircle, Check } from 'lucide-react'

interface TopNavProps {
    projectName: string
    projectSlug: string
    saving?: boolean
    saveError?: string | null
    hasUnsavedChanges?: boolean
    onSave?: () => void
    onBack?: () => void
}

const TopNav = ({ projectName, projectSlug, saving, saveError, hasUnsavedChanges, onSave, onBack }: TopNavProps) => {
    const router = useRouter()
    const baseUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001'}/m/${projectSlug}`

    const copyBaseUrl = () => {
        navigator.clipboard.writeText(baseUrl).catch(() => { })
    }

    return (
        <div className="w-full px-4 py-2.5 flex items-center justify-between border-b border-border bg-card flex-shrink-0 gap-2">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-sm min-w-0">
                <button
                    onClick={() => onBack ? onBack() : router.push('/dashboard')}
                    className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex-shrink-0"
                >
                    Projects
                </button>
                <ChevronRight size={13} className="text-muted-foreground/50 flex-shrink-0" />
                <span className="text-foreground font-medium truncate">{projectName}</span>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
                {/* Save error indicator */}
                {saveError && (
                    <span className="flex items-center gap-1 text-[11px] text-destructive">
                        <AlertCircle size={12} /> {saveError}
                    </span>
                )}

                {/* Base URL chip */}
                <button
                    onClick={copyBaseUrl}
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-muted border border-border rounded-md text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all cursor-pointer font-mono mr-2"
                    title="Copy base URL"
                >
                    <span className="text-primary/70">/m/</span>
                    <span>{projectSlug}</span>
                    <Copy size={11} className="ml-1" />
                </button>

                {/* Auto-save status indicator */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md bg-muted/50 border border-transparent select-none min-w-[120px] justify-center">
                    {saving ? (
                        <>
                            <Loader2 size={12} className="animate-spin text-muted-foreground" />
                            <span className="text-muted-foreground">Saving...</span>
                        </>
                    ) : hasUnsavedChanges ? (
                        <>
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span className="text-muted-foreground">Unsaved changes</span>
                        </>
                    ) : (
                        <>
                            <Check size={12} className="text-emerald-500" />
                            <span className="text-muted-foreground delay-500 transition-opacity">Saved</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default TopNav