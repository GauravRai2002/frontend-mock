'use client'
import React, { useRef } from 'react'
import { RotateCcw, Check } from 'lucide-react'
import ConditionsBuilder from './ConditionsBuilder'
import { type Condition } from '@/lib/api'

const STATUS_CODES = [200, 201, 204, 400, 401, 403, 404, 409, 422, 500, 502, 503]
const CONTENT_TYPES = [
    { label: 'JSON', value: 'application/json' },
    { label: 'XML', value: 'application/xml' },
    { label: 'Plain Text', value: 'text/plain' },
    { label: 'HTML', value: 'text/html' },
]

const STATUS_COLORS: Record<string, string> = {
    '2': 'text-[#22C55E]',
    '3': 'text-[#3B82F6]',
    '4': 'text-[#F97316]',
    '5': 'text-[#EF4444]',
}

function getStatusColor(code: number) {
    return STATUS_COLORS[String(code)[0]] || 'text-muted-foreground'
}

const DEFAULT_JSON = `{
  "success": true,
  "data": {
    "id": "{{uuid}}",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "timestamp": "{{iso_date}}"
}`

interface ResponseEditorProps {
    body: string
    statusCode: number
    delay: number
    contentType: string
    conditions: Condition[]
    onBodyChange: (v: string) => void
    onStatusCodeChange: (v: number) => void
    onDelayChange: (v: number) => void
    onContentTypeChange: (v: string) => void
    onConditionsChange: (v: Condition[]) => void
}

const ResponseEditor = ({
    body,
    statusCode,
    delay,
    contentType,
    conditions,
    onBodyChange,
    onStatusCodeChange,
    onDelayChange,
    onContentTypeChange,
    onConditionsChange,
}: ResponseEditorProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const formatJson = () => {
        try {
            const parsed = JSON.parse(body)
            onBodyChange(JSON.stringify(parsed, null, 2))
        } catch {
            // not valid JSON, ignore
        }
    }

    const isValidJson = (() => {
        try { JSON.parse(body); return true } catch { return false }
    })()

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Controls bar */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/30 flex-shrink-0 flex-wrap gap-y-2">
                {/* Status Code */}
                <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Status</label>
                    <select
                        value={statusCode}
                        onChange={(e) => onStatusCodeChange(Number(e.target.value))}
                        className={`
              bg-muted border border-border rounded-md px-2 py-1 text-xs font-mono font-bold cursor-pointer
              focus:outline-none focus:ring-1 focus:ring-ring ${getStatusColor(statusCode)}
            `}
                    >
                        {STATUS_CODES.map((code) => (
                            <option key={code} value={code} className={getStatusColor(code)}>
                                {code}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Content Type */}
                <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Type</label>
                    <select
                        value={contentType}
                        onChange={(e) => onContentTypeChange(e.target.value)}
                        className="bg-muted border border-border rounded-md px-2 py-1 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                    >
                        {CONTENT_TYPES.map((ct) => (
                            <option key={ct.value} value={ct.value}>{ct.label}</option>
                        ))}
                    </select>
                </div>

                {/* Delay */}
                <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Delay</label>
                    <div className="flex items-center gap-1.5">
                        <input
                            type="range"
                            min={0}
                            max={10000}
                            step={100}
                            value={delay}
                            onChange={(e) => onDelayChange(Number(e.target.value))}
                            className="w-20 h-1 accent-primary cursor-pointer"
                        />
                        <span className="text-xs font-mono text-muted-foreground w-14">
                            {delay === 0 ? 'none' : `${delay}ms`}
                        </span>
                    </div>
                </div>

                {/* Format + valid JSON indicator */}
                <div className="ml-auto flex items-center gap-2">
                    {contentType === 'application/json' && (
                        isValidJson ? (
                            <span className="flex items-center gap-1 text-[10px] text-[#22C55E]">
                                <Check size={10} strokeWidth={2.5} /> Valid JSON
                            </span>
                        ) : (
                            <span className="text-[10px] text-[#EF4444]">Invalid JSON</span>
                        )
                    )}
                    <button
                        onClick={formatJson}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        title="Format JSON"
                    >
                        <RotateCcw size={11} />
                        Format
                    </button>
                </div>
            </div>

            {/* Body editor */}
            <div className="flex-1 overflow-hidden relative">
                <textarea
                    ref={textareaRef}
                    value={body}
                    onChange={(e) => onBodyChange(e.target.value)}
                    spellCheck={false}
                    className="
            code-input w-full h-full bg-background text-foreground text-xs
            p-4 resize-none focus:outline-none
            font-mono leading-relaxed
          "
                    placeholder={DEFAULT_JSON}
                />
            </div>

            {/* Conditions section */}
            <div className="border-t border-border px-4 py-3 flex-shrink-0">
                <ConditionsBuilder conditions={conditions} onChange={onConditionsChange} />
            </div>
        </div>
    )
}

export default ResponseEditor
