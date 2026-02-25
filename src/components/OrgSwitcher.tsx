'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useOrganizationList, useOrganization } from '@clerk/nextjs'
import { Building2, Check, ChevronsUpDown, Plus, Loader2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useOrgActions } from '@/hooks/use-organizations'

interface OrgSwitcherProps {
    collapsed?: boolean
}

export default function OrgSwitcher({ collapsed = false }: OrgSwitcherProps) {
    const { organization } = useOrganization()
    const { userMemberships, setActive, isLoaded } = useOrganizationList({
        userMemberships: { infinite: true },
    })
    const { create } = useOrgActions()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const [newName, setNewName] = useState('')
    const [createLoading, setCreateLoading] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)
    const ref = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)

    // Close when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
                setCreating(false)
                setNewName('')
                setCreateError(null)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    // Focus input when create form opens
    useEffect(() => {
        if (creating) setTimeout(() => inputRef.current?.focus(), 50)
    }, [creating])

    if (!isLoaded) return null

    const orgs = userMemberships?.data ?? []
    const activeId = organization?.id ?? null

    // Hide entirely if user has no orgs and create form isn't open
    if (orgs.length === 0 && !open) return null

    const handleSelect = async (orgId: string) => {
        if (!setActive) return
        await setActive({ organization: orgId })
        setOpen(false)
        router.refresh()
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const name = newName.trim()
        if (!name) return
        try {
            setCreateLoading(true)
            setCreateError(null)
            const org = await create({ name })
            if (setActive) await setActive({ organization: org.orgId })
            setNewName('')
            setCreating(false)
            setOpen(false)
            router.refresh()
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Failed to create organization'
            setCreateError(msg)
        } finally {
            setCreateLoading(false)
        }
    }

    const activeOrg = orgs.find(m => m.organization.id === activeId)
    const displayName = activeOrg?.organization.name ?? 'Select org'
    const initial = activeOrg?.organization.name[0]?.toUpperCase() ?? '?'

    /* ── Collapsed: icon-only button + dropdown to the right ── */
    if (collapsed) {
        return (
            <div ref={ref} className="relative flex justify-center">
                <button
                    onClick={() => setOpen(o => !o)}
                    title={displayName}
                    className="w-7 h-7 rounded-md bg-sidebar-accent/60 border border-sidebar-border flex items-center justify-center text-[10px] font-bold text-sidebar-foreground hover:bg-sidebar-accent transition-colors cursor-pointer"
                >
                    {activeOrg ? initial : <Building2 size={12} />}
                </button>
                {open && (
                    <OrgDropdown
                        orgs={orgs}
                        activeId={activeId}
                        onSelect={handleSelect}
                        side="right"
                        creating={creating}
                        setCreating={setCreating}
                        newName={newName}
                        setNewName={setNewName}
                        onCreateSubmit={handleCreate}
                        createLoading={createLoading}
                        createError={createError}
                        inputRef={inputRef}
                    />
                )}
            </div>
        )
    }

    /* ── Expanded: full-width button + dropdown opens upward ── */
    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-sidebar-border bg-sidebar-accent/40 hover:bg-sidebar-accent transition-colors text-xs text-sidebar-foreground cursor-pointer"
            >
                <div className="w-5 h-5 rounded-[4px] bg-primary/20 flex items-center justify-center flex-shrink-0">
                    {activeOrg
                        ? <span className="text-[10px] font-bold text-primary">{initial}</span>
                        : <Building2 size={10} className="text-primary" />
                    }
                </div>
                <span className="flex-1 text-left truncate">{displayName}</span>
                <ChevronsUpDown size={12} className="flex-shrink-0 text-muted-foreground" />
            </button>

            {open && (
                <OrgDropdown
                    orgs={orgs}
                    activeId={activeId}
                    onSelect={handleSelect}
                    side="bottom"
                    creating={creating}
                    setCreating={setCreating}
                    newName={newName}
                    setNewName={setNewName}
                    onCreateSubmit={handleCreate}
                    createLoading={createLoading}
                    createError={createError}
                    inputRef={inputRef}
                />
            )}
        </div>
    )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type OrgEntry = { organization: { id: string; name: string; slug: string | null } }

interface OrgDropdownProps {
    orgs: OrgEntry[]
    activeId: string | null
    onSelect: (id: string) => void
    side: 'bottom' | 'right'
    creating: boolean
    setCreating: (v: boolean) => void
    newName: string
    setNewName: (v: string) => void
    onCreateSubmit: (e: React.FormEvent) => void
    createLoading: boolean
    createError: string | null
    inputRef: React.MutableRefObject<HTMLInputElement | null>
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────

function OrgDropdown({
    orgs, activeId, onSelect, side,
    creating, setCreating, newName, setNewName,
    onCreateSubmit, createLoading, createError, inputRef,
}: OrgDropdownProps) {
    const posClass = side === 'right'
        ? 'left-full top-0 ml-2'
        : 'bottom-full left-0 right-0 mb-1'   // opens upward

    return (
        <div className={`absolute ${posClass} z-50 min-w-[180px] bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-scaleIn`}>
            <div className="px-3 py-2 border-b border-border">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Workspaces
                </p>
            </div>

            {/* Org list — min 40px, max 200px */}
            <div className="overflow-y-auto" style={{ minHeight: '40px', maxHeight: '200px' }}>
                {orgs.length === 0 && (
                    <p className="text-[11px] text-muted-foreground px-3 py-3">No organizations yet</p>
                )}
                {orgs.map(m => (
                    <OrgRow
                        key={m.organization.id}
                        name={m.organization.name}
                        icon={<span className="text-[10px] font-bold">{m.organization.name[0]?.toUpperCase()}</span>}
                        active={activeId === m.organization.id}
                        onSelect={() => onSelect(m.organization.id)}
                    />
                ))}
            </div>

            {/* Create organization */}
            <div className="border-t border-border">
                {creating ? (
                    <form onSubmit={onCreateSubmit} className="p-2 flex flex-col gap-1.5">
                        <input
                            ref={inputRef}
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Organization name"
                            className="w-full px-2.5 py-1.5 text-xs bg-muted border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                        {createError && (
                            <p className="text-[10px] text-destructive">{createError}</p>
                        )}
                        <div className="flex gap-1.5">
                            <button
                                type="submit"
                                disabled={createLoading || !newName.trim()}
                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                            >
                                {createLoading && <Loader2 size={10} className="animate-spin" />}
                                Create
                            </button>
                            <button
                                type="button"
                                onClick={() => { setCreating(false); setNewName('') }}
                                className="px-2 py-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted cursor-pointer"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setCreating(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                        <Plus size={12} /> Create organization
                    </button>
                )}
            </div>
        </div>
    )
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function OrgRow({ name, icon, active, onSelect }: {
    name: string
    icon: React.ReactNode
    active: boolean
    onSelect: () => void
}) {
    return (
        <button
            onClick={onSelect}
            className={`
                w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors cursor-pointer
                ${active
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }
            `}
        >
            <div className="w-5 h-5 rounded-[4px] bg-muted flex items-center justify-center flex-shrink-0 text-foreground">
                {icon}
            </div>
            <span className="flex-1 truncate">{name}</span>
            {active && <Check size={12} className="text-primary flex-shrink-0" />}
        </button>
    )
}
