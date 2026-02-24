'use client'
import React, { useState, useRef } from 'react'
import { Plus, X, Info } from 'lucide-react'
import { type Condition } from '@/lib/api'

const CONDITION_TYPES: { label: string; value: Condition['type'] }[] = [
    { label: 'Header', value: 'header' },
    { label: 'Query', value: 'query' },
    { label: 'Body', value: 'body' },
    { label: 'Path', value: 'path' },
]

const OPERATORS: { label: string; value: Condition['operator'] }[] = [
    { label: 'Equals', value: 'equals' },
    { label: 'Contains', value: 'contains' },
    { label: 'Regex', value: 'regex' },
]

interface ConditionsBuilderProps {
    conditions: Condition[]
    onChange: (conditions: Condition[]) => void
}

const ConditionsBuilder = ({ conditions, onChange }: ConditionsBuilderProps) => {
    const [tooltipOpen, setTooltipOpen] = useState(false)
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
    const infoRef = useRef<HTMLDivElement>(null)

    const handleMouseEnter = () => {
        if (infoRef.current) {
            const rect = infoRef.current.getBoundingClientRect()
            const TOOLTIP_WIDTH = 240 // w-60
            const TOOLTIP_HEIGHT = 85 // approx height

            let left = rect.left
            // Prevent horizontal overflow
            if (left + TOOLTIP_WIDTH > window.innerWidth - 10) {
                left = window.innerWidth - TOOLTIP_WIDTH - 10
            }

            let top = rect.bottom + 6
            // Prevent vertical overflow (show above icon if not enough space below)
            if (top + TOOLTIP_HEIGHT > window.innerHeight - 10) {
                top = rect.top - TOOLTIP_HEIGHT - 6
            }

            setTooltipPos({ top, left })
        }
        setTooltipOpen(true)
    }

    const addCondition = () => {
        onChange([...conditions, { type: 'header', field: '', operator: 'equals', value: '' }])
    }

    const removeCondition = (index: number) => {
        onChange(conditions.filter((_, i) => i !== index))
    }

    const updateCondition = (index: number, patch: Partial<Condition>) => {
        onChange(conditions.map((c, i) => (i === index ? { ...c, ...patch } : c)))
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <div
                    ref={infoRef}
                    className="flex items-center gap-1.5"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={() => setTooltipOpen(false)}
                >
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Conditions
                    </span>
                    <Info size={13} className="text-muted-foreground/60 hover:text-foreground transition-colors cursor-help" />
                </div>

                {/* Fixed Tooltip */}
                {tooltipOpen && (
                    <div
                        style={{ position: 'fixed', top: tooltipPos.top, left: tooltipPos.left, zIndex: 9999 }}
                        className="w-60 p-2.5 bg-popover border border-border rounded-lg shadow-lg text-[11px] text-muted-foreground animate-in fade-in zoom-in-95 duration-100"
                    >
                        <strong className="text-foreground font-medium block mb-0.5">Multiple conditions = AND</strong>
                        If you add multiple conditions, the incoming request must match <span className="text-foreground font-medium">all</span> of them for this response to be selected.
                    </div>
                )}

                <button
                    onClick={addCondition}
                    className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
                >
                    <Plus size={12} />
                    Add
                </button>
            </div>

            {conditions.length === 0 && (
                <p className="text-xs text-muted-foreground/60 italic">
                    No conditions — this response will always be in the selection pool.
                </p>
            )}

            <div className="flex flex-col gap-1.5">
                {conditions.map((cond, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-1.5 bg-muted/40 rounded-md px-2 py-1.5 border border-border/40"
                    >
                        {/* Type */}
                        <select
                            value={cond.type}
                            onChange={(e) => updateCondition(i, { type: e.target.value as Condition['type'] })}
                            className="bg-muted border border-border rounded px-1.5 py-1 text-[11px] text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring min-w-[70px]"
                        >
                            {CONDITION_TYPES.map((ct) => (
                                <option key={ct.value} value={ct.value}>{ct.label}</option>
                            ))}
                        </select>

                        {/* Field */}
                        <input
                            type="text"
                            value={cond.field}
                            onChange={(e) => updateCondition(i, { field: e.target.value })}
                            placeholder="field"
                            className="bg-background border border-border rounded px-2 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring flex-1 min-w-[60px]"
                        />

                        {/* Operator */}
                        <select
                            value={cond.operator}
                            onChange={(e) => updateCondition(i, { operator: e.target.value as Condition['operator'] })}
                            className="bg-muted border border-border rounded px-1.5 py-1 text-[11px] text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring min-w-[78px]"
                        >
                            {OPERATORS.map((op) => (
                                <option key={op.value} value={op.value}>{op.label}</option>
                            ))}
                        </select>

                        {/* Value */}
                        <input
                            type="text"
                            value={cond.value}
                            onChange={(e) => updateCondition(i, { value: e.target.value })}
                            placeholder="value"
                            className="bg-background border border-border rounded px-2 py-1 text-[11px] text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-ring flex-1 min-w-[60px]"
                        />

                        {/* Remove */}
                        <button
                            onClick={() => removeCondition(i)}
                            className="text-muted-foreground hover:text-destructive transition-colors cursor-pointer p-0.5 flex-shrink-0"
                            title="Remove condition"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ConditionsBuilder
