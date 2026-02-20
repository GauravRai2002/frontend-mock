'use client'
import React from 'react'
import { Plus, Trash2 } from 'lucide-react'

const METHOD_COLORS: Record<string, string> = {
    GET: 'text-[#3B82F6]',
    POST: 'text-[#22C55E]',
    PUT: 'text-[#F97316]',
    DELETE: 'text-[#EF4444]',
    PATCH: 'text-[#A855F7]',
    OPTIONS: 'text-[#64748B]',
    HEAD: 'text-[#14B8A6]',
}

export interface MockEndpoint {
    id: string
    method: string
    path: string
    name: string
    statusCode: number
    delay: number
    body: string
    requestBody: string
    requestBodyContentType: string
    headers: { key: string; value: string }[]
    contentType: string
}

interface EndpointListProps {
    endpoints: MockEndpoint[]
    activeId: string | null
    onSelect: (id: string) => void
    onAdd: () => void
    onDelete: (id: string) => void
}

const EndpointList = ({ endpoints, activeId, onSelect, onAdd, onDelete }: EndpointListProps) => {
    return (
        <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border flex-shrink-0 w-[240px]">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-sidebar-border flex-shrink-0">
                <span className="text-xs font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                    Endpoints
                </span>
                <button
                    onClick={onAdd}
                    className="text-muted-foreground hover:text-primary transition-colors cursor-pointer p-0.5 rounded"
                    title="Add endpoint"
                >
                    <Plus size={14} />
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto py-1">
                {endpoints.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-2 px-4">
                        <p className="text-xs text-muted-foreground text-center">No endpoints yet</p>
                        <button
                            onClick={onAdd}
                            className="text-xs text-primary hover:underline cursor-pointer"
                        >
                            + Add endpoint
                        </button>
                    </div>
                ) : (
                    endpoints.map((ep) => (
                        <div
                            key={ep.id}
                            onClick={() => onSelect(ep.id)}
                            className={`
                group flex items-center gap-2 px-3 py-2 cursor-pointer
                transition-colors duration-75 relative
                ${activeId === ep.id
                                    ? 'bg-sidebar-accent border-r-2 border-primary'
                                    : 'hover:bg-sidebar-accent/60'}
              `}
                        >
                            {/* Method badge */}
                            <span className={`text-[10px] font-bold flex-shrink-0 w-[42px] ${METHOD_COLORS[ep.method] || 'text-muted-foreground'}`}>
                                {ep.method}
                            </span>

                            {/* Name + path stacked */}
                            <div className="flex flex-col min-w-0 flex-1">
                                {ep.name && (
                                    <span className="text-xs text-foreground font-medium truncate leading-tight">
                                        {ep.name}
                                    </span>
                                )}
                                <span className={`font-mono truncate leading-tight ${ep.name ? 'text-[10px] text-muted-foreground' : 'text-xs text-foreground'}`}>
                                    {ep.path}
                                </span>
                            </div>

                            {/* Delete */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(ep.id) }}
                                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all cursor-pointer flex-shrink-0"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Add button at bottom */}
            <div className="p-2 border-t border-sidebar-border flex-shrink-0">
                <button
                    onClick={onAdd}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-muted-foreground hover:text-primary border border-dashed border-border hover:border-primary/50 rounded-md transition-all cursor-pointer"
                >
                    <Plus size={12} />
                    Add endpoint
                </button>
            </div>
        </div>
    )
}

export default EndpointList
