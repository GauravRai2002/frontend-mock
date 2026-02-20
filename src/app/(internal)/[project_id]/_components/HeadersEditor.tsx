'use client'
import React from 'react'
import { Plus, X } from 'lucide-react'

interface Header {
    key: string
    value: string
}

interface HeadersEditorProps {
    headers: Header[]
    onChange: (headers: Header[]) => void
}

const PRESET_HEADERS = [
    { key: 'Content-Type', value: 'application/json' },
    { key: 'X-Request-Id', value: '{{uuid}}' },
    { key: 'Cache-Control', value: 'no-cache' },
]

const HeadersEditor = ({ headers, onChange }: HeadersEditorProps) => {
    const addRow = () => onChange([...headers, { key: '', value: '' }])

    const updateRow = (index: number, field: 'key' | 'value', val: string) => {
        const updated = headers.map((h, i) => i === index ? { ...h, [field]: val } : h)
        onChange(updated)
    }

    const removeRow = (index: number) => {
        onChange(headers.filter((_, i) => i !== index))
    }

    const addPreset = (preset: Header) => {
        // don't add if key already exists
        if (headers.some(h => h.key === preset.key)) return
        onChange([...headers, preset])
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-auto p-4">
                {/* Column headers */}
                <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-2 px-1">
                    <span className="text-xs text-muted-foreground font-medium">Key</span>
                    <span className="text-xs text-muted-foreground font-medium">Value</span>
                    <span className="w-6" />
                </div>

                {/* Rows */}
                <div className="flex flex-col gap-1.5">
                    {headers.map((header, i) => (
                        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                            <input
                                type="text"
                                value={header.key}
                                onChange={(e) => updateRow(i, 'key', e.target.value)}
                                placeholder="Header-Name"
                                className="px-2.5 py-1.5 bg-muted border border-border rounded-md text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            <input
                                type="text"
                                value={header.value}
                                onChange={(e) => updateRow(i, 'value', e.target.value)}
                                placeholder="value"
                                className="px-2.5 py-1.5 bg-muted border border-border rounded-md text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            <button
                                onClick={() => removeRow(i)}
                                className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors cursor-pointer rounded"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Add row */}
                <button
                    onClick={addRow}
                    className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                    <Plus size={12} />
                    Add header
                </button>

                {/* Presets */}
                <div className="mt-6 pt-4 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Quick add</p>
                    <div className="flex flex-wrap gap-2">
                        {PRESET_HEADERS.map((preset) => (
                            <button
                                key={preset.key}
                                onClick={() => addPreset(preset)}
                                disabled={headers.some(h => h.key === preset.key)}
                                className="px-2.5 py-1 text-xs border border-border rounded-md text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed font-mono"
                            >
                                {preset.key}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HeadersEditor
