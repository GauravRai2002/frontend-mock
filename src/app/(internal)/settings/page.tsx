'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useOrganization } from '@clerk/nextjs'
import {
    Shield,
    UserPlus,
    Users,
    Loader2,
    AlertCircle,
    Building2,
    MoreHorizontal,
} from 'lucide-react'
import { useOrgDetail, useOrgMembers, useOrgActions } from '@/hooks/use-organizations'

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    'org:admin': { label: 'Admin', color: 'bg-amber-500/15 text-amber-400' },
    'org:member': { label: 'Member', color: 'bg-blue-500/15 text-blue-400' },
}

function roleBadge(role: string) {
    const r = ROLE_LABELS[role] ?? { label: role, color: 'bg-muted text-muted-foreground' }
    return (
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.color}`}>
            {r.label}
        </span>
    )
}

// Dropdown rendered at fixed position to escape overflow:hidden parents
function MemberActionMenu({
    membershipId,
    role,
    onRoleChange,
    onRemove,
    loading,
}: {
    membershipId: string
    role: string
    onRoleChange: (id: string, role: string) => void
    onRemove: (id: string) => void
    loading: boolean
}) {
    const [open, setOpen] = useState(false)
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })
    const btnRef = useRef<HTMLButtonElement>(null)

    // Close on outside click
    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [open])

    const handleOpen = () => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect()
            setMenuPos({
                top: rect.bottom + window.scrollY + 4,
                right: window.innerWidth - rect.right,
            })
        }
        setOpen(v => !v)
    }

    return (
        <>
            <button
                ref={btnRef}
                onClick={handleOpen}
                className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
                {loading
                    ? <Loader2 size={14} className="animate-spin" />
                    : <MoreHorizontal size={14} />}
            </button>

            {open && (
                <div
                    style={{ position: 'fixed', top: menuPos.top, right: menuPos.right, zIndex: 9999 }}
                    className="w-44 bg-popover border border-border rounded-lg shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100"
                >
                    {role === 'org:member' && (
                        <button
                            onClick={() => { onRoleChange(membershipId, 'org:admin'); setOpen(false) }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors cursor-pointer text-foreground"
                        >
                            Promote to Admin
                        </button>
                    )}
                    {role === 'org:admin' && (
                        <button
                            onClick={() => { onRoleChange(membershipId, 'org:member'); setOpen(false) }}
                            className="w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors cursor-pointer text-foreground"
                        >
                            Demote to Member
                        </button>
                    )}
                    <button
                        onClick={() => { onRemove(membershipId); setOpen(false) }}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-destructive/10 text-destructive transition-colors cursor-pointer"
                    >
                        Remove from org
                    </button>
                </div>
            )}
        </>
    )
}

const SettingsPage = () => {
    const { organization, membership } = useOrganization()
    const orgId = organization?.id ?? null
    const isAdmin = membership?.role === 'org:admin'

    const { org, loading: orgLoading } = useOrgDetail(orgId)
    const { members, totalCount, loading: membersLoading, refetch: refetchMembers } = useOrgMembers(orgId)
    const { create, invite, removeMember, updateRole } = useOrgActions()

    // ── Create org form ──────────────────────────────────────────────────
    const [createName, setCreateName] = useState('')
    const [createSlug, setCreateSlug] = useState('')
    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState<string | null>(null)

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!createName.trim()) return
        try {
            setCreating(true)
            setCreateError(null)
            await create({ name: createName.trim(), slug: createSlug.trim() || undefined })
            window.location.reload()
        } catch (err: any) {
            setCreateError(err.message ?? 'Failed to create organization')
        } finally {
            setCreating(false)
        }
    }

    // ── Invite form ──────────────────────────────────────────────────────
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState('org:member')
    const [inviting, setInviting] = useState(false)
    const [inviteError, setInviteError] = useState<string | null>(null)
    const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!orgId || !inviteEmail.trim()) return
        try {
            setInviting(true)
            setInviteError(null)
            setInviteSuccess(null)
            await invite(orgId, { emailAddress: inviteEmail.trim(), role: inviteRole })
            setInviteSuccess(`Invitation sent to ${inviteEmail}`)
            setInviteEmail('')
        } catch (err: any) {
            setInviteError(err.message ?? 'Failed to send invitation')
        } finally {
            setInviting(false)
        }
    }

    // ── Member actions ───────────────────────────────────────────────────
    const [actionLoading, setActionLoading] = useState<string | null>(null)

    const handleRemove = async (membershipId: string) => {
        if (!orgId) return
        try {
            setActionLoading(membershipId)
            await removeMember(orgId, membershipId)
            refetchMembers()
        } catch (err: any) {
            alert(err.message ?? 'Failed to remove member')
        } finally {
            setActionLoading(null)
        }
    }

    const handleRoleChange = async (membershipId: string, newRole: string) => {
        if (!orgId) return
        try {
            setActionLoading(membershipId)
            await updateRole(orgId, membershipId, newRole)
            refetchMembers()
        } catch (err: any) {
            alert(err.message ?? 'Failed to update role')
        } finally {
            setActionLoading(null)
        }
    }

    // ── No org → show create form ────────────────────────────────────────
    if (!orgId) {
        return (
            <div className="flex-1 h-screen bg-background flex items-center justify-center p-6">
                <div className="w-full max-w-md bg-card border border-border rounded-xl p-8 shadow-lg">
                    <div className="flex flex-col items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Building2 size={22} className="text-primary" />
                        </div>
                        <h1 className="text-xl font-bold text-foreground">Create an Organization</h1>
                        <p className="text-sm text-muted-foreground text-center">
                            Organizations let you collaborate with your team on shared projects.
                        </p>
                    </div>

                    <form onSubmit={handleCreate} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-foreground">Organization name</label>
                            <input
                                type="text"
                                value={createName}
                                onChange={(e) => setCreateName(e.target.value)}
                                placeholder="Acme Corp"
                                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium text-foreground">Slug (optional)</label>
                            <input
                                type="text"
                                value={createSlug}
                                onChange={(e) => setCreateSlug(e.target.value)}
                                placeholder="acme-corp"
                                className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                        </div>

                        {createError && (
                            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                                <AlertCircle size={14} /> {createError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={creating || !createName.trim()}
                            className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {creating && <Loader2 size={14} className="animate-spin" />}
                            Create Organization
                        </button>
                    </form>
                </div>
            </div>
        )
    }

    // ── Loading ──────────────────────────────────────────────────────────
    if (orgLoading || membersLoading) {
        return (
            <div className="flex-1 h-screen bg-background flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Loading organization…</span>
            </div>
        )
    }

    return (
        <div className="flex-1 h-screen bg-background overflow-auto">
            <div className="max-w-3xl mx-auto p-8 flex flex-col gap-8">
                {/* ─── Org Info ───────────────────────────────────── */}
                <section>
                    <h1 className="text-2xl font-bold text-foreground">{org?.name ?? 'Organization'}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{org?.slug}</span>
                        <span className="flex items-center gap-1">
                            <Users size={13} />
                            {org?.membersCount ?? totalCount} member{(org?.membersCount ?? totalCount) !== 1 ? 's' : ''}
                        </span>
                    </div>
                </section>

                {/* ─── Invite (admin only) ─────────────────────────── */}
                {isAdmin && (
                    <section className="bg-card border border-border rounded-xl p-5">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2 mb-4">
                            <UserPlus size={16} className="text-primary" />
                            Invite a Member
                        </h2>
                        <form onSubmit={handleInvite} className="flex items-end gap-3 flex-wrap">
                            <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                                <label className="text-xs font-medium text-muted-foreground">Email address</label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="member@example.com"
                                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1 w-32">
                                <label className="text-xs font-medium text-muted-foreground">Role</label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
                                >
                                    <option value="org:member">Member</option>
                                    <option value="org:admin">Admin</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                disabled={inviting || !inviteEmail.trim()}
                                className="px-5 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {inviting && <Loader2 size={14} className="animate-spin" />}
                                Invite
                            </button>
                        </form>
                        {inviteError && (
                            <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-lg mt-3">
                                <AlertCircle size={14} /> {inviteError}
                            </div>
                        )}
                        {inviteSuccess && (
                            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 px-3 py-2 rounded-lg mt-3">
                                ✓ {inviteSuccess}
                            </div>
                        )}
                    </section>
                )}

                {/* ─── Members Table ──────────────────────────────── */}
                {/* Note: no overflow-hidden here so fixed-position dropdowns aren't clipped */}
                <section className="bg-card border border-border rounded-xl">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between rounded-t-xl">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Shield size={16} className="text-primary" />
                            Members
                        </h2>
                        <span className="text-xs text-muted-foreground">{totalCount} total</span>
                    </div>

                    <div className="divide-y divide-border">
                        {members.map((m) => (
                            <div key={m.membershipId} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors last:rounded-b-xl">
                                {/* Avatar */}
                                {m.user.imageUrl ? (
                                    <img src={m.user.imageUrl} alt="" className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                                        <span className="text-xs font-bold text-primary">
                                            {(m.user.firstName?.[0] || m.user.email?.[0] || '?').toUpperCase()}
                                        </span>
                                    </div>
                                )}

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">
                                        {[m.user.firstName, m.user.lastName].filter(Boolean).join(' ') || m.user.email}
                                    </p>
                                    <p className="text-xs text-muted-foreground truncate">{m.user.email}</p>
                                </div>

                                {/* Role badge */}
                                {roleBadge(m.role)}

                                {/* Actions — admin only */}
                                {isAdmin && (
                                    <MemberActionMenu
                                        membershipId={m.membershipId}
                                        role={m.role}
                                        onRoleChange={handleRoleChange}
                                        onRemove={handleRemove}
                                        loading={actionLoading === m.membershipId}
                                    />
                                )}
                            </div>
                        ))}

                        {members.length === 0 && (
                            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
                                No members found
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    )
}

export default SettingsPage
