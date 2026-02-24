'use client'
import React, { useState } from 'react'
import MethodDropdown from './MethodDropdown'
import ResponseEditor from './ResponseEditor'
import HeadersEditor from './HeadersEditor'
import RequestBodyEditor from './RequestBodyEditor'
import ResponsesPanel from './ResponsesPanel'
import RequestLogsTab from './RequestLogsTab'
import { Loader2 } from 'lucide-react'
import { type MockEndpoint } from './EndpointList'
import { type MockResponse, type Condition } from '@/lib/api'

type Tab = 'body' | 'response' | 'req_headers' | 'res_headers' | 'settings' | 'logs'
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'

const BODY_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

interface EndpointEditorProps {
    endpoint: MockEndpoint
    onChange: (updated: MockEndpoint) => void
    projectSlug?: string
    mockId?: string   // the real backend mock_id for logs
    responses?: MockResponse[]
    activeResponseId?: string | null
    onResponseSelect?: (r: MockResponse) => void
    onResponseAdd?: () => Promise<void>
    onResponseDelete?: (responseId: string) => Promise<void>
    onResponseSetDefault?: (responseId: string) => Promise<void>
    onResponseWeightChange?: (responseId: string, weight: number) => Promise<void>
    onDelete?: () => void
    onToggleActive?: (isActive: boolean) => Promise<void>
    onDuplicate?: () => Promise<void>
    isDuplicating?: boolean
    isDeleting?: boolean
    conditions?: Condition[]
    onConditionsChange?: (conditions: Condition[]) => void
}

