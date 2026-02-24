'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/nextjs'
import { Loader2, RefreshCw, AlertCircle, Clock, Globe, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react'
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

const STATUS_BG = (code: number) => {
    if (code < 300) return 'text-[#22C55E] bg-[#22C55E]/10'
    if (code < 400) return 'text-[#3B82F6] bg-[#3B82F6]/10'
    if (code < 500) return 'text-[#F97316] bg-[#F97316]/10'
    return 'text-[#EF4444] bg-[#EF4444]/10'
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

function tryPrettyJson(raw: string): string {
    try {
        return JSON.stringify(JSON.parse(raw), null, 2)
    } catch {
        return raw
    }
}

/** Copyable code block with a toolbar */
const CodeBlock = ({ label, content }: { label: string; content: string }) => {
    const [copied, setCopied] = useState(false)
    const handleCopy = () => {
        navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
    }
    return (
        <div className="rounded-md border border-border overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/60 border-b border-border">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
                <button onClick={handleCopy} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    {copied ? <Check size={10} className="text-primary" /> : <Copy size={10} />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-3 text-[11px] font-mono text-foreground overflow-auto max-h-52 leading-relaxed whitespace-pre-wrap break-all bg-background">{content}</pre>
        </div>
    )
}

/** Key-value headers table */
const HeadersTable = ({ raw }: { raw: string }) => {
    const entries = Object.entries(parseResponseHeaders(raw))
    if (entries.length === 0) return null
    return (
        <div className="rounded-md border border-border overflow-hidden">
            <table className="w-full text-left">
                <tbody>
                    {entries.map(([key, value]) => (
                        <tr key={key} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-3 py-1.5 text-[10px] font-medium text-foreground w-2/5 break-all align-top border-r border-border/50 bg-muted/20">{key}</td>
                            <td className="px-3 py-1.5 text-[10px] text-muted-foreground font-mono break-all align-top">{value as string}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

/** Centered divider section header */
const SectionHeader = ({ title }: { title: string }) => (
    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2.5 flex items-center gap-2">
        <span className="flex-1 h-px bg-border" />
        {title}
        <span className="flex-1 h-px bg-border" />
    </h3>
)

const Row = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
    <div className="flex items-start gap-3">
        <span className="text-muted-foreground w-8 flex-shrink-0 text-[11px] font-medium">{label}</span>
        <span className={`text-foreground break-all text-[11px] ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
)

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
                    <div className="flex flex-col gap-5 text-xs">

                        {/* ── Overview pill row ─────────────────────── */}
                        <div className="flex items-center gap-2 flex-wrap pb-1">
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md font-mono ${methodStyle(selected.request_method)}`}>
                                {selected.request_method}
                            </span>
                            <span className="text-sm font-mono text-foreground font-medium flex-1 break-all">{selected.request_path}</span>
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md font-mono ${STATUS_BG(selected.response_status)}`}>
                                {selected.response_status}
                            </span>
                            <span className="text-xs text-muted-foreground">{selected.response_time_ms}ms</span>
                        </div>

                        {/* ── Request meta ──────────────────────────── */}
                        <section>
                            <SectionHeader title="Request" />
                            <div className="flex flex-col gap-1.5">
                                <Row label="IP" value={selected.ip_address} mono />
                                <Row label="Time" value={new Date(selected.created_at).toLocaleString()} />
                                {selected.user_agent && <Row label="UA" value={selected.user_agent} />}
                            </div>
                        </section>

                        {/* ── Query params ──────────────────────────── */}
                        {selected.request_query && selected.request_query !== '{}' && (
                            <section>
                                <SectionHeader title="Query Params" />
                                <CodeBlock label="query" content={tryPrettyJson(selected.request_query)} />
                            </section>
                        )}

                        {/* ── Request body ──────────────────────────── */}
                        {selected.request_body && (
                            <section>
                                <SectionHeader title="Request Body" />
                                <CodeBlock label="body" content={tryPrettyJson(selected.request_body)} />
                            </section>
                        )}

                        {/* ── Request headers ───────────────────────── */}
                        {selected.request_headers && selected.request_headers !== '{}' && (
                            <section>
                                <SectionHeader title="Request Headers" />
                                <HeadersTable raw={selected.request_headers} />
                            </section>
                        )}

                        {/* ── Response meta ─────────────────────────── */}
                        <section>
                            <SectionHeader title="Response" />
                            <div className="flex flex-col gap-1.5">
                                <Row label="Status" value={String(selected.response_status)} mono />
                                <Row label="Time" value={`${selected.response_time_ms}ms`} mono />
                            </div>
                        </section>

                        {/* ── Response headers ──────────────────────── */}
                        {selected.response_headers && selected.response_headers !== '{}' && (
                            <section>
                                <SectionHeader title="Response Headers" />
                                <HeadersTable raw={selected.response_headers} />
                            </section>
                        )}

                        {/* ── Response body ─────────────────────────── */}
                        {selected.response_body && (
                            <section>
                                <SectionHeader title="Response Body" />
                                <CodeBlock label="body" content={tryPrettyJson(selected.response_body)} />
                            </section>
                        )}

                    </div>
                )}
            </div>
        </div>
    )
}

export default RequestLogsTab
