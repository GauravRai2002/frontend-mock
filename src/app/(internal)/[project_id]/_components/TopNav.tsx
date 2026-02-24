'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Copy, Share2, Save, Loader2, AlertCircle } from 'lucide-react'

interface TopNavProps {
    projectName: string
    projectSlug: string
    saving?: boolean
    saveError?: string | null
    onSave?: () => void
}

const TopNav = ({ projectName, projectSlug, saving, saveError, onSave }: TopNavProps) => {
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
                    onClick={() => router.push('/dashboard')}
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
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-muted border border-border rounded-md text-xs text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all cursor-pointer font-mono"
                    title="Copy base URL"
                >
                    <span className="text-primary/70">/m/</span>
                    <span>{projectSlug}</span>
                    <Copy size={11} className="ml-1" />
                </button>

                {/* <button className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground border border-transparent hover:border-border rounded-md transition-all cursor-pointer">
                    <Share2 size={12} />
                    <span className="hidden sm:inline">Share</span>
                </button> */}

                <button
                    onClick={onSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                    {saving ? 'Saving…' : 'Save'}
                </button>
            </div>
        </div>
    )
}

export default TopNav