const EndpointEditor = ({
    endpoint,
    onChange,
    projectSlug = 'your-project',
    mockId,
    responses = [],
    activeResponseId = null,
    onResponseSelect,
    onResponseAdd,
    onResponseDelete,
    onResponseSetDefault,
    onResponseWeightChange,
    onDelete,
    onToggleActive,
    onDuplicate,
    isDuplicating,
    isDeleting,
    conditions = [],
    onConditionsChange,
}: EndpointEditorProps) => {
    const supportsBody = BODY_METHODS.has(endpoint.method.toUpperCase())
    const [activeTab, setActiveTab] = useState<Tab>('response')
    const [togglingActive, setTogglingActive] = useState(false)

    const handleMethodChange = (m: Method) => {
        const nextSupports = BODY_METHODS.has(m)
        onChange({ ...endpoint, method: m })
        if (!nextSupports && activeTab === 'body') setActiveTab('response')
        if (nextSupports && activeTab === 'response') setActiveTab('body')
    }

    const update = (patch: Partial<MockEndpoint>) => onChange({ ...endpoint, ...patch })

    const handleToggleActive = async () => {
        if (!onToggleActive) return
        setTogglingActive(true)
        try { await onToggleActive(!(endpoint as any).is_active) } finally { setTogglingActive(false) }
    }

    const isActive = (endpoint as any).is_active !== false && (endpoint as any).is_active !== 0

    const tabs: { id: Tab; label: string; show: boolean }[] = [
        { id: 'body', label: 'Body', show: supportsBody },
        { id: 'req_headers', label: 'Req Headers', show: supportsBody },
        { id: 'response', label: 'Response', show: true },
        { id: 'res_headers', label: 'Res Headers', show: true },
        { id: 'logs', label: 'Logs', show: !!mockId },
        { id: 'settings', label: 'Settings', show: true },
    ]

    return (
        <div className="flex flex-col flex-1 h-full overflow-hidden">
            {/* URL Bar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-card flex-shrink-0 flex-wrap">
                <MethodDropdown active={endpoint.method as Method} setActive={handleMethodChange} />
                <div className="flex-1 min-w-[200px]">
                    <input
                        type="text"
                        value={endpoint.path}
                        onChange={(e) => update({ path: e.target.value })}
                        placeholder="/api/users/{id}"
                        className="w-full px-3 py-1.5 bg-muted border border-border rounded-md text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                </div>
                <input
                    type="text"
                    value={endpoint.name}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="Endpoint name"
                    className="w-36 px-3 py-1.5 bg-muted border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
            </div>

            {/* Tabs */}
            <div className="flex items-center px-4 border-b border-border bg-card flex-shrink-0">
                {tabs.filter(t => t.show).map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-all cursor-pointer flex items-center gap-1.5
              ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                    >
                        {tab.label}
                        {(tab.id === 'body' || tab.id === 'req_headers') && (
                            <span className="text-[9px] px-1 py-0.5 rounded bg-primary/15 text-primary font-semibold leading-none">REQ</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden flex">
                {/* Response panel sidebar — only shown on response tab */}
                {activeTab === 'response' && responses.length > 0 && onResponseSelect && (
                    <ResponsesPanel
                        responses={responses}
                        activeResponseId={activeResponseId}
                        onSelect={onResponseSelect}
                        onAdd={onResponseAdd ?? (async () => { })}
                        onDelete={onResponseDelete ?? (async () => { })}
                        onSetDefault={onResponseSetDefault ?? (async () => { })}
                        onWeightChange={onResponseWeightChange ?? (async () => { })}
                    />
                )}

                <div className="flex-1 overflow-hidden">
                    {activeTab === 'body' && supportsBody && (
                        <RequestBodyEditor
                            requestBody={endpoint.requestBody}
                            requestBodyContentType={endpoint.requestBodyContentType}
                            onBodyChange={(requestBody: string) => update({ requestBody })}
                            onContentTypeChange={(requestBodyContentType: string) => update({ requestBodyContentType })}
                        />
                    )}
                    {activeTab === 'response' && (
                        <ResponseEditor
                            body={endpoint.body}
                            statusCode={endpoint.statusCode}
                            delay={endpoint.delay}
                            contentType={endpoint.contentType}
                            conditions={conditions}
                            onBodyChange={(body: string) => update({ body })}
                            onStatusCodeChange={(statusCode: number) => update({ statusCode })}
                            onDelayChange={(delay: number) => update({ delay })}
                            onContentTypeChange={(contentType: string) => update({ contentType })}
                            onConditionsChange={onConditionsChange ?? (() => { })}
                        />
                    )}
                    {activeTab === 'req_headers' && supportsBody && (
                        <HeadersEditor
                            headers={endpoint.expectedHeaders}
                            onChange={(expectedHeaders: { key: string; value: string }[]) => update({ expectedHeaders })}
                        />
                    )}
                    {activeTab === 'res_headers' && (
                        <HeadersEditor
                            headers={endpoint.headers}
                            onChange={(headers: { key: string; value: string }[]) => update({ headers })}
                        />
                    )}
                    {activeTab === 'logs' && mockId && (
                        <RequestLogsTab mockId={mockId} />
                    )}
                    {activeTab === 'settings' && (
                        <div className="p-6 flex flex-col gap-6 overflow-auto h-full">
                            {/* Active toggle */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-foreground">Endpoint status</label>
                                <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2.5">
                                    <div>
                                        <p className="text-xs font-medium text-foreground">{isActive ? 'Active' : 'Inactive'}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {isActive ? 'Responding to requests' : 'Endpoint is paused — returns 404'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleToggleActive}
                                        disabled={togglingActive || !onToggleActive}
                                        className={`relative w-8 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0 disabled:opacity-50 ${isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isActive ? 'translate-x-3' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Mock URL */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-medium text-foreground">Mock URL</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        readOnly
                                        value={`${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001'}/m/${projectSlug}${endpoint.path}`}
                                        className="flex-1 px-3 py-1.5 bg-muted border border-border rounded-md text-xs font-mono text-muted-foreground focus:outline-none"
                                    />
                                    <button
                                        onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001'}/m/${projectSlug}${endpoint.path}`)}
                                        className="px-3 py-1.5 text-xs border border-border rounded-md hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                    >
                                        Copy URL
                                    </button>
                                    <button
                                        onClick={() => {
                                            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001'}/m/${projectSlug}${endpoint.path}`
                                            let curl = `curl -X ${endpoint.method} '${url}'`

                                            // Add headers (default Content-Type if body exists, plus any custom expected headers if it's a real API testing context, but usually we just test the mock itself)
                                            if (endpoint.requestBody && BODY_METHODS.has(endpoint.method.toUpperCase())) {
                                                curl += ` \\\n  -H 'Content-Type: ${endpoint.requestBodyContentType}'`
                                            }

                                            if (endpoint.requestBody && BODY_METHODS.has(endpoint.method.toUpperCase())) {
                                                // escape single quotes in body
                                                const safeBody = endpoint.requestBody.replace(/'/g, "'\\''")
                                                curl += ` \\\n  -d '${safeBody}'`
                                            }

                                            navigator.clipboard.writeText(curl)
                                        }}
                                        className="px-3 py-1.5 text-xs border border-border rounded-md hover:border-primary/50 text-muted-foreground hover:text-foreground transition-all cursor-pointer whitespace-nowrap"
                                    >
                                        Copy cURL
                                    </button>
                                </div>
                            </div>

                            {/* Duplicate */}
                            {onDuplicate && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs font-medium text-foreground">Duplicate endpoint</label>
                                    <button
                                        onClick={onDuplicate}
                                        disabled={isDuplicating}
                                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-foreground border border-border hover:border-primary/50 rounded-md transition-all cursor-pointer w-fit disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDuplicating && <Loader2 size={12} className="animate-spin" />}
                                        {isDuplicating ? 'Cloning...' : 'Clone this endpoint'}
                                    </button>
                                </div>
                            )}

                            {/* Delete */}
                            <div className="pt-4 border-t border-border">
                                <button
                                    onClick={onDelete}
                                    disabled={!onDelete || isDeleting}
                                    className="flex items-center gap-2 px-3 py-1.5 text-xs text-destructive border border-destructive/30 hover:bg-destructive/10 rounded-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    {isDeleting && <Loader2 size={12} className="animate-spin" />}
                                    {isDeleting ? 'Deleting...' : 'Delete endpoint'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default EndpointEditor
