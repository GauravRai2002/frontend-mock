'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Loader2, RefreshCw, AlertCircle, Clock, Globe, ChevronLeft, ChevronRight } from 'lucide-react'
import { getMockRequestLogs, parseResponseHeaders, type RequestLog } from '@/lib/api'

interface RequestLogsTabProps {
    mockId: string
}

const METHOD_COLOR: Record<string, string> = {
    GET: 'text-[#22C55E] bg-[#22C55E]/10',
    POST: 'text-[#3B82F6] bg-[#3B82F6]/10',
    PUT: 'text-[#F97316] bg-[#F97316]/10',
    PATCH: 'text-[#A855F7] bg-[#A855F7]/10',
    DELETE: 'text-[#EF4444] bg-[#EF4444]/10',
}

const STATUS_COLOR = (code: number) => {
    if (code < 300) return 'text-[#22C55E]'
    if (code < 400) return 'text-[#3B82F6]'
    if (code < 500) return 'text-[#F97316]'
    return 'text-[#EF4444]'
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const s = Math.floor(diff / 1000)
    if (s < 60) return `${s}s ago`
    const m = Math.floor(s / 60)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return new Date(dateStr).toLocaleDateString()
}

const RequestLogsTab = ({ mockId }: RequestLogsTabProps) => {
    const { getToken } = useAuth()
    const [logs, setLogs] = useState<RequestLog[]>([])
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [selected, setSelected] = useState<RequestLog | null>(null)

    const fetchLogs = useCallback(async (page = 1) => {
        try {
            setLoading(true)
            setError(null)
            const token = await getToken()
            if (!token) throw new Error('Not authenticated')
            const result = await getMockRequestLogs(token, mockId, { page, limit: 20 })
            setLogs(result.data)
            setPagination(result.pagination)
        } catch (err: any) {
            setError(err.message ?? 'Failed to load logs')
        } finally {
            setLoading(false)
        }
    }, [getToken, mockId])

    useEffect(() => { fetchLogs() }, [fetchLogs])

    const methodStyle = (m: string) => METHOD_COLOR[m.toUpperCase()] ?? 'text-muted-foreground bg-muted'

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* Log list */}
            <div className="flex flex-col w-1/2 border-r border-border overflow-hidden">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-border flex-shrink-0 bg-muted/20">
                    <span className="text-xs text-muted-foreground">
                        {pagination.total} request{pagination.total !== 1 ? 's' : ''}
                    </span>
                    <button
                        onClick={() => fetchLogs(pagination.page)}
                        disabled={loading}
                        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                        <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {loading && (
                        <div className="flex items-center justify-center h-24 gap-2 text-muted-foreground">
                            <Loader2 size={14} className="animate-spin" />
                            <span className="text-xs">Loading…</span>
                        </div>
                    )}
                    {!loading && error && (
                        <div className="flex flex-col items-center justify-center h-24 gap-2 text-muted-foreground">
                            <AlertCircle size={14} className="text-destructive" />
                            <span className="text-xs">{error}</span>
                        </div>
                    )}
                    {!loading && !error && logs.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-28 gap-2 text-muted-foreground">
                            <Globe size={18} />
                            <p className="text-xs">No requests yet — hit your mock URL to see logs</p>
                        </div>
                    )}
                    {!loading && logs.map(log => (
                        <div
                            key={log.log_id}
                            onClick={() => setSelected(log)}
                            className={`flex items-center gap-2.5 px-4 py-2.5 cursor-pointer border-b border-border/50 hover:bg-muted/40 transition-colors
                ${selected?.log_id === log.log_id ? 'bg-muted/60 border-l-2 border-l-primary' : ''}`}
                        >
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${methodStyle(log.request_method)}`}>
                                {log.request_method}
                            </span>
                            <span className="text-xs font-mono text-foreground truncate flex-1">{log.request_path}</span>
                            <span className={`text-xs font-mono font-semibold ${STATUS_COLOR(log.response_status)}`}>
                                {log.response_status}
                            </span>
                            <span className="text-xs text-muted-foreground flex-shrink-0">{log.response_time_ms}ms</span>
                            <span className="text-[10px] text-muted-foreground flex-shrink-0">{timeAgo(log.created_at)}</span>
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-2 border-t border-border flex-shrink-0 bg-muted/10">
                        <button
                            onClick={() => fetchLogs(pagination.page - 1)}
                            disabled={pagination.page <= 1 || loading}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
                        >
                            <ChevronLeft size={13} />
                        </button>
                        <span className="text-xs text-muted-foreground">
                            {pagination.page} / {pagination.totalPages}
                        </span>
                        <button
                            onClick={() => fetchLogs(pagination.page + 1)}
                            disabled={pagination.page >= pagination.totalPages || loading}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-40 cursor-pointer"
                        >
                            <ChevronRight size={13} />
                        </button>
                    </div>
                )}
            </div>

            {/* Detail panel */}
            <div className="flex-1 overflow-y-auto p-4">
                {!selected ? (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                        <Clock size={18} />
                        <p className="text-xs">Select a log entry to see details</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 text-xs">
                        {/* Request */}
                        <section>
                            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Request</h3>
                            <div className="flex flex-col gap-1">
                                <Row label="Method" value={selected.request_method} mono />
                                <Row label="Path" value={selected.request_path} mono />
                                <Row label="IP" value={selected.ip_address} mono />
                                <Row label="UA" value={selected.user_agent} />
                                <Row label="Time" value={new Date(selected.created_at).toLocaleString()} />
                                {selected.request_query && selected.request_query !== '{}' && (
                                    <div>
                                        <span className="text-muted-foreground">Query: </span>
                                        <pre className="mt-1 p-2 bg-muted rounded text-[10px] overflow-auto">{
                                            JSON.stringify(JSON.parse(selected.request_query), null, 2)
                                        }</pre>
                                    </div>
                                )}
                                {selected.request_body && (
                                    <div>
                                        <span className="text-muted-foreground">Body: </span>
                                        <pre className="mt-1 p-2 bg-muted rounded text-[10px] overflow-auto">{selected.request_body}</pre>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Response */}
                        <section>
                            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Response</h3>
                            <div className="flex flex-col gap-1">
                                <Row label="Status" value={String(selected.response_status)} mono />
                                <Row label="Time" value={`${selected.response_time_ms}ms`} mono />
                            </div>
                        </section>

                        {/* Request headers */}
                        {selected.request_headers && selected.request_headers !== '{}' && (
                            <section>
                                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Request Headers</h3>
                                <pre className="p-2 bg-muted rounded text-[10px] overflow-auto">
                                    {JSON.stringify(parseResponseHeaders(selected.request_headers), null, 2)}
                                </pre>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div className="flex items-start gap-2">
        <span className="text-muted-foreground w-12 flex-shrink-0">{label}</span>
        <span className={`text-foreground break-all ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
)

export default RequestLogsTab
