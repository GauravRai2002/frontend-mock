'use client'
import React, { useState } from 'react'
import { Plus, Trash2, Star, Check, Loader2 } from 'lucide-react'
import { type MockResponse } from '@/lib/api'

interface ResponsesPanelProps {
    responses: MockResponse[]
    activeResponseId: string | null
    onSelect: (r: MockResponse) => void
    onAdd: () => Promise<void>
    onDelete: (responseId: string) => Promise<void>
    onSetDefault: (responseId: string) => Promise<void>
    onWeightChange: (responseId: string, weight: number) => Promise<void>
}

const STATUS_COLOR: Record<number, string> = {
    2: 'text-[#22C55E]',
    3: 'text-[#3B82F6]',
    4: 'text-[#F97316]',
    5: 'text-[#EF4444]',
}

/** Compute each response's share of total weight as a percentage (0–100) */
function weightPercent(responses: MockResponse[], r: MockResponse): number {
    const total = responses.reduce((sum, x) => sum + (x.weight ?? 100), 0)
    if (total === 0) return 0
    return Math.round(((r.weight ?? 100) / total) * 100)
}

const ResponsesPanel = ({
    responses,
    activeResponseId,
    onSelect,
    onAdd,
    onDelete,
    onSetDefault,
    onWeightChange,
}: ResponsesPanelProps) => {
    const [adding, setAdding] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null)
    const [savingWeightId, setSavingWeightId] = useState<string | null>(null)
    // Local draft weights — committed on blur
    const [draftWeights, setDraftWeights] = useState<Record<string, string>>({})

    const handleAdd = async () => {
        setAdding(true)
        try { await onAdd() } finally { setAdding(false) }
    }

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        setDeletingId(id)
        try { await onDelete(id) } finally { setDeletingId(null) }
    }

    const handleSetDefault = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation()
        setSettingDefaultId(id)
        try { await onSetDefault(id) } finally { setSettingDefaultId(null) }
    }

    const handleWeightBlur = async (id: string) => {
        const raw = draftWeights[id]
        if (raw === undefined) return                 // no change
        const parsed = parseInt(raw, 10)
        if (isNaN(parsed) || parsed < 1) {
            // Reset invalid draft
            setDraftWeights(prev => { const n = { ...prev }; delete n[id]; return n })
            return
        }
        try {
            setSavingWeightId(id)
            await onWeightChange(id, parsed)
        } finally {
            setSavingWeightId(null)
            setDraftWeights(prev => { const n = { ...prev }; delete n[id]; return n })
        }
    }

    const statusClass = (code: number) => STATUS_COLOR[Math.floor(code / 100)] ?? 'text-muted-foreground'

    return (
        <div className="flex flex-col w-52 flex-shrink-0 border-r border-border bg-muted/20 h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border flex-shrink-0">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Responses</span>
                <button
                    onClick={handleAdd}
                    disabled={adding}
                    title="Add response"
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                >
                    {adding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={13} />}
                </button>
            </div>

            {/* Total weight hint */}
            {responses.length > 1 && (
                <div className="px-3 py-1.5 text-[10px] text-muted-foreground border-b border-border/50 bg-muted/10">
                    Weighted random — higher weight = more likely
                </div>
            )}

            {/* List */}
            <div className="flex-1 overflow-y-auto py-1">
                {responses.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center px-3 py-4">No responses yet</p>
                )}
                {responses.map(r => {
                    const pct = responses.length > 1 ? weightPercent(responses, r) : null
                    const draftVal = draftWeights[r.response_id]
                    const displayWeight = draftVal !== undefined ? draftVal : String(r.weight ?? 100)
                    const isSavingWeight = savingWeightId === r.response_id

                    return (
                        <div
                            key={r.response_id}
                            onClick={() => onSelect(r)}
                            className={`group flex flex-col gap-1 px-3 py-2.5 cursor-pointer transition-colors relative
                ${activeResponseId === r.response_id ? 'bg-sidebar-accent border-l-2 border-primary' : 'hover:bg-sidebar-accent/60'}`}
                        >
                            {/* Row 1: status code + name + actions */}
                            <div className="flex items-center gap-1.5">
                                <span className={`text-[11px] font-bold font-mono ${statusClass(r.status_code)}`}>
                                    {r.status_code}
                                </span>
                                <span className="text-[11px] text-foreground truncate flex-1">{r.name || 'Response'}</span>

                                {/* Default badge */}
                                {r.is_default === 1 && (
                                    <span title="Default" className="flex-shrink-0 inline-flex">
                                        <Check size={10} className="text-primary" />
                                    </span>
                                )}

                                {/* Set default (non-default only) */}
                                {r.is_default !== 1 && (
                                    <button
                                        onClick={e => handleSetDefault(e, r.response_id)}
                                        title="Set as default"
                                        className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-primary cursor-pointer flex-shrink-0"
                                    >
                                        {settingDefaultId === r.response_id
                                            ? <Loader2 size={10} className="animate-spin" />
                                            : <Star size={10} />}
                                    </button>
                                )}

                                {/* Delete */}
                                {responses.length > 1 && (
                                    <button
                                        onClick={e => handleDelete(e, r.response_id)}
                                        title="Delete response"
                                        className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive cursor-pointer flex-shrink-0"
                                    >
                                        {deletingId === r.response_id
                                            ? <Loader2 size={10} className="animate-spin" />
                                            : <Trash2 size={10} />}
                                    </button>
                                )}
                            </div>

                            {/* Row 2: weight input + probability bar (only when multiple responses) */}
                            {responses.length > 1 && (
                                <div className="flex items-center gap-2 mt-0.5" onClick={e => e.stopPropagation()}>
                                    {/* Weight numeric input */}
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <input
                                            type="number"
                                            min="1"
                                            value={displayWeight}
                                            onChange={e => setDraftWeights(prev => ({ ...prev, [r.response_id]: e.target.value }))}
                                            onBlur={() => handleWeightBlur(r.response_id)}
                                            onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                                            className="w-10 text-[10px] font-mono text-center bg-muted border border-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring appearance-none"
                                            title="Weight (higher = more likely to be selected)"
                                        />
                                        {isSavingWeight && <Loader2 size={9} className="animate-spin text-muted-foreground" />}
                                    </div>

                                    {/* Probability bar */}
                                    <div className="flex-1 flex items-center gap-1">
                                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary/70 rounded-full transition-all duration-300"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="text-[9px] text-muted-foreground w-6 text-right">{pct}%</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default ResponsesPanel
