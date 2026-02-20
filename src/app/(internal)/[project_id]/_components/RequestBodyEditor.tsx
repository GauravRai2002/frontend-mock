'use client'
import React from 'react'
import { RotateCcw, Check, Info } from 'lucide-react'

const CONTENT_TYPES = [
    { label: 'JSON', value: 'application/json' },
    { label: 'Form Data', value: 'application/x-www-form-urlencoded' },
    { label: 'XML', value: 'application/xml' },
    { label: 'Plain Text', value: 'text/plain' },
]

const EXAMPLE_BODIES: Record<string, string> = {
    'application/json': `{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin"
}`,
    'application/x-www-form-urlencoded': `name=John+Doe&email=john%40example.com&role=admin`,
    'application/xml': `<?xml version="1.0" encoding="UTF-8"?>
<user>
  <name>John Doe</name>
  <email>john@example.com</email>
  <role>admin</role>
</user>`,
    'text/plain': `John Doe | john@example.com | admin`,
}

interface RequestBodyEditorProps {
    requestBody: string
    requestBodyContentType: string
    onBodyChange: (v: string) => void
    onContentTypeChange: (v: string) => void
}

const RequestBodyEditor = ({
    requestBody,
    requestBodyContentType,
    onBodyChange,
    onContentTypeChange,
}: RequestBodyEditorProps) => {
    const isJson = requestBodyContentType === 'application/json'

    const isValidJson = (() => {
        if (!isJson || !requestBody.trim()) return true
        try { JSON.parse(requestBody); return true } catch { return false }
    })()

    const formatJson = () => {
        try {
            const parsed = JSON.parse(requestBody)
            onBodyChange(JSON.stringify(parsed, null, 2))
        } catch { /* ignore */ }
    }

    const handleContentTypeChange = (ct: string) => {
        onContentTypeChange(ct)
        // Pre-fill with example if body is currently empty
        if (!requestBody.trim()) {
            onBodyChange(EXAMPLE_BODIES[ct] || '')
        }
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Controls bar */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/30 flex-shrink-0 flex-wrap gap-y-2">
                {/* Content Type */}
                <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground">Content-Type</label>
                    <select
                        value={requestBodyContentType}
                        onChange={(e) => handleContentTypeChange(e.target.value)}
                        className="bg-muted border border-border rounded-md px-2 py-1 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring text-foreground"
                    >
                        {CONTENT_TYPES.map((ct) => (
                            <option key={ct.value} value={ct.value}>{ct.label}</option>
                        ))}
                    </select>
                </div>

                {/* Validation + format */}
                <div className="ml-auto flex items-center gap-2">
                    {isJson && requestBody.trim() && (
                        isValidJson ? (
                            <span className="flex items-center gap-1 text-[10px] text-[#22C55E]">
                                <Check size={10} strokeWidth={2.5} /> Valid JSON
                            </span>
                        ) : (
                            <span className="text-[10px] text-[#EF4444]">Invalid JSON</span>
                        )
                    )}
                    {isJson && (
                        <button
                            onClick={formatJson}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            title="Format JSON"
                        >
                            <RotateCcw size={11} />
                            Format
                        </button>
                    )}
                </div>
            </div>

            {/* Info banner */}
            <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-border flex-shrink-0">
                <Info size={12} className="text-primary/70 flex-shrink-0" />
                <p className="text-xs text-muted-foreground">
                    This defines the expected request body schema. MockBird uses it for documentation — the mock response is independent.
                </p>
            </div>

            {/* Body textarea */}
            <div className="flex-1 overflow-hidden relative">
                <textarea
                    value={requestBody}
                    onChange={(e) => onBodyChange(e.target.value)}
                    spellCheck={false}
                    placeholder={EXAMPLE_BODIES[requestBodyContentType] || '// Request body...'}
                    className="
            code-input w-full h-full bg-background text-foreground text-xs
            p-4 resize-none focus:outline-none
            font-mono leading-relaxed
          "
                />
            </div>
        </div>
    )
}

export default RequestBodyEditor
